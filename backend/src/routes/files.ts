/**
 * ============================================================
 * JAAGRUK - YOUR VOICE
 * Files Router — Evidence Upload Endpoints
 * ============================================================
 *
 * ENDPOINTS:
 * POST   /api/files/upload    → Upload a single file
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logAudit } from '../services/DatabaseService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Configure multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

const router = Router();

// ─── POST /api/files/upload ──────────────────────────────────

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const fileId = uuidv4();
    const fileUrl = `/uploads/${file.filename}`;

    // Log the upload
    logAudit({
      event_type: 'FILE_UPLOADED',
      actor: (req as any).userId || 'ANONYMOUS',
      details: `File uploaded: ${file.originalname} (${file.size} bytes)`,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileId,
        url: fileUrl,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
    });

  } catch (error) {
    console.error('[Files] Upload error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'File upload failed',
    });
  }
});

// Error handler for multer
router.use((error: any, _req: Request, res: Response, _next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'File upload failed',
  });
});

export default router;
