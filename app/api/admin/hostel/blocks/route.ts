import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return NextResponse.json({ error: "Missing companyId" }, { status: 400 });

  const blocks = await prisma.hostelBlock.findMany({
    where: { companyId },
    include: {
      _count: { select: { rooms: true } },
      rooms: {
        select: {
          capacity: true,
          allocations: { where: { status: "ACTIVE" } } // Adjust status based on your schema
        }
      }
    }
  });

  // Transform data to include aggregated stats the UI expects
  const formattedBlocks = blocks.map(block => ({
    ...block,
    roomCount: block._count.rooms,
    totalCapacity: block.rooms.reduce((acc, room) => acc + room.capacity, 0),
    totalOccupancy: block.rooms.reduce((acc, room) => acc + room.allocations.length, 0),
  }));

  return NextResponse.json({ data: formattedBlocks });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, type, companyId } = body;

  const block = await prisma.hostelBlock.create({
    data: { name, type, companyId }
  });

  return NextResponse.json({ data: block });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await prisma.hostelBlock.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Cannot delete block with active rooms" }, { status: 400 });
  }
}