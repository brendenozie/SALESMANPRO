"use strict";
/**
 * SalesmanPro Unified Print Protocol Contract
 * Version: 1
 * Platform-independent normalized print payload schema for Web, WPF Desktop, and Android POS clients.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrintJobId = exports.validatePrintPayload = exports.PROTOCOL_VERSION = void 0;
exports.PROTOCOL_VERSION = 1;
/**
 * Validates a print payload against protocol version 1 specifications.
 */
function validatePrintPayload(payload) {
    const errors = [];
    if (!payload) {
        return { valid: false, errors: ["Missing payload"] };
    }
    if (payload.protocolVersion !== exports.PROTOCOL_VERSION) {
        errors.push(`Unsupported protocol version: ${payload.protocolVersion}, expected ${exports.PROTOCOL_VERSION}`);
    }
    if (!payload.jobId || typeof payload.jobId !== "string") {
        errors.push("Missing or invalid jobId");
    }
    if (!payload.documentType) {
        errors.push("Missing documentType");
    }
    if (!payload.document) {
        errors.push("Missing document object");
    }
    else {
        const doc = payload.document;
        if (!doc.number)
            errors.push("Missing document.number");
        if (!doc.business?.name)
            errors.push("Missing document.business.name");
        if (!doc.totals) {
            errors.push("Missing document.totals");
        }
        else {
            if (typeof doc.totals.total !== "number" || isNaN(doc.totals.total)) {
                errors.push("Invalid document.totals.total");
            }
            if (!doc.totals.currency) {
                errors.push("Missing document.totals.currency");
            }
        }
        if (!Array.isArray(doc.items)) {
            errors.push("document.items must be an array");
        }
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
exports.validatePrintPayload = validatePrintPayload;
/**
 * Creates a unique print job ID
 */
function createPrintJobId(prefix = "job") {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${randomPart}`;
}
exports.createPrintJobId = createPrintJobId;
