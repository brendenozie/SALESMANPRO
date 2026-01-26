import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "companyId is required" }, { status: 400 });
  }

  try {
    const tickets = await prisma.hostelMaintenanceRequest.findMany({
      where: { room: { block: { companyId } } },
      include: { 
        room: { select: { roomNumber: true } },
        user: { select: { name: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Formatting for the high-end UI
    const data = tickets.map((t: any) => ({
      id: `TKT-${t.id.slice(-4).toUpperCase()}`,
      dbId: t.id,
      room: t.room.roomNumber,
      category: t.category, // e.g., 'PLUMBING', 'ELECTRICAL'
      issue: t.description,
      priority: t.priority, // 'HIGH', 'MEDIUM', 'LOW'
      status: t.status, // 'PENDING', 'IN_PROGRESS', 'COMPLETED'
      time: new Date(t.createdAt).toLocaleDateString(),
      rawDate: t.createdAt
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}