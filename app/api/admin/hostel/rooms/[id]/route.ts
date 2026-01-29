import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing Room ID" }, { status: 400 });
    }

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
          : alloc.hostelMember?.educator?.user?.name || "Unknown",
        type: alloc.hostelMember?.student ? "STUDENT" : "STAFF",
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

    return NextResponse.json({ data: transformedRoom });

  } catch (error) {
    console.error("[ROOM_GET_BY_ID]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}