"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrismaError = void 0;
// /lib/hooks/handlePrismaError.ts
const client_1 = require("@prisma/client");
const formatResponse_1 = require("../formatResponse");
function handlePrismaError(error, requestId) {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002": // Unique constraint
                return (0, formatResponse_1.formatResponse)(false, null, { code: "DUPLICATE_ENTRY", message: "Duplicate entry already exists" }, 409, undefined, requestId);
            case "P2003": // Foreign key constraint
                return (0, formatResponse_1.formatResponse)(false, null, { code: "CONFLICTING_RELATION", message: "Linked records prevent this action" }, 409, undefined, requestId);
            case "P2025": // Record not found
                return (0, formatResponse_1.formatResponse)(false, null, { code: "NOT_FOUND", message: "Record not found" }, 404, undefined, requestId);
            default:
                console.error(`[PRISMA_DB_ERROR][${requestId || "unknown"}] code: ${error.code}:`, error.message);
                return (0, formatResponse_1.formatResponse)(false, null, { code: "DATABASE_ERROR", message: "A database error occurred" }, 500, undefined, requestId);
        }
    }
    console.error(`[UNHANDLED_ERROR][${requestId || "unknown"}]:`, error);
    return (0, formatResponse_1.formatResponse)(false, null, { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" }, 500, undefined, requestId);
}
exports.handlePrismaError = handlePrismaError;
