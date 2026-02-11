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

  if (!user) return formatResponse(false, null, "Unauthorized", 401);

  const announcement = await prisma.announcement.findFirst({
    where: { id, companyId: user.companyId },
    select: baseSelect,
  });

  if (!announcement) {
    return formatResponse(false, null, "Announcement not found", 404);
  }

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

  if (!user) return formatResponse(false, null, "Unauthorized", 401);

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
      where: { id, companyId: user.companyId },
      select: { publishedAt: true, expiresAt: true },
    });

    if (!existing) throw new Error("NOT_FOUND");

    const finalPublishedAt = updateData.publishedAt ?? existing.publishedAt;
    const finalExpiresAt = updateData.expiresAt ?? existing.expiresAt;

    if (finalPublishedAt && finalExpiresAt && finalExpiresAt <= finalPublishedAt) {
      throw new Error("INVALID_DATES");
    }

    return tx.announcement.update({
      where: { id },
      data: updateData,
      select: baseSelect,
    });
  }).catch((e) => {
    if (e.message === "NOT_FOUND") return null;
    if (e.message === "INVALID_DATES") throw e;
    throw e;
  });

  if (!updated) return formatResponse(false, null, "Announcement not found", 404);

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

  const { id } = context.params;

  const deleted = await prisma.announcement.deleteMany({
    where: { id, companyId: user.companyId },
  });

  if (!deleted.count) {
    return formatResponse(false, null, "Announcement not found", 404);
  }

  return formatResponse(true, { deletedId: id }, "Announcement deleted", 200);
});
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";
// import { Prisma } from "@prisma/client";

// export const GET = withApiHandler(async (request, context) => {
//   const { id } = context.params;
//   const { user } = context;

//   const announcement = await prisma.announcement.findUnique({
//     where: { id },
//     // Only select what we actually use to reduce I/O
//     select: {
//       id: true, title: true, summary: true, content: true,
//       status: true, type: true, audience: true,
//       publishedAt: true, expiresAt: true, companyId: true,
//       author: { select: { name: true, email: true } },
//       company: { select: { name: true } },
//     },
//   });

//   if (!announcement || announcement.companyId !== user.companyId) {
//     return formatResponse(false, null, "Not found", 404);
//   }

//   // OPTIMIZATION: HTTP Caching
//   // private: cache only for this user
//   // s-maxage: cache on the Edge for 60s
//   // stale-while-revalidate: serve old data for up to 30s while fetching fresh
//   const response = NextResponse.json(announcement, { status: 200 });
//   response.headers.set(
//     "Cache-Control", 
//     "private, s-maxage=60, stale-while-revalidate=30"
//   );
  
//   return response;
// });

// export const PATCH = withApiHandler(async (request, context) => {
//   const { id } = context.params;
//   const { user } = context;
//   const body = await request.json();

//   try {
//     // OPTIMIZATION: Direct update with ownership check in the 'where' clause
//     const updated = await prisma.announcement.update({
//       where: { 
//         id, 
//         companyId: user.companyId // Atomic security check
//       },
//       data: {
//         ...body,
//         // Ensure dates are correctly parsed if they exist
//         publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
//         expiresAt: body.expiresAt === null ? null : (body.expiresAt ? new Date(body.expiresAt) : undefined),
//       },
//       include: {
//         author: { select: { name: true, email: true } },
//       }
//     });

//     return formatResponse(true, updated, "Updated successfully", 200);
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Announcement not found or access denied", 404);
//     }
//     throw error;
//   }
// });

// export const DELETE = withApiHandler(async (request, context) => {
//   const { id } = context.params;
//   const { user } = context;

//   try {
//     // OPTIMIZATION: Atomic Delete
//     await prisma.announcement.delete({
//       where: { id, companyId: user.companyId }
//     });
//     return formatResponse(true, { deletedId: id }, "Deleted", 200);
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Not found", 404);
//     }
//     throw error;
//   }
// });
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// // Define valid Enum values (must match your Prisma enums)
// const VALID_ANNOUNCEMENT_STATUSES = ["PENDING", "PUBLISHED", "ARCHIVED"];
// const VALID_ANNOUNCEMENT_TYPES = [
//   "GENERAL",
//   "ACADEMIC",
//   "EVENT",
//   "HOLIDAY",
//   "ALERT",
//   "NEWS",
//   "POLICY_UPDATE",
//   "FEEDBACK",
//   "SURVEY",
//   "OTHER",
// ];
// const VALID_ANNOUNCEMENT_AUDIENCES = [
//   "ALL",
//   "ACADEMIC_LEVEL",
//   "COURSE",
//   "EDUCATOR",
//   "STUDENT",
//   "DEPARTMENT",
//   "STAFF",
//   "PARENT",
// ];

// /**
//  * GET /api/announcements/[id]
//  * Fetch a single announcement
//  */
// export const GET = withApiHandler(async (request, context) => {
//   const { id } = context.params;
//   const { user } = context;

//   if (!user) {
//     return formatResponse(false, null, "Unauthorized", 401);
//   }

//   const announcement = await prisma.announcement.findUnique({
//     where: { id },
//     include: {
//       author: { select: { id: true, name: true, email: true } },
//       company: { select: { id: true, name: true } },
//     },
//   });

//   if (!announcement) {
//     return formatResponse(false, null, "Announcement not found", 404);
//   }

//   // Optional: enforce company ownership
//   if (announcement.companyId !== user.companyId) {
//     return formatResponse(false, null, "Forbidden", 403);
//   }

//   const responseData = {
//     ...announcement,
//     publishedAt: announcement.publishedAt?.toISOString(),
//     expiresAt: announcement.expiresAt?.toISOString() || null,
//     createdAt: announcement.createdAt?.toISOString(),
//     updatedAt: announcement.updatedAt?.toISOString(),
//     authorName: announcement.author?.name || "N/A",
//     authorEmail: announcement.author?.email || "N/A",
//     companyName: announcement.company?.name || "N/A",
//   };

