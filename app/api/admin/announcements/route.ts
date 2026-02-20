import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/announcements/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  
  if (!companyId) return formatResponse(false, null, "Company ID is required", 400);

  // Build the where clause dynamically
  const where: any = { companyId };
  
  // Quick Filter assignments
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const audience = searchParams.get("audience");

  if (status) where.status = status.toUpperCase();
  if (type) where.type = type.toUpperCase();
  if (audience) where.audience = audience.toUpperCase();

  // Date Range Optimization
  const pubAfter = searchParams.get("publishedAfter");
  if (pubAfter) where.publishedAt = { gte: new Date(pubAfter) };

  // OPTIMIZATION: Use 'select' to flatten the response in the DB layer.
  // This removes the need for a .map() loop later.
  
    const cacheKey = `admin:announcements:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const announcements = await prisma.announcement.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      publishedAt: true,
      expiresAt: true,
      status: true,
      type: true,
      audience: true,
      author: { select: { name: true, email: true } },
      company: { select: { name: true } },
      // Include targets only if needed, otherwise skip to save bandwidth
      targetAcademicLevelIds: true,
      targetCourseIds: true,
      targetEducatorIds: true,
      targetStudentIds: true,
      targetDepartmentIds: true,
      targetParentIds: true,
    }
  });

  try {
    if (announcements) {
      await cacheSet(cacheKey, announcements, 60);
    }
  } catch (e) {}

  // OPTIMIZATION: Browser & Edge Caching
  const response = formatResponse(true, announcements, "Fetched", 200);
  response.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  
  return response;
});

export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const { companyId, title, publishedAt, authorId, ...rest } = body;

  // OPTIMIZATION: Simplified validation check
  if (!companyId || !title || !publishedAt || !authorId) {
    return formatResponse(false, null, "Required fields missing", 400);
  }

  // OPTIMIZATION: Use a single 'create' call. 
  // Rely on Database Foreign Key constraints rather than manual 'findUnique' checks
  // to save 2 extra DB round-trips.
  try {
    const newAnnouncement = await prisma.announcement.create({
      data: {
        ...body,
        publishedAt: new Date(publishedAt),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      select: { id: true, title: true } // Only return what's needed to confirm creation
    });

    
    try { await cacheDel(`admin:announcements:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newAnnouncement, "Created", 201);
  } catch (error: any) {
    // Catch foreign key failures (invalid authorId or companyId)
    if (error.code === 'P2003') {
      return formatResponse(false, null, "Invalid Author or Company ID", 400);
    }
    throw error;
  }
});

