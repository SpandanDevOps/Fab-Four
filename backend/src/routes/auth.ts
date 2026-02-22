/**
 * ============================================================
 * JAAGRUK - YOUR VOICE
 * Auth Router — User Authentication Endpoints
 * ============================================================
 *
 * ENDPOINTS:
 * POST   /api/auth/signup     → Create new user account
 * POST   /api/auth/login      → Login with email/password
 * GET    /api/auth/profile    → Get current user profile
 * PATCH  /api/auth/profile    → Update user profile
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import CryptoJS from 'crypto-js';
import { logAudit, insertUser, getUserByEmail, getUserById, updateUser } from '../services/DatabaseService.js';

const router = Router();

// Simple JWT-like token generation (for demo purposes)
const SECRET = process.env.JWT_SECRET || 'jaagruk-secret-key-2024';

function generateToken(userId: string): string {
  const payload = {
    userId,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const encoded = CryptoJS.AES.encrypt(JSON.stringify(payload), SECRET).toString();
  return encoded;
}

function verifyToken(token: string): { userId: string } | null {
  try {
    const bytes = CryptoJS.AES.decrypt(token, SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    const payload = JSON.parse(decrypted);
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

function hashPassword(password: string): string {
  return CryptoJS.SHA256(password + SECRET).toString();
}

// Auth middleware
export function authMiddleware(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
  
  (req as any).userId = payload.userId;
  next();
}

// ─── Validation ──────────────────────────────────────────────

const validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── POST /api/auth/signup ───────────────────────────────────

router.post('/signup', validateSignup, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create new user
    const userId = uuidv4();
    const passwordHash = hashPassword(password);

    insertUser({
      id: userId,
      name,
      email,
      phone,
      password_hash: passwordHash,
      verified: false,
    });

    const token = generateToken(userId);

    // Log the signup
    logAudit({
      event_type: 'USER_SIGNUP',
      actor: userId,
      details: `New user registered: ${email}`,
      ip_address: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: userId,
          name,
          email,
          phone,
          verified: false,
          createdAt: new Date().toISOString(),
        },
        token,
      },
    });

  } catch (error) {
    console.error('[Auth] Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
    });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────

router.post('/login', validateLogin, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find user
    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user.id);

    // Log the login
    logAudit({
      event_type: 'USER_LOGIN',
      actor: user.id,
      details: `User logged in: ${email}`,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          verified: Boolean(user.verified),
          createdAt: new Date(user.created_at * 1000).toISOString(),
        },
        token,
      },
    });

  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
});

// ─── GET /api/auth/profile ───────────────────────────────────

router.get('/profile', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        verified: Boolean(user.verified),
        createdAt: new Date(user.created_at * 1000).toISOString(),
      },
    });

  } catch (error) {
    console.error('[Auth] Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
    });
  }
});

// ─── PATCH /api/auth/profile ─────────────────────────────────

router.patch('/profile', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, phone } = req.body;

    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    updateUser(userId, { name, phone });

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('[Auth] Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
});

export default router;
