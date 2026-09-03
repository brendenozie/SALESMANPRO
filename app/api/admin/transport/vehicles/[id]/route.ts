import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


export const PATCH = withApiHandler(async (request: Request, { params }: any) => {
  const { id } = params;
  const body = await request.json();

  const updatedVehicle = await prisma.transportVehicle.update({
    where: { id },
    data: { ...body }
  });

  
    try {
      await cacheDel(`tenant:${body.companyId}:vehicles:*`);
      await cacheDel(`admin:vehicles:*`);
    } catch (e) {}
    return formatResponse(true, updatedVehicle, "Vehicle updated", 200);
}, { requireAuth: true });


export const DELETE = withApiHandler(async (request: Request, { params }: any) => {
  const { id } = params;
  
 let vehicle = await prisma.transportVehicle.delete({ where: { id } });
  
  
    try {
      await cacheDel(`tenant:${vehicle.companyId}:vehicles:*`);
      await cacheDel(`admin:vehicles:*`);
    } catch (e) {}
    return formatResponse(true, null, "Vehicle removed from fleet", 200);
}, { requireAuth: true });