import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const PATCH = withApiHandler(async (request: Request, { params }: any) => {
  const { id } = params;
  const body = await request.json();

  const updated = await prisma.transportAssignment.update({
    where: { id },
    data: { 
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      routeId: body.routeId || undefined
    }
  });

  
    try {
      await cacheDel(`tenant:${id}:drivers:*`);
      await cacheDel(`admin:drivers:*`);
    } catch (e) {}
    return formatResponse(true, updated, "Assignment updated", 200);
}, { requireAuth: true });

export const DELETE = withApiHandler(async (request: Request, { params }: any) => {
  const { id } = params;
  await prisma.transportAssignment.delete({ where: { id } });
  
    try {
      await cacheDel(`tenant:${id}:drivers:*`);
      await cacheDel(`admin:drivers:*`);
    } catch (e) {}
    return formatResponse(true, null, "Assignment removed", 200);
}, { requireAuth: true });