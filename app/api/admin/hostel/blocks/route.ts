import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Missing companyId", 400);
  
  const cacheKey = `admin:blocks:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
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

  try {
    if (formattedBlocks) {
      await cacheSet(cacheKey, formattedBlocks, 60);
    }
  } catch (e) {
    console.error("Error caching blocks data:", e);
  }

  return formatResponse(true, formattedBlocks, "Blocks fetched successfully", 200);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, type, companyId } = body;

  const block = await prisma.hostelBlock.create({
    data: { name, type, companyId }
  });

  return formatResponse(true, block, "Block created successfully", 201);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return formatResponse(false, null, "ID required", 400);

  try {
    await prisma.hostelBlock.delete({ where: { id } });
    
    try { await cacheDel(`admin:blocks:${id || 'global'}:*`); } catch (e) {}

    return formatResponse(true, null, "Block deleted successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Cannot delete block with active rooms", 400);
  }
}