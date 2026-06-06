import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const VALID_ANNOUNCEMENT_STATUSES = new Set([
  "PENDING",
  "PUBLISHED",
  "ARCHIVED",
]);
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
  targetAcademicLevelIds: true,
  targetCourseIds: true,
  targetEducatorIds: true,
  targetStudentIds: true,
  targetDepartmentIds: true,
  targetParentIds: true,
};

export const GET = withApiHandler(async (request, context) => {
  const resolvedParams = await context.params;
  const { id } = resolvedParams;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId)
    return formatResponse(
      false,
      null,
      "Company identity scope configuration validation missing",
      400,
    );

  const cacheKey = `admin:announcements:${companyId}:${id}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    const announcement = await prisma.announcement.findFirst({
      where: { id, companyId },
      select: baseSelect,
    });

    if (!announcement)
      return formatResponse(
        false,
        null,
        "Announcement record does not exist",
        404,
      );

    try {
      await cacheSet(cacheKey, announcement, 60);
    } catch (e) {}

    return formatResponse(
      true,
      announcement,
      "Announcement data profile details loaded successfully",
      200,
    );
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Failure executing profile information extraction query",
      500,
    );
  }
});

export const PATCH = withApiHandler(async (request, context) => {
  const resolvedParams = await context.params;
  const { id } = resolvedParams;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId)
    return formatResponse(
      false,
      null,
      "Company identity scope context parameter missing",
      400,
    );

  try {
    const body = await request.json();
    const { status, type, audience, publishedAt, expiresAt } = body;

    if (status && !VALID_ANNOUNCEMENT_STATUSES.has(status))
      return formatResponse(
        false,
        null,
        `Invalid status field tag value: ${status}`,
        400,
      );
    if (type && !VALID_ANNOUNCEMENT_TYPES.has(type))
      return formatResponse(
        false,
        null,
        `Invalid type property label definition: ${type}`,
        400,
      );
    if (audience && !VALID_ANNOUNCEMENT_AUDIENCES.has(audience))
      return formatResponse(
        false,
        null,
        `Invalid audience selection variant option: ${audience}`,
        400,
      );

    const updateData: any = {};
    const stringFields = ["title", "summary", "content"];
    const arrayFields = [
      "targetAcademicLevelIds",
      "targetCourseIds",
      "targetEducatorIds",
      "targetStudentIds",
      "targetDepartmentIds",
      "targetParentIds",
    ];

    stringFields.forEach((field) => {
      if (body[field] !== undefined) updateData[field] = body[field];
    });
    arrayFields.forEach((field) => {
      if (body[field] !== undefined)
        updateData[field] = Array.isArray(body[field]) ? body[field] : [];
    });

    if (status) updateData.status = status;
    if (type) updateData.type = type;
    if (audience) updateData.audience = audience;

    if (publishedAt !== undefined) {
      const d = new Date(publishedAt);
      if (isNaN(d.getTime()))
        return formatResponse(
          false,
          null,
          "Invalid publishedAt timestamp compilation structure",
          400,
        );
      updateData.publishedAt = d;
    }

    if (expiresAt !== undefined) {
      if (expiresAt === null) updateData.expiresAt = null;
      else {
        const d = new Date(expiresAt);
        if (isNaN(d.getTime()))
          return formatResponse(
            false,
            null,
            "Invalid expiresAt date format structure parameters",
            400,
          );
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

      if (
        finalPublishedAt &&
        finalExpiresAt &&
        finalExpiresAt <= finalPublishedAt
      ) {
        throw new Error("INVALID_DATES");
      }

      return tx.announcement.update({
        where: { id, companyId },
        data: updateData,
        select: baseSelect,
      });
    });

    try {
      await cacheDel(`admin:announcements:${companyId}:all`);
      await cacheDel(`admin:announcements:${companyId}:${id}`);
    } catch (e) {}

    return formatResponse(
      true,
      updated,
      "Announcement content details updated successfully",
      200,
    );
  } catch (error: any) {
    if (error.message === "NOT_FOUND")
      return formatResponse(
        false,
        null,
        "Announcement record variant profile not found",
        404,
      );
    if (error.message === "INVALID_DATES")
      return formatResponse(
        false,
        null,
        "Expiration dates constraints cannot match or happen prior to execution publish date milestones",
        400,
      );
    return formatResponse(
      false,
      null,
      "Modification execution run transaction runtime fault error",
      500,
    );
  }
});

export const DELETE = withApiHandler(async (request, context) => {
  const resolvedParams = await context.params;
  const { id } = resolvedParams;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId)
    return formatResponse(
      false,
      null,
      "Missing validation context values",
      400,
    );

  try {
    const deleted = await prisma.announcement.deleteMany({
      where: { id, companyId },
    });

    if (!deleted.count)
      return formatResponse(
        false,
        null,
        "Announcement reference trace record target index not found",
        404,
      );

    try {
      await cacheDel(`admin:announcements:${companyId}:all`);
      await cacheDel(`admin:announcements:${companyId}:${id}`);
    } catch (e) {}

    return formatResponse(
      true,
      { deletedId: id },
      "Announcement profile element deleted safely",
      200,
    );
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Drop cascade records system error encountered",
      500,
    );
  }
});
