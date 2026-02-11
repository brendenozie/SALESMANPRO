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

    return formatResponse(true, newAnnouncement, "Created", 201);
  } catch (error: any) {
    // Catch foreign key failures (invalid authorId or companyId)
    if (error.code === 'P2003') {
      return formatResponse(false, null, "Invalid Author or Company ID", 400);
    }
    throw error;
  }
});
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
//  * GET /api/announcements
//  * Fetches announcements filtered by companyId and optional criteria
//  */
// export const GET = withApiHandler(async (request) => {
//   const { searchParams } = new URL(request.url);
//   const companyId = searchParams.get("companyId");
//   const status = searchParams.get("status");
//   const type = searchParams.get("type");
//   const audience = searchParams.get("audience");
//   const authorId = searchParams.get("authorId");
//   const publishedAfter = searchParams.get("publishedAfter");
//   const publishedBefore = searchParams.get("publishedBefore");
//   const expiresAfter = searchParams.get("expiresAfter");
//   const expiresBefore = searchParams.get("expiresBefore");

//   if (!companyId) {
//     return formatResponse(false, null, "Company ID is required", 400);
//   }

//   const whereClause: any = { companyId };

//   if (status) {
//     if (!VALID_ANNOUNCEMENT_STATUSES.includes(status.toUpperCase())) {
//       return formatResponse(
//         false,
//         null,
//         `Invalid status: ${status}. Must be one of ${VALID_ANNOUNCEMENT_STATUSES.join(", ")}.`,
//         400
//       );
//     }
//     whereClause.status = status.toUpperCase();
//   }

//   if (type) {
//     if (!VALID_ANNOUNCEMENT_TYPES.includes(type.toUpperCase())) {
//       return formatResponse(
//         false,
//         null,
//         `Invalid type: ${type}. Must be one of ${VALID_ANNOUNCEMENT_TYPES.join(", ")}.`,
//         400
//       );
//     }
//     whereClause.type = type.toUpperCase();
//   }

//   if (audience) {
//     if (!VALID_ANNOUNCEMENT_AUDIENCES.includes(audience.toUpperCase())) {
//       return formatResponse(
//         false,
//         null,
//         `Invalid audience: ${audience}. Must be one of ${VALID_ANNOUNCEMENT_AUDIENCES.join(", ")}.`,
//         400
//       );
//     }
//     whereClause.audience = audience.toUpperCase();
//   }

//   if (authorId) {
//     whereClause.authorId = authorId;
//   }

//   if (publishedAfter || publishedBefore) {
//     whereClause.publishedAt = {};
//     if (publishedAfter) {
//       const date = new Date(publishedAfter);
//       if (isNaN(date.getTime()))
//         return formatResponse(false, null, "Invalid publishedAfter date", 400);
//       whereClause.publishedAt.gte = date;
//     }
//     if (publishedBefore) {
//       const date = new Date(publishedBefore);
//       if (isNaN(date.getTime()))
//         return formatResponse(false, null, "Invalid publishedBefore date", 400);
//       whereClause.publishedAt.lte = date;
//     }
//   }

//   if (expiresAfter || expiresBefore) {
//     whereClause.expiresAt = {};
//     if (expiresAfter) {
//       const date = new Date(expiresAfter);
//       if (isNaN(date.getTime()))
//         return formatResponse(false, null, "Invalid expiresAfter date", 400);
//       whereClause.expiresAt.gte = date;
//     }
//     if (expiresBefore) {
//       const date = new Date(expiresBefore);
//       if (isNaN(date.getTime()))
//         return formatResponse(false, null, "Invalid expiresBefore date", 400);
//       whereClause.expiresAt.lte = date;
//     }
//   }

//   const announcements = await prisma.announcement.findMany({
//     where: whereClause,
//     include: {
//       author: { select: { id: true, name: true, email: true } },
//       company: { select: { id: true, name: true } },
//     },
//     orderBy: { publishedAt: "desc" },
//   });

//   const response = announcements.map((a) => ({
//     id: a.id,
//     title: a.title,
//     summary: a.summary,
//     content: a.content,
//     publishedAt: a.publishedAt.toISOString(),
//     expiresAt: a.expiresAt?.toISOString() || null,
//     authorId: a.authorId,
//     authorName: a.author?.name || "N/A",
//     authorEmail: a.author?.email || "N/A",
//     companyId: a.companyId,
//     companyName: a.company?.name || "N/A",
//     status: a.status,
//     type: a.type,
//     audience: a.audience,
//     targetAcademicLevelIds: a.targetAcademicLevelIds,
//     targetCourseIds: a.targetCourseIds,
//     targetEducatorIds: a.targetEducatorIds,
//     targetStudentIds: a.targetStudentIds,
//     targetDepartmentIds: a.targetDepartmentIds,
//     targetParentIds: a.targetParentIds,
//     createdAt: a.createdAt?.toISOString(),
//     updatedAt: a.updatedAt?.toISOString(),
//   }));

