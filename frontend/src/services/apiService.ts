/**
 * ============================================================
 * JAAGRUK - YOUR VOICE
 * Frontend API Service — Backend Communication Layer
 * ============================================================
 *
 * All frontend → backend communication goes through this file.
 * Centralizes API calls, error handling, and base URL config.
 *
 * USAGE:
 * import { apiService } from './services/apiService';
 * const result = await apiService.submitReport(data);
 */

// ─── Configuration ───────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ─── Auth Types ──────────────────────────────────────────────

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      verified: boolean;
      createdAt: string;
    };
    token: string;
  };
}

export interface SignupPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      verified: boolean;
      createdAt: string;
    };
    token: string;
  };
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  data: {
    fileId: string;
    url: string;
    filename: string;
    mimetype: string;
    size: number;
  };
}

// ─── Types ───────────────────────────────────────────────────

export interface SubmitReportPayload {
  category: string;
  urgency: string;
  description: string;
  identity: 'name' | 'anonymous';
  citizenId?: string;
  location: {
    area: string;
    address: string;
    nearestStation: string;
    lat?: number;
    lng?: number;
  };
  evidence?: string[];      // Array of evidence hashes or URLs
  authorities?: string[];   // Authorities to route to
  aiSummary?: string;
  isEmergency?: boolean;
}

export interface SubmitReportResponse {
  success: boolean;
  message: string;
  data: {
    reportId: string;
    referenceId: string;
    blockIndex: number;
    blockHash: string;
    status: string;
    chainLength: number;
    submittedAt: string;
  };
}

export interface VerifyReportResponse {
  success: boolean;
  verified: boolean;
  chainIntegrity: 'VALID' | 'COMPROMISED';
  blockDetails?: {
    index: number;
    hash: string;
    previousHash: string;
    timestamp: string;
    nonce: number;
    dataHash: string;
  };
  message: string;
}

export interface BlockchainHealthResponse {
  success: boolean;
  status: 'HEALTHY' | 'COMPROMISED';
  chainLength: number;
  latestBlockHash: string;
  latestBlockIndex: number;
  lastUpdated: string;
  message: string;
}

// ─── Core Fetch Helper ───────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to JAAGRUK server. Please ensure the backend is running.');
    }
    throw error;
  }
}

// ─── API Methods ─────────────────────────────────────────────

