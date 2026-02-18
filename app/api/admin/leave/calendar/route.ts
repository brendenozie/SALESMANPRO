import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

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

  try {
    if (events) {
      await cacheSet(cacheKey, events, 60);
    }
  } catch (e) {}

    const formattedEvents = events.map(e => ({
      id: e.id,
      title: e.user.name,
      start: e.startDate,
      end: e.endDate,
      type: e.type,
      status: e.status
    }));

    return NextResponse.json({ data: formattedEvents });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load calendar" }, { status: 500 });
  }
}