"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptKRA = exports.encryptKRA = exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
function getMasterKey() {
    const key = process.env.MASTER_ENCRYPTION_KEY ??
        process.env.NEXT_PUBLIC_MASTER_ENCRYPTION_KEY;
    if (!key) {
        throw new Error("MASTER_ENCRYPTION_KEY is missing");
    }
    const buffer = Buffer.from(key, "hex");
    if (buffer.length !== 32) {
        throw new Error("MASTER_ENCRYPTION_KEY must be 32 bytes (hex-encoded 64 chars).");
    }
    return buffer;
}
function encrypt(value) {
    const MASTER_KEY = getMasterKey();
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv("aes-256-gcm", MASTER_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        iv: iv.toString("hex"),
        value: encrypted.toString("hex"),
        tag: tag.toString("hex"),
    };
}
exports.encrypt = encrypt;
function decrypt(payload) {
    const MASTER_KEY = getMasterKey();
    const iv = Buffer.from(payload.iv, "hex");
    const encrypted = Buffer.from(payload.value, "hex");
    const tag = Buffer.from(payload.tag, "hex");
    const decipher = crypto_1.default.createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]).toString("utf8");
}
exports.decrypt = decrypt;
// import crypto from "crypto";
const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = process.env.ENCRYPTION_KEY; // Must be 32 characters
const IV_LENGTH = 12;
function encryptKRA(text) {
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, "hex"), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}
exports.encryptKRA = encryptKRA;
function decryptKRA(text) {
    const [ivHex, tagHex, encrypted] = text.split(":");
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY, "hex"), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
exports.decryptKRA = decryptKRA;
// export function encrypt(value: string) {
//   const iv = crypto.randomBytes(12); // GCM recommended 96-bit IV
//   const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);
//   const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
//   const tag = cipher.getAuthTag();
//   return {
//     iv: iv.toString("hex"),
//     value: encrypted.toString("hex"),
//     tag: tag.toString("hex"),
//   };
// }
// export function decrypt(payload: { iv: string; value: string; tag: string }) {
//   const iv = Buffer.from(payload.iv, "hex");
//   const encrypted = Buffer.from(payload.value, "hex");
//   const tag = Buffer.from(payload.tag, "hex");
//   const decipher = crypto.createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
//   decipher.setAuthTag(tag);
//   const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
//   return decrypted.toString("utf8");
// }
