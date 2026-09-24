import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

async function resolveCompanyId(idOrSlug: string): Promise<string> {
  if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    return idOrSlug;
  }
  const comp = await prisma.company.findFirst({
    where: { slug: idOrSlug },
    select: { id: true },
  });
  return comp?.id || idOrSlug;
}

// 1. GET: Search for Consumers or Students who are NOT yet allocated to an active room
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const rawCompanyId = searchParams.get("companyId");

  if (!rawCompanyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  const companyId = await resolveCompanyId(rawCompanyId);

  try {
    const cacheKey = buildTenantCacheKey(companyId, "allocate", { query });

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    // Search Consumers (commercial/residential tenants)
    const consumers = await prisma.consumer.findMany({
      where: {
        companyId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
        hostelMember: {
          hostelAllocations: {
            none: { status: "ACTIVE" }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      take: 10
    });

    // Also search Students (if any in education/hostel context)
    const students = await prisma.student.findMany({
      where: {
        companyId,
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { admissionNumber: { contains: query, mode: "insensitive" } },
        ],
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
        user: { select: { name: true } }
      },
      take: 10
    });

    // Unify candidates
    const candidates = [
      ...consumers.map(c => ({
        id: c.id,
        consumerId: c.id,
        name: c.name || "Customer",
        email: c.email,
        phone: c.phone,
        type: "CONSUMER" as const,
      })),
      ...students.map(s => ({
        id: s.id,
        studentId: s.id,
        name: `${s.firstName} ${s.lastName}`,
        admissionNumber: s.admissionNumber,
        type: "STUDENT" as const,
      })),
    ];

    try {
      if (candidates.length > 0) {
        await cacheSet(cacheKey, candidates, 60);
      }
    } catch (e) {}

    return formatResponse(true, candidates, "Candidates fetched successfully", 200);
  } catch (error) {
    console.error("[ALLOCATE_GET_ERROR]", error);
    return formatResponse(false, null, "Search failed", 500);
  }
}

// 2. POST: Create/Find HostelMember and Create Room Allocation
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, consumerId, studentId, educatorId, companyId: rawCompanyId, endDate } = body;

    // Validate that at least one and only one recipient profile is provided
    const providedCount = [consumerId, studentId, educatorId].filter(Boolean).length;
    if (providedCount !== 1) {
      return formatResponse(false, null, "Exactly one recipient (consumerId, studentId, or educatorId) must be provided.", 400);
    }

    if (!roomId || !rawCompanyId) {
      return formatResponse(false, null, "Missing required fields (roomId, companyId)", 400);
    }

    const companyId = await resolveCompanyId(rawCompanyId);

    const result = await prisma.$transaction(async (tx) => {
      // A. Validate Room Capacity
      const room = await tx.hostelRoom.findUnique({
        where: { id: roomId },
        include: { _count: { select: { allocations: { where: { status: "ACTIVE" } } } } }
      });

      if (!room) throw new Error("Room not found");
      if (room._count.allocations >= room.capacity) {
        throw new Error(`Room is at maximum capacity (${room.capacity} slots filled)`);
      }

      // B. Upsert HostelMember for Consumer, Student, or Educator
      let member;
      if (consumerId) {
        member = await tx.hostelMember.upsert({
          where: { consumerId },
          update: { status: "ACTIVE" },
          create: {
            companyId,
            consumerId,
            memberId: `TENANT-${Date.now().toString().slice(-6)}`,
          }
        });
      } else if (studentId) {
        member = await tx.hostelMember.upsert({
          where: { studentId },
          update: { status: "ACTIVE" },
          create: {
            companyId,
            studentId,
            memberId: studentId || `MEM-${Date.now()}`,
          }
        });
      } else {
        member = await tx.hostelMember.upsert({
          where: { educatorId: educatorId! },
          update: { status: "ACTIVE" },
          create: {
            companyId,
            educatorId: educatorId!,
            memberId: educatorId || `STAFF-${Date.now()}`,
          }
        });
      }

      // C. Invariant Check: Prevent duplicate active room allocations for the same member
      const activeAlloc = await tx.hostelAllocation.findFirst({
        where: { hostelMemberId: member.id, status: "ACTIVE" }
      });
      if (activeAlloc) {
        throw new Error("This resident already has an active room allocation.");
      }

      // D. Create Allocation
      const allocation = await tx.hostelAllocation.create({
        data: {
          roomId,
          hostelMemberId: member.id,
          endDate: endDate ? new Date(endDate) : null,
          status: "ACTIVE"
        },
        include: {
          room: {
            include: { block: true }
          },
          hostelMember: {
            include: {
              consumer: true,
              student: true,
              educator: true
            }
          }
        }
      });

      return allocation;
    });

    try {
      await cacheDel(`tenant:${companyId}:allocate:*`);
      await cacheDel(`tenant:${companyId}:rooms:*`);
      await cacheDel(`admin:rooms:*`);
    } catch (e) {}

    return formatResponse(true, result, "Allocation created successfully", 201);
  } catch (error: any) {
    console.error("[ALLOCATE_POST_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to create allocation", 400);
  }
}

// 3. PATCH: Checkout or update allocation
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { allocationId, status, notes } = body;

    if (!allocationId) {
      return formatResponse(false, null, "Allocation ID is required", 400);
    }

    const updatedAllocation = await prisma.$transaction(async (tx) => {
      const existing = await tx.hostelAllocation.findUnique({
        where: { id: allocationId },
        include: { room: { include: { block: true } } }
      });

      if (!existing) {
        throw new Error("Allocation record not found");
      }

      if (existing.status === "INACTIVE") {
        throw new Error("Resident is already checked out");
      }

      const allocation = await tx.hostelAllocation.update({
        where: { id: allocationId },
        data: {
          status: status || "INACTIVE",
          endDate: new Date(),
        },
        include: {
          room: true,
          hostelMember: true,
        }
      });

      return allocation;
    });

    return formatResponse(true, updatedAllocation, "Resident checked out successfully", 200);

  } catch (error: any) {
    console.error("[CHECKOUT_PATCH_ERROR]", error);
    return formatResponse(false, null, error.message || "Internal Server Error", 400);
  }
}