import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const VALID_ANNOUNCEMENT_STATUSES = new Set(["PENDING", "PUBLISHED", "ARCHIVED"]);
const VALID_ANNOUNCEMENT_TYPES = new Set([
  "GENERAL",
  "ACADEMIC",
  "EVENT",
  "HOLIDAY",
  "ALERT",
  "NEWS",
  "POLICY_UPDATE",
  "FEEDBACK",
  "SURVEY",
  "OTHER",
]);
const VALID_ANNOUNCEMENT_AUDIENCES = new Set([
  "ALL",
  "ACADEMIC_LEVEL",
  "COURSE",
  "EDUCATOR",
  "STUDENT",
  "DEPARTMENT",
  "STAFF",
  "PARENT",
]);

const baseSelect = {
  id: true,
  title: true,
  summary: true,
  content: true,
  status: true,
  type: true,
  audience: true,
  publishedAt: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, email: true } },
  company: { select: { id: true, name: true } },
};

// =======================
// GET
// =======================
export const GET = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const { user } = context;
  const searchParams = new URL(request.url).searchParams;
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Unauthorized", 401);

  const cacheKey = `admin:announcements:${companyId || 'global'}:${id}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const announcement = await prisma.announcement.findFirst({
    where: { id, ...(companyId && { companyId }) },
    select: baseSelect,
  });

  if (!announcement) {
    return formatResponse(false, null, "Announcement not found", 404);
  }

  try {    
    if (announcement) {
      await cacheSet(cacheKey, {
        ...announcement,
        publishedAt: announcement.publishedAt?.toISOString(),
        expiresAt: announcement.expiresAt?.toISOString() || null,
        createdAt: announcement.createdAt?.toISOString(), 
        updatedAt: announcement.updatedAt?.toISOString(),
        authorName: announcement.author?.name ?? "N/A",
        authorEmail: announcement.author?.email ?? "N/A",
        companyName: announcement.company?.name ?? "N/A",
      }, 60); // Cache for 60 seconds
    } 
  } catch (e) {}

  return NextResponse.json(
    {
      ...announcement,
      publishedAt: announcement.publishedAt?.toISOString(),
      expiresAt: announcement.expiresAt?.toISOString() || null,
      createdAt: announcement.createdAt?.toISOString(),
      updatedAt: announcement.updatedAt?.toISOString(),
      authorName: announcement.author?.name ?? "N/A",
      authorEmail: announcement.author?.email ?? "N/A",
      companyName: announcement.company?.name ?? "N/A",
    },
    { status: 200 }
  );
});

// =======================
// PATCH
// =======================
export const PATCH = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const { user } = context;
  const searchParams = new URL(request.url).searchParams;
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Unauthorized", 401);

  const body = await request.json();

  const {
    title,
    summary,
    content,
    publishedAt,
    expiresAt,
    status,
    type,
    audience,
    targetAcademicLevelIds,
    targetCourseIds,
    targetEducatorIds,
    targetStudentIds,
    targetDepartmentIds,
    targetParentIds,
  } = body;

  if (status && !VALID_ANNOUNCEMENT_STATUSES.has(status))
    return formatResponse(false, null, `Invalid status: ${status}`, 400);

  if (type && !VALID_ANNOUNCEMENT_TYPES.has(type))
    return formatResponse(false, null, `Invalid type: ${type}`, 400);

  if (audience && !VALID_ANNOUNCEMENT_AUDIENCES.has(audience))
    return formatResponse(false, null, `Invalid audience: ${audience}`, 400);

  const updateData: any = {
    ...(title !== undefined && { title }),
    ...(summary !== undefined && { summary }),
    ...(content !== undefined && { content }),
    ...(status && { status }),
    ...(type && { type }),
    ...(audience && { audience }),
    ...(targetAcademicLevelIds !== undefined && {
      targetAcademicLevelIds: Array.isArray(targetAcademicLevelIds) ? targetAcademicLevelIds : [],
    }),
    ...(targetCourseIds !== undefined && {
      targetCourseIds: Array.isArray(targetCourseIds) ? targetCourseIds : [],
    }),
    ...(targetEducatorIds !== undefined && {
      targetEducatorIds: Array.isArray(targetEducatorIds) ? targetEducatorIds : [],
    }),
    ...(targetStudentIds !== undefined && {
      targetStudentIds: Array.isArray(targetStudentIds) ? targetStudentIds : [],
    }),
    ...(targetDepartmentIds !== undefined && {
      targetDepartmentIds: Array.isArray(targetDepartmentIds) ? targetDepartmentIds : [],
    }),
    ...(targetParentIds !== undefined && {
      targetParentIds: Array.isArray(targetParentIds) ? targetParentIds : [],
    }),
  };

  if (publishedAt !== undefined) {
    const d = new Date(publishedAt);
    if (isNaN(d.getTime())) return formatResponse(false, null, "Invalid publishedAt", 400);
    updateData.publishedAt = d;
  }

  if (expiresAt !== undefined) {
    if (expiresAt === null) updateData.expiresAt = null;
    else {
      const d = new Date(expiresAt);
      if (isNaN(d.getTime())) return formatResponse(false, null, "Invalid expiresAt", 400);
      updateData.expiresAt = d;
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.announcement.findFirst({
      where: { id, companyId },
      select: { publishedAt: true, expiresAt: true },
    });

    if (!existing) throw new Error("NOT_FOUND");

    const finalPublishedAt = updateData.publishedAt ?? existing.publishedAt;
    const finalExpiresAt = updateData.expiresAt ?? existing.expiresAt;

    if (finalPublishedAt && finalExpiresAt && finalExpiresAt <= finalPublishedAt) {
      throw new Error("INVALID_DATES");
    }

    return tx.announcement.update({
      where: { id, companyId },
      data: updateData,
      select: baseSelect,
    });
  }).catch((e) => {
    if (e.message === "NOT_FOUND") return null;
    if (e.message === "INVALID_DATES") throw e;
    throw e;
  });

  if (!updated) return formatResponse(false, null, "Announcement not found", 404);

  try { await cacheDel(`admin:announcements:${companyId || 'global'}:*`); } catch (e) {}

  return NextResponse.json(
    {
      ...updated,
      publishedAt: updated.publishedAt?.toISOString(),
      expiresAt: updated.expiresAt?.toISOString() || null,
      createdAt: updated.createdAt?.toISOString(),
      updatedAt: updated.updatedAt?.toISOString(),
      authorName: updated.author?.name ?? "N/A",
      authorEmail: updated.author?.email ?? "N/A",
      companyName: updated.company?.name ?? "N/A",
    },
    { status: 200 }
  );
});

// =======================
// DELETE
// =======================
export const DELETE = withApiHandler(async (request, context) => {

  const { user } = context;

  if (!user) return formatResponse(false, null, "Unauthorized", 401);

  const searchParams = new URL(request.url).searchParams;
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Unauthorized", 401);

  const { id } = context.params;

  const deleted = await prisma.announcement.deleteMany({
    where: { id, companyId },
  });

  if (!deleted.count) {
    return formatResponse(false, null, "Announcement not found", 404);
  }

  try { await cacheDel(`admin:announcements:${companyId || 'global'}:*`); } catch (e) {}

  return formatResponse(true, { deletedId: id }, "Announcement deleted", 200);
});
