/**
 * ============================================================
 * JAAGRUK - YOUR VOICE
 * Database Service — SQLite Persistence Layer
 * ============================================================
 *
 * PURPOSE:
 * Persists blockchain data and report metadata to SQLite.
 * The blockchain handles immutability & integrity;
 * SQLite handles fast querying, filtering, and relationships.
 *
 * TABLES:
 * - blockchain_state  → Serialized blockchain (full chain JSON)
 * - reports           → Queryable report metadata
 * - evidence          → Evidence file references per report
 * - authorities       → Authority routing per report
 * - audit_log         → Immutable audit trail of all actions
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Block } from '../blockchain/BlockchainService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../data/jaagruk.db');

// ─── Database Initialization ────────────────────────────────

let db: Database.Database;

export function initDatabase(): Database.Database {
  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  fs.mkdirSync(dataDir, { recursive: true });

  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  createTables();
  console.log('[Database] SQLite initialized at:', DB_PATH);
  return db;
}

// ─── Table Creation ─────────────────────────────────────────

function createTables(): void {
  // ── Blockchain state persistence ──
  // Stores the entire chain as JSON for persistence across restarts
  db.exec(`
    CREATE TABLE IF NOT EXISTS blockchain_state (
      id          INTEGER PRIMARY KEY CHECK (id = 1),
      chain_json  TEXT NOT NULL,
      last_hash   TEXT NOT NULL,
      block_count INTEGER NOT NULL DEFAULT 1,
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // ── Main reports table ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id               TEXT PRIMARY KEY,
      reference_id     TEXT UNIQUE NOT NULL,
      block_index      INTEGER,
      block_hash       TEXT,
      category         TEXT NOT NULL,
      urgency          TEXT NOT NULL CHECK (urgency IN ('Critical', 'High', 'Medium', 'Low')),
      description_hash TEXT NOT NULL,
      identity_type    TEXT NOT NULL CHECK (identity_type IN ('name', 'anonymous')),
      citizen_id       TEXT,
      status           TEXT NOT NULL DEFAULT 'PENDING' 
                       CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED')),
      location_area    TEXT NOT NULL,
      location_address TEXT NOT NULL,
      nearest_station  TEXT NOT NULL,
      is_emergency     INTEGER NOT NULL DEFAULT 0,
      ai_summary       TEXT,
      created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // ── Evidence files per report ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS evidence (
      id          TEXT PRIMARY KEY,
      report_id   TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      file_hash   TEXT NOT NULL,
      file_name   TEXT,
      file_type   TEXT,
      file_size   INTEGER,
      stored_path TEXT,
      uploaded_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // ── Authority routing per report ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS authority_routing (
      id           TEXT PRIMARY KEY,
      report_id    TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      authority    TEXT NOT NULL,
      routed_at    INTEGER NOT NULL DEFAULT (unixepoch()),
      acknowledged INTEGER NOT NULL DEFAULT 0,
      ack_at       INTEGER
    )
  `);

  // ── Immutable audit log ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type  TEXT NOT NULL,
      report_id   TEXT,
      actor       TEXT DEFAULT 'SYSTEM',
      details     TEXT,
      ip_address  TEXT,
      timestamp   INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // ── Users table ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      phone         TEXT,
      password_hash TEXT NOT NULL,
      verified      INTEGER NOT NULL DEFAULT 0,
      created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // ── Indexes for common queries ──
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
    CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_reports_urgency ON reports(urgency);
    CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
    CREATE INDEX IF NOT EXISTS idx_evidence_report ON evidence(report_id);
    CREATE INDEX IF NOT EXISTS idx_routing_report ON authority_routing(report_id);
    CREATE INDEX IF NOT EXISTS idx_audit_report ON audit_log(report_id);
    CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_log(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
}

export function getDb(): Database.Database {
  if (!db) throw new Error('[Database] Not initialized. Call initDatabase() first.');
  return db;
}

// ─── Blockchain Persistence ──────────────────────────────────

export function saveBlockchainState(chain: Block[]): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO blockchain_state (id, chain_json, last_hash, block_count, updated_at)
    VALUES (1, ?, ?, ?, unixepoch())
  `);

  const lastBlock = chain[chain.length - 1];
  stmt.run(JSON.stringify(chain), lastBlock.hash, chain.length);
}

export function loadBlockchainState(): Block[] | null {
  const db = getDb();
  const row = db.prepare('SELECT chain_json FROM blockchain_state WHERE id = 1').get() as any;
  if (!row) return null;
  try {
    return JSON.parse(row.chain_json) as Block[];
  } catch {
    return null;
  }
}

// ─── Report CRUD ─────────────────────────────────────────────

export interface ReportRecord {
  id: string;
  reference_id: string;
  block_index?: number;
  block_hash?: string;
  category: string;
  urgency: string;
  description_hash: string;
  identity_type: 'name' | 'anonymous';
  citizen_id?: string;
  status: string;
  location_area: string;
  location_address: string;
  nearest_station: string;
  is_emergency: number;
  ai_summary?: string;
  created_at: number;
  updated_at: number;
}

export function insertReport(report: Omit<ReportRecord, 'created_at' | 'updated_at'>): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO reports (
      id, reference_id, block_index, block_hash, category, urgency,
      description_hash, identity_type, citizen_id, status,
      location_area, location_address, nearest_station, is_emergency, ai_summary
    ) VALUES (
      @id, @reference_id, @block_index, @block_hash, @category, @urgency,
      @description_hash, @identity_type, @citizen_id, @status,
      @location_area, @location_address, @nearest_station, @is_emergency, @ai_summary
    )
  `).run(report);
}

export function getReportById(id: string): ReportRecord | null {
  return (getDb().prepare('SELECT * FROM reports WHERE id = ? OR reference_id = ?').get(id, id) as ReportRecord) || null;
}

export function getAllReports(filters?: { status?: string; urgency?: string; limit?: number; offset?: number }): ReportRecord[] {
  let query = 'SELECT * FROM reports WHERE 1=1';
  const params: any[] = [];

  if (filters?.status) { query += ' AND status = ?'; params.push(filters.status); }
  if (filters?.urgency) { query += ' AND urgency = ?'; params.push(filters.urgency); }

  query += ' ORDER BY created_at DESC';
  query += ` LIMIT ${filters?.limit || 50} OFFSET ${filters?.offset || 0}`;

  return getDb().prepare(query).all(...params) as ReportRecord[];
}

export function updateReportStatus(id: string, status: string): void {
  getDb().prepare('UPDATE reports SET status = ?, updated_at = unixepoch() WHERE id = ?').run(status, id);
}

// ─── Evidence ────────────────────────────────────────────────

export function insertEvidence(evidence: {
  id: string;
  report_id: string;
  file_hash: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  stored_path?: string;
}): void {
  getDb().prepare(`
    INSERT INTO evidence (id, report_id, file_hash, file_name, file_type, file_size, stored_path)
    VALUES (@id, @report_id, @file_hash, @file_name, @file_type, @file_size, @stored_path)
  `).run(evidence);
}

export function getEvidenceByReport(reportId: string): any[] {
  return getDb().prepare('SELECT * FROM evidence WHERE report_id = ?').all(reportId) as any[];
}

// ─── Authority Routing ───────────────────────────────────────

export function insertAuthorityRouting(routing: {
  id: string;
  report_id: string;
  authority: string;
}): void {
  getDb().prepare(`
    INSERT INTO authority_routing (id, report_id, authority)
    VALUES (@id, @report_id, @authority)
  `).run(routing);
}

// ─── Audit Log ───────────────────────────────────────────────

export function logAudit(event: {
  event_type: string;
  report_id?: string;
  actor?: string;
  details?: string;
  ip_address?: string;
}): void {
  getDb().prepare(`
    INSERT INTO audit_log (event_type, report_id, actor, details, ip_address)
    VALUES (@event_type, @report_id, @actor, @details, @ip_address)
  `).run(event);
}

export function getAuditLog(reportId?: string): any[] {
  if (reportId) {
    return getDb().prepare('SELECT * FROM audit_log WHERE report_id = ? ORDER BY timestamp DESC').all(reportId) as any[];
  }
  return getDb().prepare('SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 100').all() as any[];
}

// ─── Users Table ─────────────────────────────────────────────

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password_hash: string;
  verified: boolean;
  created_at: number;
  updated_at: number;
}

export function insertUser(user: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password_hash: string;
  verified: boolean;
}): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, verified)
    VALUES (@id, @name, @email, @phone, @password_hash, @verified)
  `).run({ ...user, verified: user.verified ? 1 : 0 });
}

export function getUserByEmail(email: string): UserRecord | null {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRecord | null;
}

export function getUserById(id: string): UserRecord | null {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRecord | null;
}

export function updateUser(id: string, updates: { name?: string; phone?: string }): void {
  const db = getDb();
  const fields: string[] = [];
  const params: any = { id };
  
  if (updates.name) {
    fields.push('name = @name');
    params.name = updates.name;
  }
  if (updates.phone) {
    fields.push('phone = @phone');
    params.phone = updates.phone;
  }
  
  if (fields.length === 0) return;
  
  fields.push('updated_at = unixepoch()');
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = @id`).run(params);
}
