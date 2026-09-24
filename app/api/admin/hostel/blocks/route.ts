import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Missing companyId", 400);
  
  const cacheKey = buildTenantCacheKey(companyId, "blocks", {});

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
          allocations: { where: { status: "ACTIVE" } }
        }
      }
    }
  });

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
  try {
    const body = await req.json();
    const { name, type, companyId } = body;

    if (!name || !type || !companyId) {
      return formatResponse(false, null, "Missing required fields (name, type, companyId)", 400);
    }

    const block = await prisma.hostelBlock.create({
      data: { name, type, companyId }
    });

    try {
      await cacheDel(`tenant:${companyId}:blocks:*`);
      await cacheDel(`admin:blocks:*`);
    } catch (e) {}

    return formatResponse(true, block, "Block created successfully", 201);
  } catch (error: any) {
    console.error("[BLOCK_CREATE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to create block", 500);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, type, companyId } = body;

    if (!id) {
      return formatResponse(false, null, "Block ID is required", 400);
    }

    const existing = await prisma.hostelBlock.findUnique({
      where: { id }
    });

    if (!existing) {
      return formatResponse(false, null, "Block not found", 404);
    }

    const updated = await prisma.hostelBlock.update({
      where: { id },
      data: {
        name: name || existing.name,
        type: type || existing.type,
      }
    });

    try {
      await cacheDel(`tenant:${existing.companyId}:blocks:*`);
      await cacheDel(`admin:blocks:*`);
    } catch (e) {}

    return formatResponse(true, updated, "Block updated successfully", 200);
  } catch (error: any) {
    console.error("[BLOCK_UPDATE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to update block", 500);
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return formatResponse(false, null, "ID required", 400);

  try {
    const block = await prisma.hostelBlock.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            allocations: { where: { status: "ACTIVE" } }
          }
        }
      }
    });

    if (!block) {
      return formatResponse(false, null, "Block not found", 404);
    }

    const hasActiveResidents = block.rooms.some(r => r.allocations.length > 0);
    if (hasActiveResidents) {
      return formatResponse(false, null, "Cannot delete block with active residents", 400);
    }

    // Cascade delete rooms, maintenance requests, and past allocations of this block
    for (const r of block.rooms) {
      await prisma.hostelMaintenanceRequest.deleteMany({ where: { roomId: r.id } });
      await prisma.hostelAllocation.deleteMany({ where: { roomId: r.id } });
    }
    await prisma.hostelRoom.deleteMany({ where: { blockId: id } });

    await prisma.hostelBlock.delete({ where: { id } });
    
    try {
      await cacheDel(`tenant:${block.companyId}:blocks:*`);
      await cacheDel(`admin:blocks:*`);
    } catch (e) {}

    return formatResponse(true, null, "Block deleted successfully", 200);
  } catch (error: any) {
    console.error("[BLOCK_DELETE_ERROR]", error);
    return formatResponse(false, null, "Cannot delete block with active rooms", 400);
  }
}