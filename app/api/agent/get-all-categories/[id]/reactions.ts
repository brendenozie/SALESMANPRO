
// app/api/admin/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// PUT -> increment booking reactions
async function updateBooking(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const bookingId = params.id;

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        reactions: { increment: 1 },
      },
    });

    return formatResponse(
      true,
      {
        id: updatedBooking.id,
        reactions: updatedBooking.reactions,
        status: updatedBooking.status,
      },
      "Booking updated successfully",
      200
    );
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export const PUT = withApiHandler(updateBooking);

