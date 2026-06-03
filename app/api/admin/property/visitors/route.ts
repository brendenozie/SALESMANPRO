import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    
    const cacheKey = `admin:visitors:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const visitors = await prisma.hostelVisitor.findMany({
      where: { companyId },
      include: { student: { select: { firstName: true } },  educator: { include: { user: { select: { name: true } } } } },
      orderBy: { checkIn: 'desc' }
    });

  try {
    if (visitors) {
      await cacheSet(cacheKey, visitors, 60);
    }
  } catch (e) {}
  
    return formatResponse(true, visitors, "Visitors fetched successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch visitors", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();
    const visitor = await prisma.hostelVisitor.update({
      where: { id },
      data: { 
        status: "CHECKED_OUT",
        checkOut: new Date(),
      },
      include: { student: { select: { firstName: true } }, 
      educator: { include: { user: { select: { name: true } } } } }
    });
    return formatResponse(true, visitor, "Visitor checked out successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Check-out failed", 500);
  }
}