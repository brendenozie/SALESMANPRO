import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const getRoutes = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const routes = await prisma.transportRoute.findMany({
    where: { companyId },
    include: {
      vehicle: {
        select: { registration: true, make: true, model: true }
      },
      _count: {
        select: { assignments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return formatResponse(true, routes, "Routes retrieved successfully", 200);
};

const postRoute = async (request: Request) => {
  const body = await request.json();
  const { name, startPoint, endPoint, stops, vehicleId, companyId } = body;

  if (!name || !startPoint || !endPoint || !companyId) {
    return formatResponse(false, null, "Missing required route parameters", 400);
  }

  const route = await prisma.transportRoute.create({
    data: {
      name,
      startPoint,
      endPoint,
      stops: stops || [], // Expecting an array of strings or objects
      companyId,
      vehicleId: vehicleId || null,
    },
    include: {
      vehicle: true
    }
  });

  return formatResponse(true, route, "New route established", 201);
};

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { formatResponse } from "@/lib/formatResponse";

const postRouteV2 = async (req: Request) => {
  try {
    const body = await req.json();
    const { type, ...data } = body;

    // Handle Route Creation
    if (type === "CREATE_ROUTE") {
      const route = await prisma.transportRoute.create({
        data: {
          name: data.name,
          startPoint: data.startPoint,
          endPoint: data.endPoint,
          stops: data.stops, // Expecting Array of objects {lat, lng, name}
          companyId: data.companyId,
          vehicleId: data.vehicleId
        }
      });
      return formatResponse(true, route, "Route established", 201);
    }

    // Handle Shift Dispatch
    if (type === "DISPATCH_SHIFT") {
      const shift = await prisma.transportShift.create({
        data: {
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          routeId: data.routeId,
          driverId: data.driverId,
          vehicleId: data.vehicleId,
          companyId: data.companyId,
          status: "SCHEDULED"
        }
      });
      return formatResponse(true, shift, "Shift dispatched to driver", 201);
    }

    return formatResponse(false, null, "Invalid request type", 400);
  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}

export const GET = withApiHandler(getRoutes, { requireAuth: true });
export const POST = withApiHandler(postRoute, { requireAuth: true });