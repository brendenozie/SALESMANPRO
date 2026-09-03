"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withErrorHandler = void 0;
// /lib/hooks/withErrorHandler.ts
const handlePrismaError_1 = require("@/lib/hooks/handlePrismaError");
/**
 * Base error-handling wrapper for API handlers.
 * Ensures Prisma and unexpected errors are handled consistently.
 */
function withErrorHandler(handler) {
    return async (request, context) => {
        try {
            return await handler(request, context);
        }
        catch (error) {
            return (0, handlePrismaError_1.handlePrismaError)(error);
        }
    };
}
exports.withErrorHandler = withErrorHandler;
// app/api/public/academic-levels/[id]/route.ts
// import prisma from "@/server/db/prismadb";
// import { formatResponse } from "@/lib/verifyAuth";
// import { withErrorHandler } from "@/lib/hooks/withErrorHandler";
// export const GET = withErrorHandler(async (request, { params }) => {
//   const { id } = params;
//   const academicLevel = await prisma.academicLevel.findUnique({ where: { id } });
//   if (!academicLevel) {
//     return formatResponse(false, null, "Academic level not found", 404);
//   }
//   return formatResponse(true, academicLevel, "Fetched successfully", 200);
// });
