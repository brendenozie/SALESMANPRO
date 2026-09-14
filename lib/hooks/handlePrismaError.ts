// /lib/hooks/handlePrismaError.ts
import { Prisma } from "@prisma/client";
import { formatResponse } from "../formatResponse";

export function handlePrismaError(error: unknown, requestId?: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": // Unique constraint
        return formatResponse(
          false,
          null,
          { code: "DUPLICATE_ENTRY", message: "Duplicate entry already exists" },
          409,
          undefined,
          requestId,
        );

      case "P2003": // Foreign key constraint
        return formatResponse(
          false,
          null,
          { code: "CONFLICTING_RELATION", message: "Linked records prevent this action" },
          409,
          undefined,
          requestId,
        );

      case "P2025": // Record not found
        return formatResponse(
          false,
          null,
          { code: "NOT_FOUND", message: "Record not found" },
          404,
          undefined,
          requestId,
        );

      default:
        console.error(`[PRISMA_DB_ERROR][${requestId || "unknown"}] code: ${error.code}:`, error.message);
        return formatResponse(
          false,
          null,
          { code: "DATABASE_ERROR", message: "A database error occurred" },
          500,
          undefined,
          requestId,
        );
    }
  }

  console.error(`[UNHANDLED_ERROR][${requestId || "unknown"}]:`, error);
  return formatResponse(
    false,
    null,
    { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" },
    500,
    undefined,
    requestId,
  );
}
