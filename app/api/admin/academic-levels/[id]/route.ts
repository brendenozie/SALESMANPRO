import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

export const GET = withApiHandler(async (req, context) => {
  const { id } = context.params;
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID required", 400);
  }

  // FIX: Separate unique cache key for item vs list
  const cacheKey = `admin:academic-levels:${companyId}:id:${id}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const academicLevel = await prisma.academicLevel.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      sortOrder: true,
      companyId: true, // Essential to verify ownership context
    },
  });

  if (!academicLevel || academicLevel.companyId !== companyId) {
    return formatResponse(false, null, "Not found", 404);
  }

  try {
    await cacheSet(cacheKey, academicLevel, 60);
  } catch (e) {}

  const response = formatResponse(true, academicLevel, "Fetched", 200);
  response.headers.set(
    "Cache-Control",
    "private, s-maxage=60, stale-while-revalidate=30",
  );

  return response;
});

export const PATCH = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const body = await request.json();
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId)
    return formatResponse(false, null, "Company ID required", 400);
  if (!body.name) return formatResponse(false, null, "Name is required", 400);

  // FIX: Force both id and companyId matching to avoid cross-tenant mutations
  const updated = await prisma.academicLevel.update({
    where: {
      id,
      companyId: companyId, // No '|| undefined'
    },
    data: {
      name: body.name,
      description: body.description,
      sortOrder: body.sortOrder,
    },
  });

  // Purge both list and item cache explicitly
  try {
    await cacheDel(`admin:academic-levels:${companyId}:all`);
    await cacheDel(`admin:academic-levels:${companyId}:id:${id}`);
  } catch (e) {}

  return formatResponse(true, updated, "Updated", 200);
});

export const DELETE = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId)
    return formatResponse(false, null, "Company ID required", 400);

  await prisma.academicLevel.delete({
    where: {
      id,
      companyId: companyId,
    },
  });

  try {
    await cacheDel(`admin:academic-levels:${companyId}:all`);
    await cacheDel(`admin:academic-levels:${companyId}:id:${id}`);
  } catch (e) {}

  return formatResponse(true, null, "Deleted", 200);
});