export const apiService = {

  /**
   * Submit a new incident report.
   * The backend will:
   * 1. Hash the description for privacy
   * 2. Mine a new blockchain block
   * 3. Save to SQLite
   * 4. Route to authorities
   */
  async submitReport(payload: SubmitReportPayload): Promise<SubmitReportResponse> {
    return apiFetch<SubmitReportResponse>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch all reports (for admin dashboard).
   */
  async getReports(filters?: {
    status?: string;
    urgency?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; count: number; data: any[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.urgency) params.append('urgency', filters.urgency);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    return apiFetch(`/reports?${params.toString()}`);
  },

  /**
   * Get a specific report by ID or reference ID.
   */
  async getReport(id: string): Promise<{ success: boolean; data: any }> {
    return apiFetch(`/reports/${id}`);
  },

  /**
   * Verify a report exists and hasn't been tampered with on blockchain.
   * Citizens can use this to confirm their report is immutably recorded.
   */
  async verifyReport(reportId: string): Promise<VerifyReportResponse> {
    return apiFetch<VerifyReportResponse>(`/reports/${reportId}/verify`);
  },

  /**
   * Update report status (admin operation).
   */
  async updateReportStatus(
    reportId: string,
    status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'
  ): Promise<{ success: boolean; message: string }> {
    return apiFetch(`/reports/${reportId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Check blockchain health — verifies chain integrity.
   */
  async getBlockchainHealth(): Promise<BlockchainHealthResponse> {
    return apiFetch<BlockchainHealthResponse>('/reports/blockchain/health');
  },

  /**
   * Check if the backend API is running.
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    return apiFetch('/health');
  },

  // ─── Authentication ──────────────────────────────────────────

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Create a new user account
   */
  async signup(data: SignupPayload): Promise<SignupResponse> {
    return apiFetch<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get current user profile
   */
  async getProfile(token: string): Promise<{ success: boolean; data: any }> {
    return apiFetch('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Update user profile
   */
  async updateProfile(token: string, data: Partial<{ name: string; phone: string }>): Promise<{ success: boolean; message: string }> {
    return apiFetch('/auth/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  // ─── File Upload ─────────────────────────────────────────────

  /**
   * Upload evidence file (image, video, audio, document)
   */
  async uploadFile(file: File, token?: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'File upload failed');
    }
    return data as FileUploadResponse;
  },

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], token?: string): Promise<FileUploadResponse[]> {
    const uploads = files.map(file => this.uploadFile(file, token));
    return Promise.all(uploads);
  },

  // ─── Location Services (OpenStreetMap) ────────────────────────

  /**
   * Get nearby police stations based on coordinates (OSM Overpass API)
   */
  async getNearbyStations(lat: number, lng: number, options?: { limit?: number; radius?: number }): Promise<{ success: boolean; count: number; data: any[] }> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    });
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.radius) params.append('radius', options.radius.toString());
    
    return apiFetch(`/location/stations?${params}`);
  },

  /**
   * Get nearby hospitals (OSM Overpass API)
   */
  async getNearbyHospitals(lat: number, lng: number, options?: { limit?: number; radius?: number }): Promise<{ success: boolean; count: number; data: any[] }> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    });
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.radius) params.append('radius', options.radius.toString());
    
    return apiFetch(`/location/hospitals?${params}`);
  },

  /**
   * Get nearby fire stations (OSM Overpass API)
   */
  async getNearbyFireStations(lat: number, lng: number, options?: { limit?: number; radius?: number }): Promise<{ success: boolean; count: number; data: any[] }> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    });
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.radius) params.append('radius', options.radius.toString());
    
    return apiFetch(`/location/fire-stations?${params}`);
  },

  /**
   * Get nearby civic/government offices (OSM Overpass API)
   */
  async getNearbyCivicOffices(lat: number, lng: number, options?: { limit?: number; radius?: number }): Promise<{ success: boolean; count: number; data: any[] }> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    });
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.radius) params.append('radius', options.radius.toString());
    
    return apiFetch(`/location/civic-offices?${params}`);
  },

  /**
   * Get all nearby amenities in one call (police, hospitals, fire stations, government)
   */
  async getNearbyAll(lat: number, lng: number, radius?: number): Promise<{ 
    success: boolean; 
    data: { 
      police: any[]; 
      hospital: any[]; 
      fire: any[];
      government: any[] 
    } 
  }> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    });
    if (radius) params.append('radius', radius.toString());
    
    return apiFetch(`/location/nearby?${params}`);
  },

  /**
   * Geocode an address to coordinates (OSM Nominatim)
   */
  async geocodeAddress(address: string, country?: string): Promise<{ 
    success: boolean; 
    data: { 
      lat: number; 
      lng: number; 
      formatted: string;
      address: {
        road?: string;
        suburb?: string;
        city?: string;
        district?: string;
        state?: string;
        postcode?: string;
        country?: string;
      };
    } 
  }> {
    const params = new URLSearchParams({
      address: address,
    });
    if (country) params.append('country', country);
    
    return apiFetch(`/location/geocode?${params}`);
  },

  /**
   * Reverse geocode coordinates to address (OSM Nominatim)
   */
  async reverseGeocode(lat: number, lng: number, zoom?: number): Promise<{ 
    success: boolean; 
    data: { 
      address: string; 
      area: string;
      details: {
        houseNumber?: string;
        road?: string;
        suburb?: string;
        city?: string;
        district?: string;
        state?: string;
        postcode?: string;
        country?: string;
        countryCode?: string;
      };
    } 
  }> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    });
    if (zoom) params.append('zoom', zoom.toString());
    
    return apiFetch(`/location/reverse?${params}`);
  },

  /**
   * Search for places by name (OSM Nominatim)
   */
  async searchPlaces(query: string, options?: { limit?: number; viewbox?: string }): Promise<{
    success: boolean;
    count: number;
    data: Array<{
      placeId: string;
      lat: number;
      lng: number;
      displayName: string;
      type: string;
      category: string;
    }>;
  }> {
    const params = new URLSearchParams({
      q: query,
    });
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.viewbox) params.append('viewbox', options.viewbox);
    
    return apiFetch(`/location/search?${params}`);
  },
};
