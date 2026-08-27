// /lib/hooks/handlePrismaError.ts
import { Prisma } from "@prisma/client";
import { formatResponse } from "../formatResponse";

export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": // Unique constraint
        return formatResponse(false, null, "Duplicate entry", 409);

      case "P2003": // Foreign key constraint
        return formatResponse(
          false,
          null,
          "Linked records prevent this action",
          409
        );

      case "P2025": // Record not found
        return formatResponse(false, null, "Record not found", 404);

      default:
        console.error("Unhandled Prisma error:", error);
        return formatResponse(false, null, "Database error", 500);
    }
  }

  console.error("Unhandled error:", error);
  return formatResponse(false, null, "Server error", 500);
}
