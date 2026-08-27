"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptSecret = void 0;
// lib/payments/decrypt.ts
const crypto_1 = require("@/lib/crypto");
function decryptSecret(encrypted, iv, tag) {
    if (!encrypted || !iv || !tag)
        return undefined;
    return (0, crypto_1.decrypt)({ value: encrypted, iv, tag });
}
exports.decryptSecret = decryptSecret;
