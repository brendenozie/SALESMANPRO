import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

// 1. GET: Search for Students or Educators who are NOT yet allocated
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const companyId = searchParams.get("companyId");

  if (!companyId) return NextResponse.json({ error: "companyId is required" }, { status: 400 });

  try {
    // We search for Students first (the most common use case)
    // We only want students who don't have an ACTIVE hostel allocation
    
    const cacheKey = buildTenantCacheKey(companyId, "allocate", { query });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

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

  try {
    if (students) {
      await cacheSet(cacheKey, students, 60);
    }
  } catch (e) {
    console.error("Error caching students data:", e);
  }

    return formatResponse(true, students, "Students fetched successfully", 200);
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

// 2. POST: Create/Find HostelMember and Create Allocation
export async function POST(req: Request) {
  try {
    const { roomId, studentId, educatorId, companyId, endDate } = await req.json();

    // Check if exactly one ID is provided (XOR logic)
    const hasExactlyOneRecipient = (!!studentId !== !!educatorId);

    if (!roomId || !companyId || !hasExactlyOneRecipient) {
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

    try {
      await cacheDel(`tenant:${companyId}:allocate:*`);
      await cacheDel(`admin:allocate:*`);
    } catch (e) {}

    return formatResponse(true, result, "Allocation created successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error.message || "Internal Server Error", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { allocationId, status, notes } = body;

    if (!allocationId) {
      return formatResponse(false, null, "Allocation ID is required", 400);
    }

    // Process the checkout in a transaction to maintain data integrity
    const updatedAllocation = await prisma.$transaction(async (tx) => {
      
      // 1. Check if the allocation exists and is currently active
      const existing = await tx.hostelAllocation.findUnique({
        where: { id: allocationId },
        include: { room: true }
      });

      if (!existing) {
        throw new Error("Allocation record not found");
      }

      if (existing.status === "INACTIVE") {
        throw new Error("Resident is already checked out");
      }

      // 2. Update the allocation to INACTIVE
      const allocation = await tx.hostelAllocation.update({
        where: { id: allocationId },
        data: {
          status: status || "INACTIVE",
          endDate: new Date(),
          // If you add a notes field to your schema, you can save exit remarks here
        },
      });

      // 3. Optional: Logic for "HostelMember" status
      // We keep the member ACTIVE so they can be re-assigned later, 
      // but you could set it to INACTIVE if they are leaving the school.
      
      return allocation;
    });

    return formatResponse(true, updatedAllocation, "Resident checked out successfully", 200);

  } catch (error: any) {
    console.error("[CHECKOUT_PATCH_ERROR]", error);
    return formatResponse(false, null, error.message || "Internal Server Error", 500);
  }
}