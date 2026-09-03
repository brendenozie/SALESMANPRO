"use strict";
/**
 * SalesmanPro POS — KRA eTIMS Cryptographic Service
 * Secures communication keys (cmcKey), manager keys, and taxpayer secrets at rest.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskSensitive = exports.decryptCredential = exports.encryptCredential = void 0;
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
function getEncryptionKey() {
    const secret = process.env.KRA_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || process.env.MASTER_ENCRYPTION_KEY;
    if (!secret) {
        // Generate deterministic 32-byte key from app secret or default seed in development
        const appSecret = process.env.NEXTAUTH_SECRET || "salesmanpro-secure-etims-master-key-32b";
        return crypto_1.default.createHash("sha256").update(appSecret).digest();
    }
    // If hex string of 64 chars (32 bytes)
    if (/^[0-9a-fA-F]{64}$/.test(secret)) {
        return Buffer.from(secret, "hex");
    }
    // Otherwise hash to ensure exact 32 bytes
    return crypto_1.default.createHash("sha256").update(secret).digest();
}
/**
 * Encrypt sensitive eTIMS credential (cmcKey, managerKey, etc.)
 */
function encryptCredential(plainText) {
    if (!plainText)
        return "";
    const key = getEncryptionKey();
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}
exports.encryptCredential = encryptCredential;
/**
 * Decrypt sensitive eTIMS credential
 */
function decryptCredential(cipherText) {
    if (!cipherText)
        return "";
    try {
        const parts = cipherText.split(":");
        if (parts.length !== 3) {
            // If not in encrypted format (e.g. legacy plain text during migration)
            return cipherText;
        }
        const [ivHex, tagHex, encrypted] = parts;
        const key = getEncryptionKey();
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
        decipher.setAuthTag(Buffer.from(tagHex, "hex"));
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
    catch (error) {
        console.error("[ETIMS_CRYPTO] Failed to decrypt credential");
        return "";
    }
}
exports.decryptCredential = decryptCredential;
/**
 * Mask KRA PIN or keys for safe display in UI/logs
 */
function maskSensitive(text, visibleChars = 4) {
    if (!text || text.length <= visibleChars)
        return "••••••••";
    const start = text.slice(0, 2);
    const end = text.slice(-visibleChars);
    return `${start}${"•".repeat(Math.max(4, text.length - visibleChars - 2))}${end}`;
}
exports.maskSensitive = maskSensitive;
