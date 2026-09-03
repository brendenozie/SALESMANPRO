"use strict";
/**
 * lib/social/socialCrypto.ts
 *
 * Secure Hardware-Grade Token Encryption and Decryption for Social Media Platform
 * OAuth access and refresh tokens using AES-256-GCM.
 *
 * CRITICAL SECURITY INVARIANT:
 * Plaintext tokens must NEVER be logged, sent to the browser, or exposed in AI prompts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialCrypto = void 0;
const crypto_1 = require("../crypto");
exports.socialCrypto = {
    /**
     * Encrypts an OAuth access token or refresh token.
     */
    encryptToken(token) {
        if (!token) {
            throw new Error("Cannot encrypt empty social token");
        }
        const result = (0, crypto_1.encrypt)(token);
        return {
            encrypted: result.value,
            iv: result.iv,
            tag: result.tag,
        };
    },
    /**
     * Decrypts an encrypted token bundle safely on the server.
     */
    decryptToken(bundle) {
        if (!bundle.encrypted || !bundle.iv || !bundle.tag) {
            throw new Error("Invalid or incomplete encrypted token bundle");
        }
        return (0, crypto_1.decrypt)({
            value: bundle.encrypted,
            iv: bundle.iv,
            tag: bundle.tag,
        });
    },
    /**
     * Masks sensitive IDs or tokens for safe display in UI/telemetry.
     * e.g., "EAABw...3kL9"
     */
    maskSecret(secret) {
        if (!secret)
            return "••••••••";
        if (secret.length <= 8)
            return "••••••••";
        return `${secret.substring(0, 4)}••••${secret.substring(secret.length - 4)}`;
    },
};
