"use strict";
/**
 * lib/backup/crypto/cryptoPipeline.ts
 *
 * Cryptographic & Compression Pipeline for SalesmanPro Database Backups.
 * Handles AES-256-GCM authenticated encryption, Gzip compression, and SHA-256 integrity checksums.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptAndDecompressBackup = exports.encryptAndCompressBackup = exports.calculateChecksum = exports.getBackupKey = void 0;
const crypto_1 = __importDefault(require("crypto"));
const zlib_1 = __importDefault(require("zlib"));
const util_1 = require("util");
const gzip = (0, util_1.promisify)(zlib_1.default.gzip);
const gunzip = (0, util_1.promisify)(zlib_1.default.gunzip);
const ALGORITHM = "aes-256-gcm";
const CURRENT_ENCRYPTION_VERSION = "v1";
/**
 * Derives a 32-byte key for AES-256 from environment variables.
 */
function getBackupKey(keyVersion) {
    const secret = process.env.BACKUP_ENCRYPTION_KEY ||
        process.env.ENCRYPTION_KEY ||
        process.env.MASTER_ENCRYPTION_KEY;
    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("CRITICAL: BACKUP_ENCRYPTION_KEY is required in production environment.");
        }
        // Safe deterministic development key if not configured in dev
        return crypto_1.default.createHash("sha256").update("salesmanpro-dev-backup-key-32b").digest();
    }
    return crypto_1.default.createHash("sha256").update(secret).digest();
}
exports.getBackupKey = getBackupKey;
/**
 * Calculates a SHA-256 hash string for a buffer or stream.
 */
function calculateChecksum(buffer) {
    return crypto_1.default.createHash("sha256").update(buffer).digest("hex");
}
exports.calculateChecksum = calculateChecksum;
/**
 * Compresses data with Gzip, encrypts it with AES-256-GCM, and envelopes it
 * with a binary-prefixed header containing the IV, Auth Tag, and checksum.
 *
 * Envelope Format:
 * [4 Bytes: Header Length (UInt32BE)]
 * [N Bytes: UTF-8 JSON Header { version, ivHex, authTagHex, compression, checksum }]
 * [Remaining Bytes: Encrypted Gzipped Data]
 */
async function encryptAndCompressBackup(plainBuffer, keyVersion = CURRENT_ENCRYPTION_VERSION) {
    const key = getBackupKey(keyVersion);
    const iv = crypto_1.default.randomBytes(12); // Standard 96-bit GCM IV
    // 1. Gzip compression
    const compressed = await gzip(plainBuffer, { level: 6 });
    // 2. AES-256-GCM Encryption
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // 3. Compute Checksum of the plain database content
    const plainChecksum = calculateChecksum(plainBuffer);
    const header = {
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
exports.encryptAndCompressBackup = encryptAndCompressBackup;
/**
 * Decrypts and decompresses a packaged backup artifact buffer.
 */
async function decryptAndDecompressBackup(artifactBuffer, expectedArtifactChecksum) {
    // 1. Validate Artifact Checksum if provided
    if (expectedArtifactChecksum) {
        const actualChecksum = calculateChecksum(artifactBuffer);
        if (actualChecksum !== expectedArtifactChecksum) {
            throw new Error(`Artifact checksum mismatch! Expected: ${expectedArtifactChecksum}, Actual: ${actualChecksum}`);
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
    const header = JSON.parse(headerBuffer.toString("utf-8"));
    const encryptedPayload = artifactBuffer.subarray(4 + headerLength);
    const key = getBackupKey(header.version);
    const iv = Buffer.from(header.ivHex, "hex");
    const authTag = Buffer.from(header.authTagHex, "hex");
    // 4. Decrypt AES-256-GCM
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let compressed;
    try {
        compressed = Buffer.concat([decipher.update(encryptedPayload), decipher.final()]);
    }
    catch (err) {
        throw new Error(`Decryption failed: Bad auth tag or invalid key. Details: ${err.message}`);
    }
    // 5. Decompress Gzip
    let plainBuffer;
    try {
        plainBuffer = await gunzip(compressed);
    }
    catch (err) {
        throw new Error(`Decompression failed: ${err.message}`);
    }
    // 6. Verify Content Integrity Checksum
    if (header.checksum) {
        const contentChecksum = calculateChecksum(plainBuffer);
        if (contentChecksum !== header.checksum) {
            throw new Error(`Content checksum mismatch! Expected: ${header.checksum}, Actual: ${contentChecksum}`);
        }
    }
    return { plainBuffer, header };
}
exports.decryptAndDecompressBackup = decryptAndDecompressBackup;
