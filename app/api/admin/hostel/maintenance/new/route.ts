import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const { roomId, userId, category, priority, description } = await req.json();

    const ticket = await prisma.hostelMaintenanceRequest.create({
      data: {
        roomId,
        userId, // The admin's ID or the student's ID if known
        category, // Enum: PLUMBING, ELECTRICAL, FURNITURE, OTHER
        priority, // Enum: LOW, MEDIUM, HIGH
        description,
        status: "PENDING",
      },
      include: {
        room: { select: { roomNumber: true } }
      }
    });

    return NextResponse.json({ data: ticket }, { status: 201 });
  } catch (error) {
    console.error("Maintenance Error:", error);
    return NextResponse.json({ error: "Failed to log request" }, { status: 500 });
  }
}