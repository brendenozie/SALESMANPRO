import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// get specific room by room id

export async function GET(req: Request) {
  // const { searchParams } = new URL(req.url);
  // const id = searchParams.get("id");
  // get Id from path 
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const room = await prisma.hostelRoom.findUnique({
      where: { id },
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
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    // Transform data for the UI
    const transformedRoom = {
      id: room.id,
      roomNumber: room.roomNumber,
      type: room.type,
      floor: room.floor,
      capacity: room.capacity,
      occupancy: room.allocations.length,
      max: room.capacity,
      wing: room.block.name, // Mapping Block Name to "Wing"
      status: room.allocations.length >= room.capacity ? "Full" : "Available",
      amenities: ["Wi-Fi", "AC"], // You can add an amenities field to your Prisma model later
      hasMaintenance: room.maintenanceRequests.length > 0
    };
    return NextResponse.json({ data: transformedRoom });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}


// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const blockId = searchParams.get("blockId");

//   if (!blockId) return NextResponse.json({ error: "Missing blockId" }, { status: 400 });

//   try {
//     const rooms = await prisma.hostelRoom.findMany({
//       where: {
//         block: { id: blockId }
//       },
//       include: {
//         block: true,
//         allocations: {
//           where: { status: "ACTIVE" } // Only count current residents
//         },
//         maintenanceRequests: {
//           where: { status: "PENDING" }
//         }
//       }
//     });

//     // Transform data for the UI
//     const transformedRooms = rooms.map(room => ({
//       id: room.id,
//       roomNumber: room.roomNumber,
//       type: room.type,
//       floor: room.floor,
//       capacity: room.capacity,
//       occupancy: room.allocations.length,
//       max: room.capacity,
//       wing: room.block.name, // Mapping Block Name to "Wing"
//       status: room.allocations.length >= room.capacity ? "Full" : 
//               room.allocations.length > 0 ? "Partial" : "Available",
//       amenities: ["Wi-Fi", "AC"], // You can add an amenities field to your Prisma model later
//       hasMaintenance: room.maintenanceRequests.length > 0
//     }));

//     return NextResponse.json({ data: transformedRooms });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
//   }
// }
