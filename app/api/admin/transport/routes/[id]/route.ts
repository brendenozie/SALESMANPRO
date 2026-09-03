import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const PATCH = withApiHandler(async (request: Request, { params }: any) => {
  const { id } = params;
  const body = await request.json();

  const updatedRoute = await prisma.transportRoute.update({
    where: { id },
    data: { ...body },
    include: { vehicle: true }
  });

  
    try {
      await cacheDel(`tenant:${'global'}:routes:*`);
      await cacheDel(`admin:routes:*`);
    } catch (e) {}
    return formatResponse(true, updatedRoute, "Route updated", 200);
}, { requireAuth: true });

export const DELETE = withApiHandler(async (request: Request, { params }: any) => {
  const { id } = params;
  await prisma.transportRoute.delete({ where: { id } });
  
    try {
      await cacheDel(`tenant:${'global'}:routes:*`);
      await cacheDel(`admin:routes:*`);
    } catch (e) {}
    return formatResponse(true, null, "Route deleted", 200);
}, { requireAuth: true });