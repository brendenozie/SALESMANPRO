import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId)
    return formatResponse(false, null, "Company ID is required", 400);

  const where: any = { companyId };

  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const audience = searchParams.get("audience");
  const pubAfter = searchParams.get("publishedAfter");

  if (status) where.status = status.toUpperCase();
  if (type) where.type = type.toUpperCase();
  if (audience) where.audience = audience.toUpperCase();
  if (pubAfter) where.publishedAt = { gte: new Date(pubAfter) };

  const cacheKey = `admin:announcements:${companyId}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      const cachedResponse = formatResponse(
        true,
        cached,
        "Fetched (Cached)",
        200,
      );
      cachedResponse.headers.set(
        "Cache-Control",
        "s-maxage=30, stale-while-revalidate=60",
      );
      return cachedResponse;
    }
  } catch (e) {}

  try {
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
        author: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } },
        targetAcademicLevelIds: true,
        targetCourseIds: true,
        targetEducatorIds: true,
        targetStudentIds: true,
        targetDepartmentIds: true,
        targetParentIds: true,
      },
    });

    try {
      await cacheSet(cacheKey, announcements, 60);
    } catch (e) {}

    const response = formatResponse(
      true,
      announcements,
      "Fetched announcements successfully",
      200,
    );
    response.headers.set(
      "Cache-Control",
      "s-maxage=30, stale-while-revalidate=60",
    );
    return response;
  } catch (error) {
    return formatResponse(false, null, "Failed to retrieve announcements", 500);
  }
});

export const POST = withApiHandler(async (request) => {
  try {
    const body = await request.json();
    const { companyId, title, publishedAt, authorId } = body;

    if (!companyId || !title || !publishedAt || !authorId) {
      return formatResponse(false, null, "Required fields missing", 400);
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        ...body,
        publishedAt: new Date(publishedAt),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      select: { id: true, title: true },
    });

    // Clear list cache key safely
    try {
      await cacheDel(`admin:announcements:${companyId}:all`);
    } catch (e) {}

    return formatResponse(
      true,
      newAnnouncement,
      "Announcement created successfully",
      201,
    );
  } catch (error: any) {
    if (error.code === "P2003") {
      return formatResponse(
        false,
        null,
        "Invalid Author or Company assignment relation ID reference",
        400,
      );
    }
    return formatResponse(
      false,
      null,
      "Internal data write exception thrown",
      500,
    );
  }
});
