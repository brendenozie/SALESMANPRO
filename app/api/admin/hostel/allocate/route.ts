import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// 1. GET: Search for Students or Educators who are NOT yet allocated
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const companyId = searchParams.get("companyId");

  if (!companyId) return NextResponse.json({ error: "companyId is required" }, { status: 400 });

  try {
    // We search for Students first (the most common use case)
    // We only want students who don't have an ACTIVE hostel allocation
    const students = await prisma.student.findMany({
      where: {
        companyId,
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { admissionNumber: { contains: query, mode: "insensitive" } },
        ],
        // Exclude those already in a room
        hostelMember: {
          hostelAllocations: {
            none: { status: "ACTIVE" }
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        // Include user for the global name if needed
        user: { select: { name: true } }
      },
      take: 10
    });

    return NextResponse.json({ data: students });
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

// 2. POST: Create/Find HostelMember and Create Allocation
export async function POST(req: Request) {
  try {
    const { roomId, studentId, educatorId, companyId, endDate } = await req.json();

    if (!roomId || !companyId || (!studentId && !educatorId)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // A. Validate Room Capacity
      const room = await tx.hostelRoom.findUnique({
        where: { id: roomId },
        include: { _count: { select: { allocations: { where: { status: "ACTIVE" } } } } }
      });

      if (!room) throw new Error("Room not found");
      if (room._count.allocations >= room.capacity) {
        throw new Error("Room is at maximum capacity");
      }

      // B. Upsert HostelMember 
      // This links the Student profile to the Hostel system if not already linked
      const member = await tx.hostelMember.upsert({
        where: studentId ? { studentId } : { educatorId: educatorId! },
        update: { status: "ACTIVE" },
        create: {
          companyId,
          studentId: studentId || null,
          educatorId: educatorId || null,
          memberId: studentId || educatorId || `MEM-${Date.now()}`, // Fallback unique ID
        }
      });

      // C. Check if this member is already in a room
      const activeAlloc = await tx.hostelAllocation.findFirst({
        where: { hostelMemberId: member.id, status: "ACTIVE" }
      });
      if (activeAlloc) throw new Error("Member is already assigned to a room");

      // D. Create Allocation
      const allocation = await tx.hostelAllocation.create({
        data: {
          roomId,
          hostelMemberId: member.id,
          endDate: endDate ? new Date(endDate) : null,
          status: "ACTIVE"
        }
      });

      return allocation;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}