import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return NextResponse.json({ error: "Missing companyId" }, { status: 400 });

  try {
    const rooms = await prisma.hostelRoom.findMany({
      where: {
        block: { companyId: companyId }
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
      occupancy: room.allocations.length,
      max: room.capacity,
      wing: room.block.name, // Mapping Block Name to "Wing"
      status: room.allocations.length >= room.capacity ? "Full" : 
              room.allocations.length > 0 ? "Partial" : "Available",
      amenities: ["Wi-Fi", "AC"], // You can add an amenities field to your Prisma model later
      hasMaintenance: room.maintenanceRequests.length > 0
    }));

    return NextResponse.json({ data: transformedRooms });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blockId, roomNumber, capacity, type, floor } = body;

    // 1. Basic Validation
    if (!blockId || !roomNumber || !capacity || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    return NextResponse.json({ data: newRoom, message: "Room created successfully" }, { status: 201 });
  } catch (error: any) {
    // Handle Prisma unique constraint error (P2002) for [blockId, roomNumber]
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Room number already exists in this block" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// // GET /api/admin/hostel/rooms
// // Fetches all hostel rooms filtered by companyId
// const getRoomsLogic = async (request: Request) => {
//   const { searchParams } = new URL(request.url);
//   const companyId = searchParams.get("companyId");

//   if (!companyId) {
//     return formatResponse(false, null, "Company ID is required to fetch rooms.", 400);
//   }

//   const rooms = await prisma.hostelRoom.findMany({
//     where: {
//       block: {
//         companyId,
//       },
//     },
//     include: {
//       block: {
//         select: { id: true, name: true, type: true },
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });

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
