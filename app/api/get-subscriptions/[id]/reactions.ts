// app/api/booking/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// ================= PUT =================
async function updateBooking(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("id");

  if (!bookingId) {
    return formatResponse(false, null, "Missing bookingId", 400);
  }

  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(false, null, "Invalid pagination parameters.", 400);
  }

  try {
    const ama = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        reactions: { increment: 1 },
      },
      select: {
        id: true,
        reactions: true,
        status: true,
      },
    });

    return formatResponse(true, ama, "Booking updated");
  } catch (e: any) {
    console.error("PUT /api/booking error:", e);
    return formatResponse(false, null, e.message || "Internal server error", 500);
  }
}

export const PUT = withApiHandler(updateBooking);
