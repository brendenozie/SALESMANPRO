import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blockId = searchParams.get("blockId");

  if (!blockId) return NextResponse.json({ error: "Missing blockId" }, { status: 400 });

  try {
    
    const cacheKey = buildTenantCacheKey(blockId, "rooms", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const rooms = await prisma.hostelRoom.findMany({
      where: {
        block: { id: blockId }
      },
      include: {
        block: true,
        allocations: {
          where: { status: "ACTIVE" } // Only count current residents
        },
        maintenanceRequests: {
          where: { status: "PENDING" }
        }
      }
    });

    // Transform data for the UI
    const transformedRooms = rooms.map(room => ({
      id: room.id,
      roomNumber: room.roomNumber,
      type: room.type,
      floor: room.floor,
      capacity: room.capacity,
      occupancy: room.allocations.length,
      max: room.capacity,
      wing: room.block.name, // Mapping Block Name to "Wing"
      status: room.allocations.length >= room.capacity ? "Full" : 
              room.allocations.length > 0 ? "Partial" : "Available",
      amenities: ["Wi-Fi", "AC"], // You can add an amenities field to your Prisma model later
      hasMaintenance: room.maintenanceRequests.length > 0
    }));

    try {
      if (transformedRooms) {
        await cacheSet(cacheKey, transformedRooms, 60); // Cache for 60 seconds
      }
    } catch (e) {
      console.error("Error caching rooms data:", e);
    }

    return formatResponse(true, transformedRooms, "Rooms retrieved successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch rooms", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blockId, roomNumber, capacity, type, floor } = body;

    // 1. Basic Validation
    if (!blockId || !roomNumber || !capacity || !type) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    // 2. Create the room in MongoDB
    const newRoom = await prisma.hostelRoom.create({
      data: {
        blockId,
        roomNumber,
        capacity: parseInt(capacity),
        type, // Ensure this matches your HostelRoomType enum
        floor: floor ? parseInt(floor) : null,
      },
    });

    
    try {
      await cacheDel(`tenant:${blockId}:rooms:*`);
      await cacheDel(`admin:rooms:*`);
    } catch (e) {}
    return formatResponse(true, newRoom, "Room created successfully", 201);
  } catch (error: any) {
    // Handle Prisma unique constraint error (P2002) for [blockId, roomNumber]
    if (error.code === 'P2002') {
      return formatResponse(false, null, "Room number already exists in this block", 409);
    }
    return formatResponse(false, null, "Failed to create room", 500);
  }
}

// import { NextResponse } from "next/server";


//   return formatResponse(true, rooms, "Rooms retrieved successfully", 200);
// };

// export const GET = withApiHandler(getRoomsLogic, { requireAuth: true, requireRateLimit: true });

// // POST /api/admin/hostel/rooms
// // Creates a new hostel room
// const postRoomLogic = async (request: Request) => {
//   const body = await request.json();
//   const { blockId, roomNumber, capacity, type, floor, companyId } = body;

//   if (!blockId || !roomNumber || !capacity || !type || !companyId) {
//     return formatResponse(
//       false,
//       null,
//       "Block ID, room number, capacity, type, and company ID are required.",
//       400
//     );
//   }

//   // Verify the block exists and belongs to the company
//   const block = await prisma.hostelBlock.findFirst({
//     where: {
//       id: blockId,
//       companyId,
//     },
//   });

//   if (!block) {
//     return formatResponse(
//       false,
//       null,
//       "Block not found or does not belong to this company.",
//       404
//     );
//   }

//   const newRoom = await prisma.hostelRoom.create({
//     data: {
//       blockId,
//       roomNumber,
//       capacity: parseInt(capacity),
//       type,
//       floor: floor ? parseInt(floor) : null,
//     },
//     include: {
//       block: {
//         select: { id: true, name: true, type: true },
//       },
//     },
//   });

//   return formatResponse(true, newRoom, "Room created successfully", 201);
// };

// export const POST = withApiHandler(postRoomLogic, { requireAuth: true, requireRateLimit: true });
