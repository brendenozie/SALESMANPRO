import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/showings/[showingId]/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

export const PATCH = withApiHandler(async (request, { params }) => {
  const { id } = params;
  const body = await request.json();
  const { status } = body; // Expecting "active" or "inactive"

  if (!status) {
    return formatResponse(false, null, "Status is required", 400);
  }

  const updatedCategory = await prisma.companyCategory.update({
    where: { id },
    data: { status },
    select: { id: true, name: true, status: true } // Keep it lightweight
  });

  // Clear caches so the UI reflects the change
  await cacheDel(`tenant:${'unscoped'}:companycategory:*`);
  await cacheDel(`admin:companycategory:*`);

  return formatResponse(true, updatedCategory, `Industry is now ${status}`, 200);
});