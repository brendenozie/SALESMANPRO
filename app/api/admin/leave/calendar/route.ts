import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID is required", 400);

  try {
    
    const cacheKey = `admin:calendar:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const events = await prisma.leaveRequest.findMany({
      where: { 
        companyId,
        status: { in: ['APPROVED', 'PENDING'] } 
      },
      include: { user: { select: { name: true } } }
    });

    const formattedEvents = events.map(e => ({
      id: e.id,
      title: e.user?.name || "Unknown User",
      start: e.startDate,
      end: e.endDate,
      type: e.type,
      status: e.status
    }));

    

  try {
    if (events) {
      await cacheSet(cacheKey, formattedEvents, 60);
    }
  } catch (e) {}

    return formatResponse(true, formattedEvents, "Calendar data fetched", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to load calendar", 500);
  }
}