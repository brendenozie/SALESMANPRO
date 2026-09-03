/**
 * lib/backup/crypto/cryptoPipeline.ts
 *
 * Cryptographic & Compression Pipeline for SalesmanPro Database Backups.
 * Handles AES-256-GCM authenticated encryption, Gzip compression, and SHA-256 integrity checksums.
 */

import crypto from "crypto";
import zlib from "zlib";
import { promisify } from "util";

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const ALGORITHM = "aes-256-gcm";
const CURRENT_ENCRYPTION_VERSION = "v1";

export interface EncryptedArtifactHeader {
  version: string;
  ivHex: string;
  authTagHex: string;
  compression: "gzip";
  checksum: string; // SHA-256 of the plain, uncompressed data OR the final payload
  createdAt: string;
}

export interface EncryptedBackupPayload {
  artifactBuffer: Buffer;
  checksum: string;
  header: EncryptedArtifactHeader;
  sizeBytes: number;
}

/**
 * Derives a 32-byte key for AES-256 from environment variables.
 */
export function getBackupKey(keyVersion?: string): Buffer {
  const secret =
    process.env.BACKUP_ENCRYPTION_KEY ||
    process.env.ENCRYPTION_KEY ||
    process.env.MASTER_ENCRYPTION_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL: BACKUP_ENCRYPTION_KEY is required in production environment."
      );
    }
    // Safe deterministic development key if not configured in dev
    return crypto.createHash("sha256").update("salesmanpro-dev-backup-key-32b").digest();
  }

  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Calculates a SHA-256 hash string for a buffer or stream.
 */
export function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Compresses data with Gzip, encrypts it with AES-256-GCM, and envelopes it
 * with a binary-prefixed header containing the IV, Auth Tag, and checksum.
 *
 * Envelope Format:
 * [4 Bytes: Header Length (UInt32BE)]
 * [N Bytes: UTF-8 JSON Header { version, ivHex, authTagHex, compression, checksum }]
 * [Remaining Bytes: Encrypted Gzipped Data]
 */
export async function encryptAndCompressBackup(
  plainBuffer: Buffer,
  keyVersion: string = CURRENT_ENCRYPTION_VERSION
): Promise<EncryptedBackupPayload> {
  const key = getBackupKey(keyVersion);
  const iv = crypto.randomBytes(12); // Standard 96-bit GCM IV

  // 1. Gzip compression
  const compressed = await gzip(plainBuffer, { level: 6 });

  // 2. AES-256-GCM Encryption
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // 3. Compute Checksum of the plain database content
  const plainChecksum = calculateChecksum(plainBuffer);

  const header: EncryptedArtifactHeader = {
    version: keyVersion,
    ivHex: iv.toString("hex"),
    authTagHex: authTag.toString("hex"),
    compression: "gzip",
    checksum: plainChecksum,
    createdAt: new Date().toISOString(),
  };

  const headerJson = Buffer.from(JSON.stringify(header), "utf-8");
  const headerLength = Buffer.alloc(4);
  headerLength.writeUInt32BE(headerJson.length, 0);

  // Combine into single artifact buffer
  const artifactBuffer = Buffer.concat([headerLength, headerJson, encrypted]);
  const artifactChecksum = calculateChecksum(artifactBuffer);

  return {
    artifactBuffer,
    checksum: artifactChecksum,
    header,
    sizeBytes: artifactBuffer.length,
  };
}

/**
 * Decrypts and decompresses a packaged backup artifact buffer.
 */
export async function decryptAndDecompressBackup(
  artifactBuffer: Buffer,
  expectedArtifactChecksum?: string
): Promise<{ plainBuffer: Buffer; header: EncryptedArtifactHeader }> {
  // 1. Validate Artifact Checksum if provided
  if (expectedArtifactChecksum) {
    const actualChecksum = calculateChecksum(artifactBuffer);
    if (actualChecksum !== expectedArtifactChecksum) {
      throw new Error(
        `Artifact checksum mismatch! Expected: ${expectedArtifactChecksum}, Actual: ${actualChecksum}`
      );
    }
  }

  // 2. Read Header Length
  if (artifactBuffer.length < 4) {
    throw new Error("Corrupted backup artifact: Missing header length");
  }

  const headerLength = artifactBuffer.readUInt32BE(0);
  if (artifactBuffer.length < 4 + headerLength) {
    throw new Error("Corrupted backup artifact: Incomplete header");
  }

  // 3. Parse Header
  const headerBuffer = artifactBuffer.subarray(4, 4 + headerLength);
  const header: EncryptedArtifactHeader = JSON.parse(headerBuffer.toString("utf-8"));

  const encryptedPayload = artifactBuffer.subarray(4 + headerLength);
  const key = getBackupKey(header.version);
  const iv = Buffer.from(header.ivHex, "hex");
  const authTag = Buffer.from(header.authTagHex, "hex");

  // 4. Decrypt AES-256-GCM
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let compressed: Buffer;
  try {
    compressed = Buffer.concat([decipher.update(encryptedPayload), decipher.final()]);
  } catch (err: any) {
    throw new Error(`Decryption failed: Bad auth tag or invalid key. Details: ${err.message}`);
  }

  // 5. Decompress Gzip
  let plainBuffer: Buffer;
  try {
    plainBuffer = await gunzip(compressed);
  } catch (err: any) {
    throw new Error(`Decompression failed: ${err.message}`);
  }

  // 6. Verify Content Integrity Checksum
  if (header.checksum) {
    const contentChecksum = calculateChecksum(plainBuffer);
    if (contentChecksum !== header.checksum) {
      throw new Error(
        `Content checksum mismatch! Expected: ${header.checksum}, Actual: ${contentChecksum}`
      );
    }
  }

  return { plainBuffer, header };
}
