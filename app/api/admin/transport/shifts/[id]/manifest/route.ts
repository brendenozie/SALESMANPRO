import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Fetch the shift to get the Route ID
    const searchParams = new URL(req.url).searchParams;
    const companyId = searchParams.get("companyId");
    
    const cacheKey = buildTenantCacheKey(companyId, "manifest", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const shift = await prisma.transportShift.findUnique({
      where: { id: params.id },
      include: {
        route: true,
        vehicle: true,
        driver: true,
      }
    });

    if (!shift) return formatResponse(false, null, "Shift not found", 404);

    // 2. Fetch all active assignments for this route
    const passengers = await prisma.transportAssignment.findMany({
      where: {
        routeId: shift.routeId,
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            // You might have a relation to a 'Class' or 'Department' here
          }
        }
      }
    });

    try {
      if (passengers) {
        await cacheSet(cacheKey, {
      shift,
      passengers: passengers.map(p => p.user),
      stops: shift.route.stops // Include stops for sequence planning
    }, 60);
      }

    return formatResponse(true, {
      shift,
      passengers: passengers.map(p => p.user),
      stops: shift.route.stops // Include stops for sequence planning
    }, "Manifest generated", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to load manifest", 500);
  }
}catch (error) {
    console.error("Error fetching manifest:", error);
    return formatResponse(false, null, "Failed to load manifest", 500);
  }
}