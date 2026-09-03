"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.looksLikePlaceholderSecret = exports.decryptWhatsAppAppSecret = exports.decryptWhatsAppAccessToken = void 0;
const crypto_1 = require("@/lib/crypto");
function decryptWhatsAppAccessToken(account) {
    if (account.accessTokenEncrypted && account.accessTokenIv && account.accessTokenTag) {
        return (0, crypto_1.decrypt)({
            value: account.accessTokenEncrypted,
            iv: account.accessTokenIv,
            tag: account.accessTokenTag,
        });
    }
    return process.env.WHATSAPP_ACCESS_TOKEN ?? "";
}
exports.decryptWhatsAppAccessToken = decryptWhatsAppAccessToken;
function decryptWhatsAppAppSecret(account) {
    if (account.appSecretEncrypted && account.appSecretIv && account.appSecretTag) {
        return (0, crypto_1.decrypt)({
            value: account.appSecretEncrypted,
            iv: account.appSecretIv,
            tag: account.appSecretTag,
        });
    }
    return process.env.WHATSAPP_APP_SECRET ?? "";
}
exports.decryptWhatsAppAppSecret = decryptWhatsAppAppSecret;
function looksLikePlaceholderSecret(value) {
    if (!value)
        return true;
    const trimmed = value.trim();
    if (!trimmed)
        return true;
    return /^\*+$/.test(trimmed) || trimmed === "unchanged" || trimmed === "[REDACTED]";
}
exports.looksLikePlaceholderSecret = looksLikePlaceholderSecret;
