import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const getRoutes = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const cacheKey = `admin:routes:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

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

  try {
    if (routes) {
      await cacheSet(cacheKey, routes, 60);
    }
  } catch (e) {}
  
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

    try { await cacheDel(`admin:routes:${companyId || 'global'}:*`); } catch (e) {}
  return formatResponse(true, route, "New route established", 201);
};

// import { NextResponse } from "next/server";
export const GET = withApiHandler(getRoutes, { requireAuth: true });
export const POST = withApiHandler(postRoute, { requireAuth: true });