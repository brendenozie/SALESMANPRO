// /lib/hooks/withErrorHandler.ts
import { handlePrismaError } from "@/lib/hooks/handlePrismaError";

/**
 * Base error-handling wrapper for API handlers.
 * Ensures Prisma and unexpected errors are handled consistently.
 */
export function withErrorHandler<T = any>(
  handler: (request: Request, context: { params: any; user?: any }) => Promise<Response>
) {
  return async (request: Request, context: { params: any; user?: any }) => {
    try {
      return await handler(request, context);
    } catch (error: unknown) {
      return handlePrismaError(error);
    }
  };
}


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
