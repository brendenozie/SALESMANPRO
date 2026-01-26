import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const { roomId, userId, endDate } = await req.json();

    // 1. Check current occupancy
    const room = await prisma.hostelRoom.findUnique({
      where: { id: roomId },
      include: { allocations: { where: { status: "ACTIVE" } } }
    });

    if (!room || room.allocations.length >= room.capacity) {
      return NextResponse.json({ error: "Room is at full capacity" }, { status: 400 });
    }

    // 2. Create allocation
    const allocation = await prisma.hostelAllocation.create({
      data: {
        roomId,
        userId,
        endDate: endDate ? new Date(endDate) : null,
        status: "ACTIVE"
      }
    });

    return NextResponse.json({ data: allocation }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}