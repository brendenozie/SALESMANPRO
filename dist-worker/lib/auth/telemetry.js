"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthTimer = exports.authLog = exports.sanitizeLogDetails = exports.maskEmail = exports.generateCorrelationId = void 0;
// lib/auth/telemetry.ts
const crypto_1 = require("crypto");
function generateCorrelationId() {
    try {
        return (0, crypto_1.randomUUID)().replace(/-/g, "").slice(0, 12);
    }
    catch {
        return Math.random().toString(36).substring(2, 14);
    }
}
exports.generateCorrelationId = generateCorrelationId;
function maskEmail(email) {
    if (!email || typeof email !== "string")
        return "";
    const parts = email.trim().toLowerCase().split("@");
    if (parts.length !== 2)
        return "***";
    const user = parts[0];
    const domain = parts[1];
    const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0] || "*"}***`;
    return `${maskedUser}@${domain}`;
}
exports.maskEmail = maskEmail;
function sanitizeLogDetails(details = {}) {
    const sanitized = {};
    const sensitiveKeys = new Set([
        "password",
        "token",
        "auth_token",
        "secret",
        "access_token",
        "refresh_token",
        "id_token",
        "code",
        "state",
        "cookie",
        "cookieHeader",
    ]);
    for (const [key, val] of Object.entries(details)) {
        if (sensitiveKeys.has(key.toLowerCase()) || key.toLowerCase().includes("secret") || key.toLowerCase().includes("token")) {
            continue; // Never log secrets or tokens
        }
        if (key.toLowerCase() === "email") {
            sanitized[key] = maskEmail(String(val));
        }
        else if (typeof val === "object" && val !== null) {
            // Avoid nested deep objects or circular structures
            sanitized[key] = "[Object]";
        }
        else {
            sanitized[key] = val;
        }
    }
    return sanitized;
}
exports.sanitizeLogDetails = sanitizeLogDetails;
/**
 * Production-safe structured auth telemetry log.
 * Format: [AUTH <correlationId>] stage=<stage> elapsedMs=<duration> key=value ...
 */
function authLog(correlationId, stage, elapsedMs, details = {}) {
    const safeCId = correlationId || "unknown";
    const safeStage = stage || "unspecified";
    const elapsedPart = typeof elapsedMs === "number" ? ` elapsedMs=${Math.round(elapsedMs)}` : "";
    const safeDetails = sanitizeLogDetails(details);
    const detailEntries = Object.entries(safeDetails)
        .filter(([_, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(" ");
    const detailString = detailEntries ? ` ${detailEntries}` : "";
    console.log(`[AUTH ${safeCId}] stage=${safeStage}${elapsedPart}${detailString}`);
}
exports.authLog = authLog;
/**
 * Creates an in-flight timer for measuring durations between stages.
 */
function createAuthTimer(correlationId) {
    const cId = correlationId || generateCorrelationId();
    const start = Date.now();
    let lastMark = start;
    return {
        correlationId: cId,
        mark(stage, details) {
            const now = Date.now();
            const stepDuration = now - lastMark;
            lastMark = now;
            authLog(cId, stage, stepDuration, details);
            return stepDuration;
        },
        total(stage, details) {
            const totalDuration = Date.now() - start;
            authLog(cId, stage, totalDuration, details);
            return totalDuration;
        },
    };
}
exports.createAuthTimer = createAuthTimer;
