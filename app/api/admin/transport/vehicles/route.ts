import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


const getVehicles = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const cacheKey = buildTenantCacheKey(companyId, "vehicles", { status, type });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const vehicles = await prisma.transportVehicle.findMany({
    where: { 
      companyId,
      ...(status && { status: status as any }),
      ...(type && { type: type as any })
    },
    include: {
      _count: {
        select: { routes: true, maintenances: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  try {
    if (vehicles) {
      await cacheSet(cacheKey, vehicles, 60);
    }
    } catch (e) {}

  return formatResponse(true, vehicles, "Fleet data retrieved", 200);
};


const postVehicle = async (request: Request) => {
  const body = await request.json();
  const { 
    registration, 
    make, 
    model, 
    type, 
    capacity, 
    companyId,
    mileage,
    year 
  } = body;

  // Validation
  if (!registration || !companyId) {
    return formatResponse(false, null, "Missing required fleet identifiers", 400);
  }

  try {
    const vehicle = await prisma.transportVehicle.create({
      data: {
        registration: registration.toUpperCase(),
        make,
        model,
        type,
        capacity: parseInt(capacity),
        companyId,
        status: "ACTIVE",
        mileage,
        year
      }
    });

    try {
      await cacheDel(`tenant:${companyId}:vehicles:*`);
      await cacheDel(`admin:vehicles:*`);
    } catch (e) {}
    return formatResponse(true, vehicle, "Vehicle successfully added to fleet", 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return formatResponse(false, null, "Registration number already exists", 409);
    }
    throw error;
  }
};

export const GET = withApiHandler(getVehicles, { requireAuth: true });
export const POST = withApiHandler(postVehicle, { requireAuth: true });