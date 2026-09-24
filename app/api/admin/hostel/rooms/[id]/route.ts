import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing Room ID" }, { status: 400 });
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
          select: { name: true, type: true }
        },
        allocations: {
          where: { status: "ACTIVE" },
          include: {
            hostelMember: {
              include: {
                student: true,
                educator: { include: { user: { select: { name: true } } } }
              }
            }
          }
        },
        maintenanceRequests: {
          where: { status: "PENDING" },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const transformedRoom = {
      id: room.id,
      roomNumber: room.roomNumber,
      type: room.type,
      floor: room.floor,
      capacity: room.capacity,
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
          : alloc.hostelMember?.educator?.user?.name || "Unknown",
        type: alloc.hostelMember?.student ? "STUDENT" : "STAFF",
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
    } catch (e) {
      console.error("Error caching room data:", e);
    }

    return formatResponse(true, transformedRoom, "Room details fetched successfully", 200);

  } catch (error) {
    console.error("[ROOM_GET_BY_ID]", error);
    return formatResponse(false, null, "Failed to fetch room details", 500);
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { roomNumber, capacity, type, floor, rentPerMonth, isAvailable } = body;

    const existing = await prisma.hostelRoom.findUnique({
      where: { id }
    });

    if (!existing) {
      return formatResponse(false, null, "Room not found", 404);
    }

    const updated = await prisma.hostelRoom.update({
      where: { id },
      data: {
        roomNumber: roomNumber || existing.roomNumber,
        capacity: capacity !== undefined ? parseInt(capacity) : existing.capacity,
        type: type || existing.type,
        floor: floor !== undefined ? (floor ? parseInt(floor) : null) : existing.floor,
        rentPerMonth: rentPerMonth !== undefined ? parseFloat(rentPerMonth) : existing.rentPerMonth,
        isAvailable: isAvailable !== undefined ? isAvailable : existing.isAvailable,
      }
    });

    try {
      await cacheDel(`tenant:*:rooms:*`);
      await cacheDel(`admin:rooms:*`);
    } catch (e) {}

    return formatResponse(true, updated, "Room updated successfully", 200);
  } catch (error: any) {
    console.error("[ROOM_UPDATE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to update room", 500);
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.hostelRoom.findUnique({
      where: { id },
      include: {
        allocations: { where: { status: "ACTIVE" } }
      }
    });

    if (!existing) {
      return formatResponse(false, null, "Room not found", 404);
    }

    if (existing.allocations.length > 0) {
      return formatResponse(false, null, "Cannot delete room with active residents", 400);
    }

    // Clean up dependent maintenance requests and past allocations
    await prisma.hostelMaintenanceRequest.deleteMany({ where: { roomId: id } });
    await prisma.hostelAllocation.deleteMany({ where: { roomId: id } });

    await prisma.hostelRoom.delete({
      where: { id }
    });

    try {
      await cacheDel(`tenant:*:rooms:*`);
      await cacheDel(`admin:rooms:*`);
    } catch (e) {}

    return formatResponse(true, null, "Room deleted successfully", 200);
  } catch (error: any) {
    console.error("[ROOM_DELETE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to delete room", 500);
  }
}