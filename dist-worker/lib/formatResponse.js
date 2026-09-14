"use strict";
// -----------------------------
// lib/formatResponse.ts
// Standardized API Response Engine for SalesmanPro
// -----------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = exports.formatSuccess = exports.formatResponse = void 0;
const server_1 = require("next/server");
/**
 * Standard response formatter with backward compatibility:
 * - If success is true, treats string 'error' argument as 'message' rather than an error object.
 * - If success is false, treats string 'error' argument as the actionable error message.
 */
function formatResponse(success, data, errorOrMessage, status = 200, meta, requestId) {
    if (success) {
        const isStringMessage = typeof errorOrMessage === "string";
        const payload = {
            success: true,
            data: data !== undefined ? data : null,
            message: isStringMessage ? errorOrMessage : undefined,
            error: null,
            ...(meta ? { meta } : {}),
            ...(requestId ? { requestId } : {}),
        };
        return server_1.NextResponse.json(payload, { status });
    }
    // Error case
    const isStringError = typeof errorOrMessage === "string";
    const errorMessage = isStringError
        ? errorOrMessage
        : errorOrMessage?.message || "An unexpected error occurred";
    const payload = {
        success: false,
        data: data !== undefined ? data : null,
        message: errorMessage,
        error: isStringError
            ? { message: errorOrMessage }
            : errorOrMessage || { message: errorMessage },
        ...(requestId ? { requestId } : {}),
    };
    return server_1.NextResponse.json(payload, { status: status >= 400 ? status : 400 });
}
exports.formatResponse = formatResponse;
/**
 * Canonical success response helper
 */
function formatSuccess(data, message, meta, status = 200, requestId) {
    return formatResponse(true, data, message, status, meta, requestId);
}
exports.formatSuccess = formatSuccess;
/**
 * Canonical error response helper
 */
function formatError(message, code = "BAD_REQUEST", status = 400, details, requestId) {
    return formatResponse(false, null, { code, message, details }, status, undefined, requestId);
}
exports.formatError = formatError;
