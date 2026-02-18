import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function PATCH(req: Request) {
  try {
    const { allocationId, targetRoomId } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      // 1. End current allocation
      const oldAlloc = await tx.hostelAllocation.update({
        where: { id: allocationId },
        data: { status: "INACTIVE", endDate: new Date() }
      });

      // 2. Check target room capacity
      const targetRoom = await tx.hostelRoom.findUnique({
        where: { id: targetRoomId },
        include: { _count: { select: { allocations: { where: { status: "ACTIVE" } } } } }
      });

      if (!targetRoom || targetRoom._count.allocations >= targetRoom.capacity) {
        throw new Error("Target room is full or does not exist");
      }

      // 3. Create new allocation
      return await tx.hostelAllocation.create({
        data: {
          hostelMemberId: oldAlloc.hostelMemberId,
          roomId: targetRoomId,
          status: "ACTIVE",
          startDate: new Date(),
        }
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}