//   return formatResponse(true, response, "Fetched announcements", 200);
// });

// /**
//  * POST /api/announcements
//  * Creates a new announcement
//  */
// export const POST = withApiHandler(async (request) => {
//   const body = await request.json();
//   const {
//     companyId,
//     title,
//     summary,
//     content,
//     publishedAt,
//     expiresAt,
//     authorId,
//     status,
//     type,
//     audience,
//     targetAcademicLevelIds = [],
//     targetCourseIds = [],
//     targetEducatorIds = [],
//     targetStudentIds = [],
//     targetDepartmentIds = [],
//     targetParentIds = [],
//   } = body;

//   if (!companyId || !title || !publishedAt || !authorId || !status || !type || !audience) {
//     return formatResponse(
//       false,
//       null,
//       "Company ID, Title, Published At, Author ID, Status, Type, and Audience are required",
//       400
//     );
//   }

//   if (!VALID_ANNOUNCEMENT_STATUSES.includes(status)) {
//     return formatResponse(false, null, `Invalid status: ${status}`, 400);
//   }
//   if (!VALID_ANNOUNCEMENT_TYPES.includes(type)) {
//     return formatResponse(false, null, `Invalid type: ${type}`, 400);
//   }
//   if (!VALID_ANNOUNCEMENT_AUDIENCES.includes(audience)) {
//     return formatResponse(false, null, `Invalid audience: ${audience}`, 400);
//   }

//   const existingAuthor = await prisma.user.findUnique({ where: { id: authorId } });
//   if (!existingAuthor) {
//     return formatResponse(false, null, "Invalid authorId", 400);
//   }

//   const existingCompany = await prisma.company.findUnique({ where: { id: companyId } });
//   if (!existingCompany) {
//     return formatResponse(false, null, "Invalid companyId", 400);
//   }

//   const parsedPublishedAt = new Date(publishedAt);
//   if (isNaN(parsedPublishedAt.getTime())) {
//     return formatResponse(false, null, "Invalid publishedAt date", 400);
//   }

//   let parsedExpiresAt: Date | undefined;
//   if (expiresAt) {
//     parsedExpiresAt = new Date(expiresAt);
//     if (isNaN(parsedExpiresAt.getTime())) {
//       return formatResponse(false, null, "Invalid expiresAt date", 400);
//     }
//     if (parsedExpiresAt <= parsedPublishedAt) {
//       return formatResponse(false, null, "Expiry must be after publish date", 400);
//     }
//   }

//   const newAnnouncement = await prisma.announcement.create({
//     data: {
//       companyId,
//       title,
//       summary,
//       content,
//       publishedAt: parsedPublishedAt,
//       expiresAt: parsedExpiresAt,
//       authorId,
//       status,
//       type,
//       audience,
//       targetAcademicLevelIds: Array.isArray(targetAcademicLevelIds) ? targetAcademicLevelIds : [],
//       targetCourseIds: Array.isArray(targetCourseIds) ? targetCourseIds : [],
//       targetEducatorIds: Array.isArray(targetEducatorIds) ? targetEducatorIds : [],
//       targetStudentIds: Array.isArray(targetStudentIds) ? targetStudentIds : [],
//       targetDepartmentIds: Array.isArray(targetDepartmentIds) ? targetDepartmentIds : [],
//       targetParentIds: Array.isArray(targetParentIds) ? targetParentIds : [],
//     },
//     include: {
//       author: { select: { id: true, name: true, email: true } },
//       company: { select: { id: true, name: true } },
//     },
//   });

//   const responseData = {
//     id: newAnnouncement.id,
//     title: newAnnouncement.title,
//     summary: newAnnouncement.summary,
//     content: newAnnouncement.content,
//     publishedAt: newAnnouncement.publishedAt.toISOString(),
//     expiresAt: newAnnouncement.expiresAt?.toISOString() || null,
//     authorId: newAnnouncement.authorId,
//     authorName: newAnnouncement.author?.name || "N/A",
//     authorEmail: newAnnouncement.author?.email || "N/A",
//     companyId: newAnnouncement.companyId,
//     companyName: newAnnouncement.company?.name || "N/A",
//     status: newAnnouncement.status,
//     type: newAnnouncement.type,
//     audience: newAnnouncement.audience,
//     targetAcademicLevelIds: newAnnouncement.targetAcademicLevelIds,
//     targetCourseIds: newAnnouncement.targetCourseIds,
//     targetEducatorIds: newAnnouncement.targetEducatorIds,
//     targetStudentIds: newAnnouncement.targetStudentIds,
//     targetDepartmentIds: newAnnouncement.targetDepartmentIds,
//     targetParentIds: newAnnouncement.targetParentIds,
//     createdAt: newAnnouncement.createdAt?.toISOString(),
//     updatedAt: newAnnouncement.updatedAt?.toISOString(),
//   };

//   return formatResponse(true, responseData, "Announcement created", 201);
// });
