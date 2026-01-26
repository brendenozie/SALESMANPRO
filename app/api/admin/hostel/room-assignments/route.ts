import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    // 1. Get all students NOT in an active allocation
    const activeAllocations = await prisma.hostelAllocation.findMany({
      where: { status: "ACTIVE" },
      select: { userId: true }
    });
    const assignedUserIds = activeAllocations.map(a => a.userId);

    const unassigned = await prisma.user.findMany({
      where: {
        companyId,
        role: "STUDENT",
        id: { notIn: assignedUserIds }
      },
      select: { id: true, name: true,  } // grade: true, gender: true
    });

    // 2. Get all rooms with their active allocations
    const rooms = await prisma.hostelRoom.findMany({
      where: { block: { companyId } },
      include: {
        block: true,
        allocations: {
          where: { status: "ACTIVE" },
          include: { user: { select: { name: true } } }
        }
      }
    });

    return NextResponse.json({ data: { unassigned, rooms } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}