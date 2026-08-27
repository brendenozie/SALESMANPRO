import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
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

    const cacheKey = `admin:rooms:${id || 'global'}:all`;

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
                educator: { include: { user: { select: { name: true } } } },
                consumer: { include: { user: { select: { name: true } } } }
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

    // High-fidelity data transformation for the Dossier/Details view
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
      
      // Map residents to a cleaner format
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

      // Static amenities for now, or fetch from a model if added later
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