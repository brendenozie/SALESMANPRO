import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return formatResponse(false, null, "Missing Room ID", 400);
    }

    const cacheKey = buildTenantCacheKey(id, "rooms", {});

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    const room = await prisma.hostelRoom.findUnique({
      where: { id },
      include: {
        block: {
          select: { name: true, type: true, companyId: true }
        },
        allocations: {
          where: { status: "ACTIVE" },
          include: {
            hostelMember: {
              include: {
                student: true,
                educator: { include: { user: { select: { name: true } } } },
                consumer: { include: { user: { select: { name: true } } } }
              }
            }
          }
        },
        maintenanceRequests: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!room) {
      return formatResponse(false, null, "Room not found", 404);
    }

    const transformedRoom = {
      id: room.id,
      roomNumber: room.roomNumber,
      type: room.type,
      floor: room.floor,
      capacity: room.capacity,
      costPerMonth: room.costPerMonth,
      costPerSemester: room.costPerSemester,
      occupancy: room.allocations.length,
      availableSlots: Math.max(0, room.capacity - room.allocations.length),
      wing: room.block.name,
      blockType: room.block.type,
      status: room.allocations.length >= room.capacity ? "FULL" : "AVAILABLE",
      residents: room.allocations.map(alloc => ({
        allocationId: alloc.id,
        memberId: alloc.hostelMember?.id,
        name: alloc.hostelMember?.student 
          ? `${alloc.hostelMember.student.firstName} ${alloc.hostelMember.student.lastName}`
          : alloc.hostelMember?.educator?.user?.name || alloc.hostelMember?.consumer?.user?.name || "N/A",
        type: alloc.hostelMember?.student ? "STUDENT" : alloc.hostelMember?.educator ? "STAFF" : "CONSUMER",
        joinedAt: alloc.startDate,
      })),
      maintenance: {
        hasActiveIssues: room.maintenanceRequests.length > 0,
        count: room.maintenanceRequests.length,
        latest: room.maintenanceRequests[0] || null
      },
      amenities: ["High-speed Wi-Fi", "Daily Cleaning", "Climate Control"],
    };

    try {
      await cacheSet(cacheKey, transformedRoom, 60);
    } catch (e) {}

    return formatResponse(true, transformedRoom, "Room details fetched successfully", 200);

  } catch (error) {
    console.error("[ROOM_GET_BY_ID]", error);
    return formatResponse(false, null, "Failed to fetch room details", 500);
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return formatResponse(false, null, "Missing Room ID", 400);
    }

    const existing = await prisma.hostelRoom.findUnique({
      where: { id },
      include: { block: true, allocations: { where: { status: "ACTIVE" } } }
    });

    if (!existing) {
      return formatResponse(false, null, "Room not found", 404);
    }

    const body = await req.json();
    const { roomNumber, type, floor, capacity, costPerMonth, costPerSemester } = body;

    // Capacity invariant: Capacity cannot be set lower than active occupants
    if (capacity !== undefined && capacity < existing.allocations.length) {
      return formatResponse(
        false,
        null,
        `Cannot reduce capacity to ${capacity} because room currently has ${existing.allocations.length} active occupants.`,
        400
      );
    }

    const updateData: any = {};
    if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
    if (type !== undefined) updateData.type = type;
    if (floor !== undefined) updateData.floor = Number(floor);
    if (capacity !== undefined) updateData.capacity = Number(capacity);
    if (costPerMonth !== undefined) updateData.costPerMonth = Number(costPerMonth);
    if (costPerSemester !== undefined) updateData.costPerSemester = Number(costPerSemester);

    const updated = await prisma.hostelRoom.update({
      where: { id },
      data: updateData,
      include: { block: true }
    });

    try {
      const companyId = existing.block?.companyId;
      if (companyId) {
        await cacheDel(`tenant:${companyId}:rooms:*`);
        await cacheDel(`admin:rooms:*`);
      }
    } catch (e) {}

    return formatResponse(true, updated, "Room updated successfully", 200);
  } catch (error) {
    console.error("[ROOM_PATCH]", error);
    return formatResponse(false, null, "Failed to update room", 500);
  }
}

export async function PUT(req: Request, context: RouteParams) {
  return PATCH(req, context);
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return formatResponse(false, null, "Missing Room ID", 400);
    }

    const existing = await prisma.hostelRoom.findUnique({
      where: { id },
      include: {
        block: true,
        allocations: { where: { status: "ACTIVE" } }
      }
    });

    if (!existing) {
      return formatResponse(false, null, "Room not found", 404);
    }

    if (existing.allocations.length > 0) {
      return formatResponse(
        false,
        null,
        `Cannot delete room with ${existing.allocations.length} active occupants. Reassign occupants first.`,
        400
      );
    }

    await prisma.hostelRoom.delete({
      where: { id }
    });

    try {
      const companyId = existing.block?.companyId;
      if (companyId) {
        await cacheDel(`tenant:${companyId}:rooms:*`);
        await cacheDel(`admin:rooms:*`);
      }
    } catch (e) {}

    return formatResponse(true, null, "Room deleted successfully", 200);
  } catch (error) {
    console.error("[ROOM_DELETE]", error);
    return formatResponse(false, null, "Failed to delete room", 500);
  }
}