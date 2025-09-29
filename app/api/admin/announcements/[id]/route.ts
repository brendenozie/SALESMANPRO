import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Define valid Enum values (must match your Prisma enums)
const VALID_ANNOUNCEMENT_STATUSES = ["PENDING", "PUBLISHED", "ARCHIVED"];
const VALID_ANNOUNCEMENT_TYPES = [
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
];
const VALID_ANNOUNCEMENT_AUDIENCES = [
  "ALL",
  "ACADEMIC_LEVEL",
  "COURSE",
  "EDUCATOR",
  "STUDENT",
  "DEPARTMENT",
  "STAFF",
  "PARENT",
];

/**
 * GET /api/announcements/[id]
 * Fetch a single announcement
 */
export const GET = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const { user } = context;

  if (!user) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      company: { select: { id: true, name: true } },
    },
  });

  if (!announcement) {
    return formatResponse(false, null, "Announcement not found", 404);
  }

  // Optional: enforce company ownership
  if (announcement.companyId !== user.companyId) {
    return formatResponse(false, null, "Forbidden", 403);
  }

  const responseData = {
    ...announcement,
    publishedAt: announcement.publishedAt?.toISOString(),
    expiresAt: announcement.expiresAt?.toISOString() || null,
    createdAt: announcement.createdAt?.toISOString(),
    updatedAt: announcement.updatedAt?.toISOString(),
    authorName: announcement.author?.name || "N/A",
    authorEmail: announcement.author?.email || "N/A",
    companyName: announcement.company?.name || "N/A",
  };

  return NextResponse.json(responseData, { status: 200 });
});

/**
 * PATCH /api/announcements/[id]
 * Update an announcement
 */
export const PATCH = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const { user } = context;

  if (!user) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

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
    ...rest
  } = body;

  if (Object.keys(rest).length > 0) {
    console.warn("Unexpected fields in PATCH request:", rest);
  }

  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    return formatResponse(false, null, "Announcement not found", 404);
  }

  // Ownership check
  if (existing.companyId !== user.companyId) {
    return formatResponse(false, null, "Forbidden", 403);
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (summary !== undefined) updateData.summary = summary;
  if (content !== undefined) updateData.content = content;

  // Validate enums
  if (status && !VALID_ANNOUNCEMENT_STATUSES.includes(status)) {
    return formatResponse(false, null, `Invalid status: ${status}`, 400);
  }
  if (type && !VALID_ANNOUNCEMENT_TYPES.includes(type)) {
    return formatResponse(false, null, `Invalid type: ${type}`, 400);
  }
  if (audience && !VALID_ANNOUNCEMENT_AUDIENCES.includes(audience)) {
    return formatResponse(false, null, `Invalid audience: ${audience}`, 400);
  }
  if (status) updateData.status = status;
  if (type) updateData.type = type;
  if (audience) updateData.audience = audience;

  // Dates
  if (publishedAt !== undefined) {
    const parsed = new Date(publishedAt);
    if (isNaN(parsed.getTime())) return formatResponse(false, null, "Invalid publishedAt date", 400);
    updateData.publishedAt = parsed;
  }
  if (expiresAt !== undefined) {
    if (expiresAt === null) updateData.expiresAt = null;
    else {
      const parsed = new Date(expiresAt);
      if (isNaN(parsed.getTime())) return formatResponse(false, null, "Invalid expiresAt date", 400);
      updateData.expiresAt = parsed;
    }
  }

  const finalPublishedAt = updateData.publishedAt || existing.publishedAt;
  const finalExpiresAt = updateData.expiresAt || existing.expiresAt;
  if (finalPublishedAt && finalExpiresAt && finalExpiresAt <= finalPublishedAt) {
    return formatResponse(false, null, "Expiry must be after publish date", 400);
  }

  // Targets
  if (targetAcademicLevelIds !== undefined)
    updateData.targetAcademicLevelIds = Array.isArray(targetAcademicLevelIds) ? targetAcademicLevelIds : [];
  if (targetCourseIds !== undefined)
    updateData.targetCourseIds = Array.isArray(targetCourseIds) ? targetCourseIds : [];
  if (targetEducatorIds !== undefined)
    updateData.targetEducatorIds = Array.isArray(targetEducatorIds) ? targetEducatorIds : [];
  if (targetStudentIds !== undefined)
    updateData.targetStudentIds = Array.isArray(targetStudentIds) ? targetStudentIds : [];
  if (targetDepartmentIds !== undefined)
    updateData.targetDepartmentIds = Array.isArray(targetDepartmentIds) ? targetDepartmentIds : [];
  if (targetParentIds !== undefined)
    updateData.targetParentIds = Array.isArray(targetParentIds) ? targetParentIds : [];

  const updated = await prisma.announcement.update({
    where: { id },
    data: updateData,
    include: {
      author: { select: { id: true, name: true, email: true } },
      company: { select: { id: true, name: true } },
    },
  });

  const responseData = {
    ...updated,
    publishedAt: updated.publishedAt?.toISOString(),
    expiresAt: updated.expiresAt?.toISOString() || null,
    createdAt: updated.createdAt?.toISOString(),
    updatedAt: updated.updatedAt?.toISOString(),
    authorName: updated.author?.name || "N/A",
    authorEmail: updated.author?.email || "N/A",
    companyName: updated.company?.name || "N/A",
  };

  return NextResponse.json(responseData, { status: 200 });
});

/**
 * DELETE /api/announcements/[id]
 * Delete an announcement
 */
export const DELETE = withApiHandler(async (request, context) => {
  const { user } = context;

  if (!user) {
    return formatResponse(false, null, "Unauthorized", 401);
  }
  
  const { id } = context.params;

  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    return formatResponse(false, null, "Announcement not found", 404);
  }

  // Ownership check
  if (existing.companyId !== user.companyId) {
    return formatResponse(false, null, "Forbidden", 403);
  }

  const deleted = await prisma.announcement.delete({ where: { id } });
  return formatResponse(true, { deletedId: deleted.id }, "Announcement deleted", 200);
});
