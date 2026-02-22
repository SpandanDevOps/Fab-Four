/**
 * ============================================================
 * JAAGRUK - YOUR VOICE
 * Shared Frontend Types
 * ============================================================
 */

// ─── Screen Navigation ───────────────────────────────────────

export type Screen =
  | 'LANDING'
  | 'AUTH'
  | 'HOME'
  | 'LOGIN'
  | 'SIGNUP'
  | 'IDENTITY'
  | 'CHAT'
  | 'LOCATION'
  | 'EVIDENCE'
  | 'ANALYSIS'
  | 'REVIEW'
  | 'CONFIRMATION'
  | 'EMERGENCY_DETAILS'
  | 'REPORTS_LIST'
  | 'REPORT_DETAIL'
  | 'NEARBY'
  | 'PROFILE'
  | 'SETTINGS'
  | 'LANGUAGE_SELECT';

// ─── Report Data (Frontend State) ────────────────────────────

export interface ReportData {
  identity: 'name' | 'anonymous';
  description: string;
  location: {
    address: string;
    area: string;
    nearestStation: string;
    lat?: number;
    lng?: number;
  };
  evidence: EvidenceFile[];     // Evidence files
  analysis?: {
    category: string;
    urgency: string;
    summary: string;
    authorities: string[];
  };
  referenceId?: string;   // Assigned by backend after submission
  blockHash?: string;     // Blockchain block hash from backend
  blockIndex?: number;    // Position in blockchain
  submittedAt?: string;   // ISO timestamp from backend
}

// ─── Evidence File ───────────────────────────────────────────

export interface EvidenceFile {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

// ─── Submission State ────────────────────────────────────────

export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

// ─── Location ────────────────────────────────────────────────

export interface LocationData {
  area: string;
  address: string;
  nearestStation: string;
  lat?: number;
  lng?: number;
}

// ─── Police Station ──────────────────────────────────────────

export interface PoliceStation {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  lat: number;
  lng: number;
}

// ─── Chat Message ────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachments?: EvidenceFile[];
  italic?: boolean;
}

// ─── Report Status ───────────────────────────────────────────

export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';

// ─── User Report ─────────────────────────────────────────────

export interface UserReport {
  id: string;
  referenceId: string;
  category: string;
  urgency: string;
  description: string;
  location: LocationData;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  blockHash?: string;
  blockIndex?: number;
}
