import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return formatResponse(false, null, "User or allocation ID is required", 400);
    }

    // Try finding by allocation id first
    let allocation = await prisma.hostelAllocation.findUnique({
      where: { id: userId },
      include: { room: true },
    });

    // If not found by allocation id, try finding active allocation by hostelMemberId
    if (!allocation) {
      allocation = await prisma.hostelAllocation.findFirst({
        where: {
          hostelMemberId: userId,
          status: "ACTIVE",
        },
        include: { room: true },
      });
    }

    if (!allocation) {
      return formatResponse(false, null, "Active hostel allocation not found", 404);
    }

    // Update allocation to VACATED
    const updatedAllocation = await prisma.hostelAllocation.update({
      where: { id: allocation.id },
      data: {
        status: "VACATED",
        endDate: new Date(),
      },
    });

    // Update room availability if capacity is freed
    if (allocation.roomId) {
      try {
        const [activeCount, room] = await Promise.all([
          prisma.hostelAllocation.count({
            where: { roomId: allocation.roomId, status: "ACTIVE" },
          }),
          prisma.hostelRoom.findUnique({
            where: { id: allocation.roomId },
          }),
        ]);

        if (room && activeCount < room.capacity) {
          await prisma.hostelRoom.update({
            where: { id: allocation.roomId },
            data: { isAvailable: true },
          });
        }
      } catch (err) {
        console.error("[CHECKOUT_ROOM_UPDATE_ERROR]", err);
      }
    }

    return formatResponse(
      true,
      updatedAllocation,
      "Resident checked out successfully and room vacancy restored",
      200
    );
  } catch (error: any) {
    console.error("[HOSTEL_CHECKOUT_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to process checkout", 500);
  }
}
