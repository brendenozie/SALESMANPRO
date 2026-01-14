import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/hostel/rooms
// Fetches all hostel rooms filtered by companyId
const getRoomsLogic = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required to fetch rooms.", 400);
  }

  const rooms = await prisma.hostelRoom.findMany({
    where: {
      block: {
        companyId,
      },
    },
    include: {
      block: {
        select: { id: true, name: true, type: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return formatResponse(true, rooms, "Rooms retrieved successfully", 200);
};

export const GET = withApiHandler(getRoomsLogic, { requireAuth: true, requireRateLimit: true });

// POST /api/admin/hostel/rooms
// Creates a new hostel room
const postRoomLogic = async (request: Request) => {
  const body = await request.json();
  const { blockId, roomNumber, capacity, type, floor, companyId } = body;

  if (!blockId || !roomNumber || !capacity || !type || !companyId) {
    return formatResponse(
      false,
      null,
      "Block ID, room number, capacity, type, and company ID are required.",
      400
    );
  }

  // Verify the block exists and belongs to the company
  const block = await prisma.hostelBlock.findFirst({
    where: {
      id: blockId,
      companyId,
    },
  });

  if (!block) {
    return formatResponse(
      false,
      null,
      "Block not found or does not belong to this company.",
      404
    );
  }

  const newRoom = await prisma.hostelRoom.create({
    data: {
      blockId,
      roomNumber,
      capacity: parseInt(capacity),
      type,
      floor: floor ? parseInt(floor) : null,
    },
    include: {
      block: {
        select: { id: true, name: true, type: true },
      },
    },
  });

  return formatResponse(true, newRoom, "Room created successfully", 201);
};

export const POST = withApiHandler(postRoomLogic, { requireAuth: true, requireRateLimit: true });
