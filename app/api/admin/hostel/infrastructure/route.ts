import { NextResponse } from "next/server";
import db from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const { entity, data } = await req.json();
    
    if (entity === "BLOCK") {
      const block = await db.hostelBlock.create({ data });
      return NextResponse.json({ success: true, data: block });
    }
    
    if (entity === "ROOM") {
      const room = await db.hostelRoom.create({ 
        data: { ...data, capacity: parseInt(data.capacity), floor: parseInt(data.floor) } 
      });
      return NextResponse.json({ success: true, data: room });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { entity, id, data } = await req.json();
    if (entity === "BLOCK") {
      const updated = await db.hostelBlock.update({ where: { id }, data });
      return NextResponse.json({ success: true, data: updated });
    }
    if (entity === "ROOM") {
      const updated = await db.hostelRoom.update({ 
        where: { id }, 
        data: { ...data, capacity: parseInt(data.capacity), floor: parseInt(data.floor) } 
      });
      return NextResponse.json({ success: true, data: updated });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}