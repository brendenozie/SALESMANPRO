import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    // 1. Fetch Unassigned Students
    
    const cacheKey = `admin:room-assignments:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const unassignedStudents = await prisma.student.findMany({
      where: {
        companyId,
        OR: [
          { hostelMember: { is: null } },
          { hostelMember: { hostelAllocations: { none: { status: "ACTIVE" } } } }
        ]
      },
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        admissionNumber: true,
      }
    });

    // 2. Fetch Unassigned Educators
    const unassignedEducators = await prisma.educator.findMany({
      where: {
        companyId,
        OR: [
          { hostelMember: { is: null } },
          { hostelMember: { hostelAllocations: { none: { status: "ACTIVE" } } } }
        ]
      },
      select: {
        id: true,
        loginCode: true,
        user: { select: { name: true } }
      }
    });

    // 3. Get Rooms with Residents
    const rooms = await prisma.hostelRoom.findMany({
      where: { block: { companyId } },
      include: {
        block: { select: { name: true } },
        allocations: {
          where: { status: "ACTIVE" },
          include: { 
            hostelMember: {
              include: {
                student: { select: { firstName: true, lastName: true } },
                educator: { include: { user: { select: { name: true } } } }
              }
            } 
          }
        }
      }
    });

    // Merge and Normalize Unassigned List
    const normalizedUnassigned = [
      ...unassignedStudents.map(s => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        idNumber: s.admissionNumber,
        type: "STUDENT"
      })),
      ...unassignedEducators.map(e => ({
        id: e.id,
        name: e.user?.name || "Staff Member",
        idNumber: e.loginCode,
        type: "STAFF"
      }))
    ];

    const transformedRooms = rooms.map(room => ({
      id: room.id,
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      floor: room.floor,
      wing: room.block.name,
      occupancy: room.allocations.length,
      residents: room.allocations.map(alloc => ({
        allocationId: alloc.id,
        name: alloc.hostelMember?.student 
          ? `${alloc.hostelMember.student.firstName} ${alloc.hostelMember.student.lastName}`
          : alloc.hostelMember?.educator?.user?.name || `${alloc.hostelMember?.memberId}`,
        type: alloc.hostelMember?.student ? "STUDENT" : "STAFF",
        joinedAt: alloc.startDate
      }))
    }));

    //cache the combined result for 60 seconds
    try {
      const combinedData = { unassigned: normalizedUnassigned, rooms: transformedRooms };
      await cacheSet(cacheKey, combinedData, 60);
    } catch (e) {
      console.error("Error caching room assignments data:", e);
    }

    return formatResponse(true, { unassigned: normalizedUnassigned, rooms: transformedRooms }, "Room assignments fetched successfully", 200);
    
  } catch (error) {
    console.error("[ALLOCATION_DATA_GET]", error);
    return formatResponse(false, null, "Failed to fetch data", 500);
  }
}