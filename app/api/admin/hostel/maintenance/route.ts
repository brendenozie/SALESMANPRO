import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatDistanceToNow } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    const tickets = await prisma.hostelMaintenanceRequest.findMany({
      where: { room: { block: { companyId: companyId || undefined } } },
      include: { 
        room: { 
          select: { 
            roomNumber: true,
            block: { select: { name: true } }
          } 
        },
        reporter: { // This matches your @relation name
          select: { 
            name: true, 
            image: true,
            role: true 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = tickets.map((t) => ({
      id: `MNT-${t.id.slice(-5).toUpperCase()}`,
      dbId: t.id,
      room: t.room.roomNumber,
      wing: t.room.block.name,
      issue: t.description,
      priority: t.priority,
      status: t.status,
      // Formatting the reporter info
      reportedBy: {
        name: t.reporter?.name || "Anonymous",
        avatar: t.reporter?.image,
        role: t.reporter?.role
      },
      createdAt: t.createdAt,
      timeAgo: formatDistanceToNow(new Date(t.createdAt)) // Use date-fns for "2 hours ago"
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

