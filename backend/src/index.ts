/**
 * ============================================================
 * JAAGRUK - YOUR VOICE
 * Backend Server — Express.js Entry Point
 * ============================================================
 *
 * Starts the REST API server with:
 * - Security middleware (helmet, cors, rate limiting)
 * - SQLite database initialization
 * - Blockchain state restoration from persistence
 * - Route mounting
 * - Error handling
 *
 * PORT: 4000 (default) or process.env.PORT
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase, loadBlockchainState, logAudit } from './services/DatabaseService.js';
import { blockchain } from './blockchain/BlockchainService.js';
import reportsRouter from './routes/reports.js';
import authRouter from './routes/auth.js';
import filesRouter from './routes/files.js';
import locationRouter from './routes/location.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

// ─── Initialize App ──────────────────────────────────────────

const app = express();

// ─── Security Middleware ─────────────────────────────────────

// Helmet sets secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — Allow frontend to communicate
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting — Prevent abuse/spam reports
const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                    // Max 10 reports per 15 min per IP
  message: {
    success: false,
    message: 'Too many reports submitted. Please wait before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// ─── Request Parsing ─────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('[:date[clf]] :method :url :status :response-time ms'));

// Static file serving for uploaded evidence
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Routes ──────────────────────────────────────────────────

// Apply stricter rate limit to report submission
app.use('/api/reports', reportLimiter, reportsRouter);

// Auth routes (no rate limit for demo)
app.use('/api/auth', authRouter);

// File upload routes
app.use('/api/files', filesRouter);

// Location routes
app.use('/api/location', locationRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'UP',
    service: 'JAAGRUK - Your Voice Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    blockchain: {
      length: blockchain.getLength(),
      integrity: blockchain.isChainValid() ? 'VALID' : 'COMPROMISED',
    },
  });
});

// ─── 404 Handler ─────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found. Please check the JAAGRUK API documentation.',
  });
});

// ─── Global Error Handler ────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.',
  });
});

// ─── Startup ─────────────────────────────────────────────────

async function start() {
  try {
    // 1. Initialize SQLite database
    initDatabase();
    console.log('[Startup] ✓ Database initialized');

    // 2. Restore blockchain from database
    const savedChain = loadBlockchainState();
    if (savedChain && savedChain.length > 1) {
      const loaded = blockchain.loadChain(savedChain);
      if (loaded) {
        console.log(`[Startup] ✓ Blockchain restored: ${savedChain.length} blocks`);
      } else {
        console.warn('[Startup] ⚠ Blockchain restore failed — starting fresh');
      }
    } else {
      console.log('[Startup] ✓ Blockchain initialized with genesis block');
    }

    // 3. Verify chain integrity on startup
    const isValid = blockchain.isChainValid();
    if (!isValid) {
      console.error('[Startup] ⚠ CRITICAL: Blockchain integrity check FAILED on startup!');
      logAudit({
        event_type: 'BLOCKCHAIN_INTEGRITY_FAILED',
        actor: 'SYSTEM',
        details: 'Integrity check failed on server startup',
      });
    } else {
      console.log('[Startup] ✓ Blockchain integrity verified');
    }

    // 4. Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════╗');
      console.log('║      JAAGRUK — YOUR VOICE             ║');
      console.log('║      Blockchain Civic Reporting       ║');
      console.log('╠═══════════════════════════════════════╣');
      console.log(`║  Server  : http://localhost:${PORT}      ║`);
      console.log(`║  Env     : ${process.env.NODE_ENV || 'development'}                ║`);
      console.log(`║  DB      : SQLite (jaagruk.db)        ║`);
      console.log(`║  Chain   : ${blockchain.getLength()} blocks                ║`);
      console.log('╚═══════════════════════════════════════╝');
      console.log('');
    });

  } catch (error) {
    console.error('[Startup] FATAL ERROR:', error);
    process.exit(1);
  }
}

start();
