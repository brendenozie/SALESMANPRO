import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const companyId = searchParams.get("companyId");

//   if (!companyId) {
//     return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
//   }

//   try {
//     const blocks = await prisma.hostelBlock.findMany({
//       where: { companyId },
//       include: {
//         _count: {
//           select: { rooms: true }
//         }
//       }
//     });

//     return NextResponse.json({ data: blocks });
//   } catch (error) {
//     console.error("[BLOCKS_GET]", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return new NextResponse("School ID required", { status: 400 });

  try {
    const blocks = await prisma.hostelBlock.findMany({
      where: { companyId },
      include: {
        _count: { select: { rooms: true } },
        rooms: {
          include: {
            _count: { select: { allocations: { where: { status: "ACTIVE" } } } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Calculate aggregate occupancy for the whole block
    const formattedBlocks = blocks.map(block => {
      const totalCapacity = block.rooms.reduce((acc, room) => acc + room.capacity, 0);
      const totalOccupancy = block.rooms.reduce((acc, room) => acc + room._count.allocations, 0);
      
      return {
        ...block,
        roomCount: block._count.rooms,
        totalCapacity,
        totalOccupancy
      };
    });

    return NextResponse.json({ success: true, data: formattedBlocks });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blocks" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return new NextResponse("ID required", { status: 400 });

    await prisma.hostelBlock.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Cannot delete block with existing rooms" }, { status: 400 });
  }
}