import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/academic-levels/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Force the use of Edge if your DB setup allows it
// export const runtime = 'edge'; 

export const GET = withApiHandler(async (req, context) => {
  const { id } = context.params;
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  // OPTIMIZATION: Use 'select' to only pull what you need
  // and use a lean findUnique call.
  
    const cacheKey = `admin:academic-levels:${companyId || 'global'}:all`;

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
      // Avoid fetching massive 'createdAt' or 'updatedAt' if not needed
    }
  });

  try {
    if (academicLevel) {
      await cacheSet(cacheKey, academicLevel, 60);
    }
  } catch (e) {}

  if (!academicLevel) {
    return formatResponse(false, null, "Not found", 404);
  }

  // OPTIMIZATION: Add Cache-Control headers so the browser/CDN can help
  const response = formatResponse(true, academicLevel, "Fetched", 200);
  response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  
  return response;
});

export const PATCH = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const body = await request.json();

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  
  // OPTIMIZATION: Data validation before hitting the DB
  if (!body.name) return formatResponse(false, null, "Name is required", 400);

  const updated = await prisma.academicLevel.update({
    where: { id, companyId: companyId || undefined },
    data: { 
      name: body.name, 
      description: body.description, 
      sortOrder: body.sortOrder 
    },
  });

  
    try { await cacheDel(`admin:academic-levels:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updated, "Updated", 200);
});

export const DELETE = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  await prisma.academicLevel.delete({
    where: { id, companyId: companyId || undefined },
  });
    try { await cacheDel(`admin:academic-levels:${companyId || 'global'}:*`); } catch (e) {}
  return formatResponse(true, null, "Deleted", 200);
});