//   return NextResponse.json(responseData, { status: 200 });
// });

// /**
//  * PATCH /api/announcements/[id]
//  * Update an announcement
//  */
// export const PATCH = withApiHandler(async (request, context) => {
//   const { id } = context.params;
//   const { user } = context;

//   if (!user) {
//     return formatResponse(false, null, "Unauthorized", 401);
//   }

//   const body = await request.json();

//   const {
//     title,
//     summary,
//     content,
//     publishedAt,
//     expiresAt,
//     status,
//     type,
//     audience,
//     targetAcademicLevelIds,
//     targetCourseIds,
//     targetEducatorIds,
//     targetStudentIds,
//     targetDepartmentIds,
//     targetParentIds,
//     ...rest
//   } = body;

//   if (Object.keys(rest).length > 0) {
//     console.warn("Unexpected fields in PATCH request:", rest);
//   }

//   const existing = await prisma.announcement.findUnique({ where: { id } });
//   if (!existing) {
//     return formatResponse(false, null, "Announcement not found", 404);
//   }

//   // Ownership check
//   if (existing.companyId !== user.companyId) {
//     return formatResponse(false, null, "Forbidden", 403);
//   }

//   const updateData: any = {};
//   if (title !== undefined) updateData.title = title;
//   if (summary !== undefined) updateData.summary = summary;
//   if (content !== undefined) updateData.content = content;

//   // Validate enums
//   if (status && !VALID_ANNOUNCEMENT_STATUSES.includes(status)) {
//     return formatResponse(false, null, `Invalid status: ${status}`, 400);
//   }
//   if (type && !VALID_ANNOUNCEMENT_TYPES.includes(type)) {
//     return formatResponse(false, null, `Invalid type: ${type}`, 400);
//   }
//   if (audience && !VALID_ANNOUNCEMENT_AUDIENCES.includes(audience)) {
//     return formatResponse(false, null, `Invalid audience: ${audience}`, 400);
//   }
//   if (status) updateData.status = status;
//   if (type) updateData.type = type;
//   if (audience) updateData.audience = audience;

//   // Dates
//   if (publishedAt !== undefined) {
//     const parsed = new Date(publishedAt);
//     if (isNaN(parsed.getTime())) return formatResponse(false, null, "Invalid publishedAt date", 400);
//     updateData.publishedAt = parsed;
//   }
//   if (expiresAt !== undefined) {
//     if (expiresAt === null) updateData.expiresAt = null;
//     else {
//       const parsed = new Date(expiresAt);
//       if (isNaN(parsed.getTime())) return formatResponse(false, null, "Invalid expiresAt date", 400);
//       updateData.expiresAt = parsed;
//     }
//   }

//   const finalPublishedAt = updateData.publishedAt || existing.publishedAt;
//   const finalExpiresAt = updateData.expiresAt || existing.expiresAt;
//   if (finalPublishedAt && finalExpiresAt && finalExpiresAt <= finalPublishedAt) {
//     return formatResponse(false, null, "Expiry must be after publish date", 400);
//   }

//   // Targets
//   if (targetAcademicLevelIds !== undefined)
//     updateData.targetAcademicLevelIds = Array.isArray(targetAcademicLevelIds) ? targetAcademicLevelIds : [];
//   if (targetCourseIds !== undefined)
//     updateData.targetCourseIds = Array.isArray(targetCourseIds) ? targetCourseIds : [];
//   if (targetEducatorIds !== undefined)
//     updateData.targetEducatorIds = Array.isArray(targetEducatorIds) ? targetEducatorIds : [];
//   if (targetStudentIds !== undefined)
//     updateData.targetStudentIds = Array.isArray(targetStudentIds) ? targetStudentIds : [];
//   if (targetDepartmentIds !== undefined)
//     updateData.targetDepartmentIds = Array.isArray(targetDepartmentIds) ? targetDepartmentIds : [];
//   if (targetParentIds !== undefined)
//     updateData.targetParentIds = Array.isArray(targetParentIds) ? targetParentIds : [];

//   const updated = await prisma.announcement.update({
//     where: { id },
//     data: updateData,
//     include: {
//       author: { select: { id: true, name: true, email: true } },
//       company: { select: { id: true, name: true } },
//     },
//   });

//   const responseData = {
//     ...updated,
//     publishedAt: updated.publishedAt?.toISOString(),
//     expiresAt: updated.expiresAt?.toISOString() || null,
//     createdAt: updated.createdAt?.toISOString(),
//     updatedAt: updated.updatedAt?.toISOString(),
//     authorName: updated.author?.name || "N/A",
//     authorEmail: updated.author?.email || "N/A",
//     companyName: updated.company?.name || "N/A",
//   };

//   return NextResponse.json(responseData, { status: 200 });
// });

// /**
//  * DELETE /api/announcements/[id]
//  * Delete an announcement
//  */
// export const DELETE = withApiHandler(async (request, context) => {
//   const { user } = context;

//   if (!user) {
//     return formatResponse(false, null, "Unauthorized", 401);
//   }
  
//   const { id } = context.params;

//   const existing = await prisma.announcement.findUnique({ where: { id } });
//   if (!existing) {
//     return formatResponse(false, null, "Announcement not found", 404);
//   }

//   // Ownership check
//   if (existing.companyId !== user.companyId) {
//     return formatResponse(false, null, "Forbidden", 403);
//   }

//   const deleted = await prisma.announcement.delete({ where: { id } });
//   return formatResponse(true, { deletedId: deleted.id }, "Announcement deleted", 200);
// });
