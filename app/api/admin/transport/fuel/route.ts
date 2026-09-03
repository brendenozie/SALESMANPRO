import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  
    const cacheKey = buildTenantCacheKey(companyId, "fuel", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const logs = await prisma.transportFuelLog.findMany({
    where: { vehicle: { companyId } },
    include: { vehicle: { select: { registration: true, type: true } } },
    orderBy: { date: 'desc' }
  });

  try {
    if (logs) {
      await cacheSet(cacheKey, logs, 60);
    }
  } catch (e) {}

  return formatResponse(true, logs, "Fuel logs retrieved", 200);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vehicleId, quantity, cost, odometer, notes } = body;

    const log = await prisma.transportFuelLog.create({
      data: {
        vehicleId,
        quantity: parseFloat(quantity),
        cost: parseFloat(cost),
        odometer: parseFloat(odometer),
        notes,
        date: new Date(),
      },
      include: { vehicle: true }
    });

    
    try {
      await cacheDel(`tenant:${'global'}:fuel:*`);
      await cacheDel(`admin:fuel:*`);
    } catch (e) {}
    return formatResponse(true, log, "Refuel event recorded", 201);
  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}