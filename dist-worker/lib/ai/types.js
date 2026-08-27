"use strict";
/**
 * lib/ai/types.ts
 *
 * Unified TypeScript contracts and interfaces for SalesmanPro Central AI Platform.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIPlatformError = exports.AIGenerationStatus = exports.AICreditTransactionStatus = exports.AICreditTransactionType = exports.AICapability = void 0;
const client_1 = require("@prisma/client");
Object.defineProperty(exports, "AICapability", { enumerable: true, get: function () { return client_1.AICapability; } });
Object.defineProperty(exports, "AICreditTransactionType", { enumerable: true, get: function () { return client_1.AICreditTransactionType; } });
Object.defineProperty(exports, "AICreditTransactionStatus", { enumerable: true, get: function () { return client_1.AICreditTransactionStatus; } });
Object.defineProperty(exports, "AIGenerationStatus", { enumerable: true, get: function () { return client_1.AIGenerationStatus; } });
class AIPlatformError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode = 400, details) {
        super(message);
        this.name = "AIPlatformError";
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
    }
}
exports.AIPlatformError = AIPlatformError;
