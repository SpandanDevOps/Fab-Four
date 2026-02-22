/**
 * ============================================================
 * JAAGRUK - YOUR VOICE
 * Blockchain Service — Immutable Report Ledger
 * ============================================================
 *
 * PURPOSE:
 * Implements a lightweight, tamper-proof blockchain to store
 * civic incident reports. Each report is hashed using SHA-256
 * and chained to the previous block, making any modification
 * of existing records immediately detectable.
 *
 * WHY BLOCKCHAIN?
 * - Government/admin can't silently delete reports
 * - Every report gets a cryptographic fingerprint (hash)
 * - Chain integrity can be verified at any time
 * - Citizens can independently verify their report exists
 *
 * STRUCTURE:
 * Block {
 *   index       → Position in the chain
 *   timestamp   → When the report was filed
 *   data        → The encrypted report payload
 *   previousHash → Hash of the previous block (links chain)
 *   hash        → SHA-256 of all above fields
 *   nonce       → Proof-of-work value (light difficulty)
 * }
 */

import CryptoJS from 'crypto-js';

// ─── Types ─────────────────────────────────────────────────

export interface BlockData {
  reportId: string;
  category: string;
  urgency: string;
  location: {
    area: string;
    address: string;
    nearestStation: string;
  };
  descriptionHash: string;    // SHA-256 of actual description (privacy)
  evidenceHashes: string[];   // SHA-256 of each evidence file
  identity: 'name' | 'anonymous';
  citizenId?: string;         // Only present if named report
  timestamp: number;
  authorityRouted: string[];
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
}

export interface Block {
  index: number;
  timestamp: number;
  data: BlockData;
  previousHash: string;
  hash: string;
  nonce: number;
}

// ─── Constants ──────────────────────────────────────────────

// Adjust difficulty for performance vs. security tradeoff
// In production, increase to 3 or 4
const MINING_DIFFICULTY = 2;
const DIFFICULTY_PREFIX = '0'.repeat(MINING_DIFFICULTY);

// ─── Blockchain Class ───────────────────────────────────────

export class Blockchain {
  private chain: Block[];

  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  /**
   * Genesis block — the origin block with no previous hash.
   * This is always the first block and never changes.
   */
  private createGenesisBlock(): Block {
    const genesisData: BlockData = {
      reportId: 'GENESIS',
      category: 'SYSTEM',
      urgency: 'NONE',
      location: { area: 'India', address: 'Origin', nearestStation: 'N/A' },
      descriptionHash: '0000000000000000',
      evidenceHashes: [],
      identity: 'anonymous',
      timestamp: new Date('2024-01-01').getTime(),
      authorityRouted: [],
      status: 'RESOLVED',
    };

    return {
      index: 0,
      timestamp: new Date('2024-01-01').getTime(),
      data: genesisData,
      previousHash: '0000000000000000',
      hash: this.computeHash(0, new Date('2024-01-01').getTime(), genesisData, '0000000000000000', 0),
      nonce: 0,
    };
  }

  /**
   * Computes SHA-256 hash of a block's contents.
   * Any change to input will produce a completely different hash.
   */
  computeHash(
    index: number,
    timestamp: number,
    data: BlockData,
    previousHash: string,
    nonce: number
  ): string {
    const content = JSON.stringify({ index, timestamp, data, previousHash, nonce });
    return CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex);
  }

  /**
   * Proof-of-Work: Mines a block by finding a nonce that produces
   * a hash starting with DIFFICULTY_PREFIX zeros.
   * This makes retroactive tampering computationally expensive.
   */
  private mineBlock(index: number, timestamp: number, data: BlockData, previousHash: string): { hash: string; nonce: number } {
    let nonce = 0;
    let hash = '';

    while (!hash.startsWith(DIFFICULTY_PREFIX)) {
      nonce++;
      hash = this.computeHash(index, timestamp, data, previousHash, nonce);
    }

    return { hash, nonce };
  }

  /**
   * Adds a new verified report to the blockchain.
   * Returns the newly created block.
   */
  addBlock(data: BlockData): Block {
    const previousBlock = this.getLatestBlock();
    const index = previousBlock.index + 1;
    const timestamp = Date.now();
    const previousHash = previousBlock.hash;

    const { hash, nonce } = this.mineBlock(index, timestamp, data, previousHash);

    const newBlock: Block = {
      index,
      timestamp,
      data,
      previousHash,
      hash,
      nonce,
    };

    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Returns the most recently added block.
   */
  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Returns the entire blockchain (all blocks).
   */
  getChain(): Block[] {
    return this.chain;
  }

  /**
   * Verifies chain integrity — detects any tampering or deletion.
   * Returns true if the chain is valid, false if corrupted.
   *
   * Checks:
   * 1. Each block's hash matches its recomputed hash
   * 2. Each block's previousHash matches the actual previous block hash
   */
  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Verify this block's hash is correct
      const recomputedHash = this.computeHash(
        current.index,
        current.timestamp,
        current.data,
        current.previousHash,
        current.nonce
      );

      if (current.hash !== recomputedHash) {
        console.error(`[Blockchain] Block ${i} hash mismatch! TAMPERING DETECTED.`);
        return false;
      }

      // Verify chain linkage
      if (current.previousHash !== previous.hash) {
        console.error(`[Blockchain] Block ${i} chain link broken! TAMPERING DETECTED.`);
        return false;
      }
    }

    return true;
  }

  /**
   * Finds a block by its report ID.
   */
  findBlockByReportId(reportId: string): Block | null {
    return this.chain.find(b => b.data.reportId === reportId) || null;
  }

  /**
   * Returns the chain length (number of reports + genesis).
   */
  getLength(): number {
    return this.chain.length;
  }

  /**
   * Loads a serialized chain (e.g., from database persistence).
   * Validates before loading to prevent loading a tampered chain.
   */
  loadChain(chain: Block[]): boolean {
    const tempChain = this.chain;
    this.chain = chain;

    if (!this.isChainValid()) {
      console.error('[Blockchain] Loaded chain is invalid! Reverting.');
      this.chain = tempChain;
      return false;
    }

    return true;
  }

  /**
   * Generates a SHA-256 hash of any string.
   * Used for hashing descriptions/evidence for privacy.
   */
  static hashData(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }
}

// Export a singleton instance
export const blockchain = new Blockchain();
