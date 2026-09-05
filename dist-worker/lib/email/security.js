"use strict";
/**
 * lib/email/security.ts
 *
 * Cryptographic security and SSRF protection for tenant email credentials.
 * Credentials are encrypted at rest using AES-256-GCM.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSmtpHost = exports.decryptEmailSecret = exports.encryptEmailSecret = void 0;
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = "aes-256-gcm";
function getMasterKey() {
    const secret = process.env.ENCRYPTION_KEY ||
        process.env.BACKUP_ENCRYPTION_KEY ||
        process.env.NEXTAUTH_SECRET ||
        "salesmanpro-default-secure-fallback-encryption-key";
    // Creates a deterministic 32-byte (256-bit) key regardless of input secret format
    return crypto_1.default.createHash("sha256").update(secret).digest();
}
/**
 * Encrypts an email credential (password, API token, OAuth secret).
 * Returns hex strings for value, iv, and tag for safe database storage.
 */
function encryptEmailSecret(plainText) {
    if (!plainText) {
        throw new Error("Cannot encrypt empty secret");
    }
    const iv = crypto_1.default.randomBytes(12); // Standard 96-bit IV for AES-GCM
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, getMasterKey(), iv);
    const encrypted = Buffer.concat([
        cipher.update(plainText, "utf8"),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return {
        value: encrypted.toString("hex"),
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
    };
}
exports.encryptEmailSecret = encryptEmailSecret;
/**
 * Decrypts an encrypted email credential from database storage.
 */
function decryptEmailSecret(params) {
    const { value, iv, tag } = params;
    if (!value || !iv || !tag) {
        return null;
    }
    try {
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, getMasterKey(), Buffer.from(iv, "hex"));
        decipher.setAuthTag(Buffer.from(tag, "hex"));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(value, "hex")),
            decipher.final(),
        ]);
        return decrypted.toString("utf8");
    }
    catch (err) {
        console.error("[EmailSecurity] Decryption failed:", err.message);
        throw new Error("Decryption failed. Email credential may be corrupted or key changed.");
    }
}
exports.decryptEmailSecret = decryptEmailSecret;
/**
 * SSRF Protection: Validates an SMTP hostname or IP address.
 * Prevents tenants or attackers from configuring internal infrastructure,
 * cloud metadata endpoints (e.g. AWS 169.254.169.254), or loopback interfaces.
 */
function validateSmtpHost(host) {
    if (!host || typeof host !== "string") {
        return { valid: false, reason: "Host is required" };
    }
    const cleanHost = host.trim().toLowerCase();
    // Prohibited hostnames
    const forbiddenNames = [
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "::1",
        "metadata.google.internal",
        "instance-data",
    ];
    if (forbiddenNames.includes(cleanHost)) {
        return { valid: false, reason: "Local and loopback addresses are not permitted" };
    }
    // IPv4 Private & Reserved Ranges check:
    // 127.0.0.0/8 (Loopback)
    // 10.0.0.0/8 (Private)
    // 172.16.0.0/12 (Private)
    // 192.168.0.0/16 (Private)
    // 169.254.0.0/16 (Link-Local & Cloud Metadata)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = cleanHost.match(ipv4Regex);
    if (match) {
        const b0 = parseInt(match[1], 10);
        const b1 = parseInt(match[2], 10);
        if (b0 === 127)
            return { valid: false, reason: "Loopback IP range is prohibited" };
        if (b0 === 10)
            return { valid: false, reason: "Private 10.0.0.0/8 network is prohibited" };
        if (b0 === 172 && b1 >= 16 && b1 <= 31)
            return { valid: false, reason: "Private 172.16.0.0/12 network is prohibited" };
        if (b0 === 192 && b1 === 168)
            return { valid: false, reason: "Private 192.168.0.0/16 network is prohibited" };
        if (b0 === 169 && b1 === 254)
            return { valid: false, reason: "Link-local cloud metadata IP is prohibited" };
        if (b0 === 0)
            return { valid: false, reason: "Zero network is prohibited" };
    }
    // Basic domain or IP format verification
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    if (!domainRegex.test(cleanHost)) {
        return { valid: false, reason: "Invalid domain or hostname format" };
    }
    return { valid: true };
}
exports.validateSmtpHost = validateSmtpHost;
