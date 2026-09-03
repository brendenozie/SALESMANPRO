"use strict";
/**
 * Tenant-scoped authentication for WhatsApp admin APIs.
 * Company identity always comes from the authenticated session, never the client body.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.unauthorizedResponse = exports.requireWhatsAppAdmin = void 0;
const authHelper_1 = require("@/lib/ai/authHelper");
const formatResponse_1 = require("@/lib/formatResponse");
async function requireWhatsAppAdmin(req) {
    return (0, authHelper_1.resolveAIAuth)(req);
}
exports.requireWhatsAppAdmin = requireWhatsAppAdmin;
function unauthorizedResponse(error) {
    const status = typeof error === "object" && error !== null && "statusCode" in error
        ? Number(error.statusCode) || 401
        : 401;
    const message = error instanceof Error ? error.message : "Authentication required";
    return (0, formatResponse_1.formatResponse)(false, null, message, status);
}
exports.unauthorizedResponse = unauthorizedResponse;
