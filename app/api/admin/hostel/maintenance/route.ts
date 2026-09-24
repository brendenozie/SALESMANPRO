import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatDistanceToNow } from "date-fns";
import { formatResponse } from "@/lib/formatResponse";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    const cacheKey = buildTenantCacheKey(companyId, "maintenance", {});

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    const tickets = await prisma.hostelMaintenanceRequest.findMany({
      where: { room: { block: { companyId: companyId || undefined } } },
      include: { 
        room: { 
          select: { 
            roomNumber: true,
            block: { select: { name: true } }
          } 
        },
        reporter: {
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
      category: t.category,
      reportedBy: {
        name: t.reporter?.name || "Anonymous",
        avatar: t.reporter?.image,
        role: t.reporter?.role
      },
      createdAt: t.createdAt,
      timeAgo: formatDistanceToNow(new Date(t.createdAt))
    }));

    try {
      if (data) {
        await cacheSet(cacheKey, data, 60);
      }
    } catch (e) {
      console.error("Error caching maintenance data:", e);
    }
    
    return formatResponse(true, data, "Maintenance tickets fetched successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch tickets", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, category, priority, description, companyId } = body;

    let reportedBy = body.reportedBy;
    if (!reportedBy) {
      const session = await getAuthSession();
      reportedBy = session?.user?.id;
    }

    // Fallback: If no reportedBy, find a valid user in the company
    if (!reportedBy) {
      const room = await prisma.hostelRoom.findUnique({
        where: { id: roomId },
        include: { block: true }
      });
      const cId = companyId || room?.block?.companyId;
      if (cId) {
        const companyUser = await prisma.user.findFirst({
          where: { companyId: cId },
          select: { id: true }
        });
        if (companyUser) reportedBy = companyUser.id;
      }
    }

    if (!roomId || !reportedBy) {
      return formatResponse(false, null, "Missing roomId or reporter user", 400);
    }

    const newTicket = await prisma.hostelMaintenanceRequest.create({
      data: {
        roomId,
        category: category || "GENERAL",
        priority: priority || "MEDIUM",
        description: description || "Maintenance requested",
        reportedBy,
        status: "PENDING",
      },
      include: {
        room: { 
          select: { 
            roomNumber: true,
            block: { select: { name: true } }
          } 
        },
        reporter: { select: { name: true, image: true, role: true } }
      }
    });

    try {
      await cacheDel(`tenant:*:maintenance:*`);
      await cacheDel(`admin:maintenance:*`);
    } catch (e) {}

    const formatted = {
      id: `MNT-${newTicket.id.slice(-5).toUpperCase()}`,
      dbId: newTicket.id,
      room: newTicket.room.roomNumber,
      wing: newTicket.room.block?.name || "",
      issue: newTicket.description,
      priority: newTicket.priority,
      status: newTicket.status,
      category: newTicket.category,
      reportedBy: { name: newTicket.reporter?.name || "Staff" },
      createdAt: newTicket.createdAt,
      timeAgo: "just now"
    };

    return formatResponse(true, formatted, "Ticket created successfully", 201);
  } catch (error: any) {
    console.error("[MAINTENANCE_POST_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to create maintenance ticket", 500);
  }
}
