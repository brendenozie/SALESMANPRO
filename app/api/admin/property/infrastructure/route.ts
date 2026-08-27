import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import db from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function POST(req: Request) {
  try {
    const { entity, data } = await req.json();
    
    if (entity === "BLOCK") {
      const block = await db.hostelBlock.create({ data });
      return formatResponse(true, block, "Block created successfully", 201);
    }
    
    if (entity === "ROOM") {
      const room = await db.hostelRoom.create({ 
        data: { ...data, capacity: parseInt(data.capacity), floor: parseInt(data.floor) } 
      });
      return formatResponse(true, room, "Room created successfully", 201);
    }
    
  } catch (error: any) {
    return formatResponse(false, null, error.message || "Internal Server Error", 500);
  }
}

export async function PUT(req: Request) {
  try {
    const { entity, id, data } = await req.json();
    if (entity === "BLOCK") {
      const updated = await db.hostelBlock.update({ where: { id }, data });
      return formatResponse(true, updated, "Block updated successfully", 200);
    }
    if (entity === "ROOM") {
      const updated = await db.hostelRoom.update({ 
        where: { id }, 
        data: { ...data, capacity: parseInt(data.capacity), floor: parseInt(data.floor) } 
      });
      return formatResponse(true, updated, "Room updated successfully", 200);
    }
  } catch (error: any) {
    return formatResponse(false, null, error.message || "Internal Server Error", 500);
  }
}