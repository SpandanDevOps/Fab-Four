/**
 * ============================================================
 * JAAGRUK - YOUR VOICE
 * Reports Router — REST API Endpoints
 * ============================================================
 *
 * ENDPOINTS:
 * POST   /api/reports              → Submit a new report
 * GET    /api/reports              → List all reports (admin)
 * GET    /api/reports/:id          → Get a specific report
 * PATCH  /api/reports/:id/status   → Update report status (admin)
 * GET    /api/reports/:id/verify   → Verify report on blockchain
 * GET    /api/blockchain/health    → Verify blockchain integrity
 * GET    /api/blockchain/chain     → Get full blockchain (admin)
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

import { blockchain, Blockchain, BlockData } from '../blockchain/BlockchainService.js';
import {
  insertReport,
  getReportById,
  getAllReports,
  updateReportStatus,
  insertEvidence,
  insertAuthorityRouting,
  saveBlockchainState,
  logAudit,
  getAuditLog,
  getEvidenceByReport,
} from '../services/DatabaseService.js';

const router = Router();

// ─── Validation Middleware ───────────────────────────────────

const validateReport = [
  body('category').notEmpty().withMessage('Category is required'),
  body('urgency').isIn(['Critical', 'High', 'Medium', 'Low']).withMessage('Invalid urgency level'),
  body('description').notEmpty().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('identity').isIn(['name', 'anonymous']).withMessage('Identity must be name or anonymous'),
  body('location').isObject().withMessage('Location is required'),
  body('location.area').notEmpty().withMessage('Location area is required'),
  body('location.address').notEmpty().withMessage('Location address is required'),
  body('location.nearestStation').notEmpty().withMessage('Nearest station is required'),
];

// ─── POST /api/reports — Submit New Report ───────────────────

router.post('/', validateReport, async (req: Request, res: Response) => {
  // Validate inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      category,
      urgency,
      description,
      identity,
      citizenId,
      location,
      evidence = [],
      authorities = [],
      aiSummary,
      isEmergency = false,
    } = req.body;

    // ── Generate unique IDs ──
    const reportId = uuidv4();
    const referenceId = `#IND-${Math.floor(10000 + Math.random() * 90000)}-X`;

    // ── Hash sensitive data for privacy ──
    // Description is NEVER stored raw — only its hash goes on blockchain
    const descriptionHash = Blockchain.hashData(description);
    const evidenceHashes = (evidence as string[]).map((e: string) => Blockchain.hashData(e));

    // ── Build blockchain block data ──
    const blockData: BlockData = {
      reportId,
      category,
      urgency,
      location,
      descriptionHash,
      evidenceHashes,
      identity,
      citizenId: identity === 'name' ? citizenId : undefined,
      timestamp: Date.now(),
      authorityRouted: authorities,
      status: 'PENDING',
    };

    // ── Add to blockchain (this mines the block) ──
    const block = blockchain.addBlock(blockData);

    // ── Persist blockchain state to SQLite ──
    saveBlockchainState(blockchain.getChain());

    // ── Save report metadata to SQLite ──
    insertReport({
      id: reportId,
      reference_id: referenceId,
      block_index: block.index,
      block_hash: block.hash,
      category,
      urgency,
      description_hash: descriptionHash,
      identity_type: identity,
      citizen_id: identity === 'name' ? citizenId : undefined,
      status: 'PENDING',
      location_area: location.area,
      location_address: location.address,
      nearest_station: location.nearestStation,
      is_emergency: isEmergency ? 1 : 0,
      ai_summary: aiSummary,
    });

    // ── Save evidence references ──
    evidenceHashes.forEach((hash, idx) => {
      insertEvidence({
        id: uuidv4(),
        report_id: reportId,
        file_hash: hash,
        file_name: `evidence_${idx + 1}`,
      });
    });

    // ── Route to authorities ──
    authorities.forEach((authority: string) => {
      insertAuthorityRouting({
        id: uuidv4(),
        report_id: reportId,
        authority,
      });
    });

    // ── Log to audit trail ──
    logAudit({
      event_type: 'REPORT_SUBMITTED',
      report_id: reportId,
      actor: identity === 'anonymous' ? 'ANONYMOUS' : (citizenId || 'CITIZEN'),
      details: `New ${urgency} urgency report in category: ${category}`,
      ip_address: req.ip,
    });

    // ── Respond to client ──
    return res.status(201).json({
      success: true,
      message: 'Report successfully submitted and recorded on blockchain.',
      data: {
        reportId,
        referenceId,
        blockIndex: block.index,
        blockHash: block.hash,
        status: 'PENDING',
        chainLength: blockchain.getLength(),
        submittedAt: new Date(block.timestamp).toISOString(),
      },
    });

  } catch (error) {
    console.error('[Reports] Error submitting report:', error);
    logAudit({
      event_type: 'REPORT_SUBMIT_FAILED',
      actor: 'SYSTEM',
      details: String(error),
      ip_address: req.ip,
    });
    return res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
});

// ─── GET /api/reports — List All Reports ────────────────────

router.get('/', (req: Request, res: Response) => {
  try {
    const { status, urgency, limit, offset } = req.query;

    const reports = getAllReports({
      status: status as string,
      urgency: urgency as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    return res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reports.' });
  }
});

// ─── GET /api/reports/:id — Get Single Report ───────────────

router.get('/:id', (req: Request, res: Response) => {
  try {
    const report = getReportById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const evidence = getEvidenceByReport(report.id);
    const auditLog = getAuditLog(report.id);

    return res.json({
      success: true,
      data: {
        ...report,
        evidence,
        auditLog,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch report.' });
  }
});

// ─── GET /api/reports/:id/verify — Verify on Blockchain ─────

router.get('/:id/verify', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find block in blockchain
    const block = blockchain.findBlockByReportId(id);

    if (!block) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Report not found on blockchain. It may have been tampered with or does not exist.',
      });
    }

    // Verify overall chain integrity
    const isChainValid = blockchain.isChainValid();

    return res.json({
      success: true,
      verified: true,
      chainIntegrity: isChainValid ? 'VALID' : 'COMPROMISED',
      blockDetails: {
        index: block.index,
        hash: block.hash,
        previousHash: block.previousHash,
        timestamp: new Date(block.timestamp).toISOString(),
        nonce: block.nonce,
        dataHash: Blockchain.hashData(JSON.stringify(block.data)),
      },
      message: isChainValid
        ? 'Report verified on blockchain. Chain integrity is intact.'
        : 'WARNING: Blockchain integrity check failed. Data may have been tampered with.',
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Verification failed.' });
  }
});

// ─── PATCH /api/reports/:id/status — Update Status ──────────

router.patch('/:id/status', [
  body('status').isIn(['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED']).withMessage('Invalid status'),
], (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { status } = req.body;
    const report = getReportById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    updateReportStatus(report.id, status);

    logAudit({
      event_type: 'STATUS_UPDATED',
      report_id: report.id,
      actor: 'ADMIN',
      details: `Status changed from ${report.status} to ${status}`,
      ip_address: req.ip,
    });

    return res.json({
      success: true,
      message: `Report status updated to ${status}`,
      data: { id: report.id, referenceId: report.reference_id, status },
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});

// ─── GET /api/blockchain/health — Chain Integrity Check ─────

router.get('/blockchain/health', (_req: Request, res: Response) => {
  const isValid = blockchain.isChainValid();
  const chainLength = blockchain.getLength();
  const latestBlock = blockchain.getLatestBlock();

  return res.json({
    success: true,
    status: isValid ? 'HEALTHY' : 'COMPROMISED',
    chainLength,
    latestBlockHash: latestBlock.hash,
    latestBlockIndex: latestBlock.index,
    lastUpdated: new Date(latestBlock.timestamp).toISOString(),
    message: isValid
      ? 'Blockchain is intact and all records are tamper-proof.'
      : 'CRITICAL: Blockchain integrity check failed!',
  });
});

export default router;
