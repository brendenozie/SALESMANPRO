"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrismaError = void 0;
// /lib/hooks/handlePrismaError.ts
const client_1 = require("@prisma/client");
const formatResponse_1 = require("../formatResponse");
function handlePrismaError(error) {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002": // Unique constraint
                return (0, formatResponse_1.formatResponse)(false, null, "Duplicate entry", 409);
            case "P2003": // Foreign key constraint
                return (0, formatResponse_1.formatResponse)(false, null, "Linked records prevent this action", 409);
            case "P2025": // Record not found
                return (0, formatResponse_1.formatResponse)(false, null, "Record not found", 404);
            default:
                console.error("Unhandled Prisma error:", error);
                return (0, formatResponse_1.formatResponse)(false, null, "Database error", 500);
        }
    }
    console.error("Unhandled error:", error);
    return (0, formatResponse_1.formatResponse)(false, null, "Server error", 500);
}
exports.handlePrismaError = handlePrismaError;
