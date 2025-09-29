typescript
// app/api/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function updateBooking(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const { searchParams } = new URL(req.url);

  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }

  try {
    // Example: increment reactions on a booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
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
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const PUT = withApiHandler(updateBooking);

