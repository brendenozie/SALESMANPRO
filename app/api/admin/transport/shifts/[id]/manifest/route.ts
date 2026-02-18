import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Fetch the shift to get the Route ID
    
    const cacheKey = `admin:manifest:${'global' || 'global'}:all`;

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

  try {
    if (shift) {
      await cacheSet(cacheKey, shift, 60);
    }
  } catch (e) {}

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

    return formatResponse(true, {
      shift,
      passengers: passengers.map(p => p.user),
      stops: shift.route.stops // Include stops for sequence planning
    }, "Manifest generated", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to load manifest", 500);
  }
}