import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const companyId = searchParams.get("companyId");

  // Find users who aren't currently allocated to a room
  const users = await prisma.user.findMany({
    where: {
      companyId,
      name: { contains: query, mode: 'insensitive' },
      // Logic: User has no ACTIVE allocations
      hostelAllocations: { none: { status: "ACTIVE" } }
    },
    take: 5
  });

  return NextResponse.json({ data: users });
}


export async function POST(req: Request) {
  try {
    const { roomId, userId, endDate } = await req.json();

    // 1. Validate Room Capacity
    const room = await prisma.hostelRoom.findUnique({
      where: { id: roomId },
      include: { _count: { select: { allocations: { where: { status: "ACTIVE" } } } } }
    });

    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (room._count.allocations >= room.capacity) {
      return NextResponse.json({ error: "Room is at maximum capacity" }, { status: 400 });
    }

    // 2. Check if student is already allocated elsewhere
    const existingAllocation = await prisma.hostelAllocation.findFirst({
      where: { userId, status: "ACTIVE" }
    });
    if (existingAllocation) {
      return NextResponse.json({ error: "Student is already assigned to a room" }, { status: 400 });
    }

    // 3. Create Allocation
    const allocation = await prisma.hostelAllocation.create({
      data: {
        roomId,
        userId,
        endDate: endDate ? new Date(endDate) : null,
        status: "ACTIVE"
      }
    });

    return NextResponse.json({ success: true, data: allocation });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
