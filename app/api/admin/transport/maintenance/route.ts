import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  
    const cacheKey = `admin:maintenance:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const records = await prisma.transportMaintenance.findMany({
    where: { vehicle: { companyId } },
    include: { vehicle: { select: { registration: true, model: true } } },
    orderBy: { scheduledDate: 'desc' }
  });

  try {
    if (records) {
      await cacheSet(cacheKey, records, 60);
    }
  } catch (e) {}

  return formatResponse(true, records, "Maintenance history retrieved", 200);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vehicleId, description, scheduledDate, cost, status, notes } = body;

    const maintenance = await prisma.transportMaintenance.create({
      data: {
        vehicleId,
        description,
        scheduledDate: new Date(scheduledDate),
        cost: parseFloat(cost || "0"),
        status: status || "SCHEDULED",
        notes
      }
    });

    // Automatically update vehicle status if maintenance is active
    if (status === "IN_PROGRESS") {
      await prisma.transportVehicle.update({
        where: { id: vehicleId },
        data: { status: "MAINTENANCE" }
      });
    }

    
    try { await cacheDel(`admin:maintenance:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, maintenance, "Service record created", 201);
  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}