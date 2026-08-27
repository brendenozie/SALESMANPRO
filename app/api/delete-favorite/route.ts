import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

/**
 * Handler to delete a hotel bookmark/saved item based on hotelId and userEmail.
 */
async function deleteHotelBookmark(req: Request) {
  // 1. Authentication Check
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  // 2. Read and Parse JSON body
  let body;
  try {
    body = await req.json();
  } catch {
    return formatResponse(false, null, "Invalid JSON body provided.", 400);
  }

  const { hotelId, userEmail } = body;

  // 3. Validation
  if (!hotelId || !userEmail || typeof hotelId !== "string" || typeof userEmail !== "string") {
    return formatResponse(
      false,
      null,
      "Missing required fields: hotelId and userEmail (both strings).",
      400
    );
  }

  try {
    // 4. Delete the hotel bookmark/save using the composite unique key
    // await prisma.hotel.delete({
    //   where: {
    //     hotelId_userEmail: {
    //       hotelId,
    //       userEmail,
    //     },
    //   },
    // });

    // 5. Success Response
    return formatResponse(
      true,
      { hotelId, userEmail },
      "Hotel bookmark successfully deleted.",
      200
    );
  } catch (error: any) {
    // P2025 is Prisma’s "Record not found"
    if (error.code === "P2025") {
      return formatResponse(false, null, "Bookmark not found or already deleted.", 404);
    }

    console.error("Error deleting hotel bookmark:", error);
    return formatResponse(
      false,
      null,
      error.message || "An error occurred while deleting the bookmark.",
      500
    );
  }
}

// Export wrapped handler
export const DELETE = withApiHandler(deleteHotelBookmark);
