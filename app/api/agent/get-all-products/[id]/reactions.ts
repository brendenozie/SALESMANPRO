typescript
// app/api/admin/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// PUT -> Increment booking reactions
async function updateBooking(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const bookingId = params.id;
  const { searchParams } = new URL(req.url);

  const agentId = searchParams.get("agentId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }

  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        reactions: {
          increment: 1,
        },
      },
    });

    return formatResponse(
      true,
      {
        id: booking.id,
        reactions: booking.reactions,
        status: booking.status,
      },
      "Booking updated successfully",
      200
    );
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const PUT = withApiHandler(updateBooking);

