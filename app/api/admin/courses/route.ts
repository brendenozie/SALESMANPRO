import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/courses/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";

// --- Shared Constants for Consistency ---

const COURSE_SELECT = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  credits: true,
  code: true,
  rating: true,
  companyId: true,
  departmentId: true,
  createdAt: true,
  updatedAt: true,
  department: { select: { name: true } },
  academicLevels: {
    select: { academicLevel: { select: { id: true, name: true, sortOrder: true } } },
  },
  CourseEducatorAssignment: {
    select: {
      roleInCourse: true,
      educator: {
        select: {
          id: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  },
  _count: { select: { enrollments: true, CourseMaterial: true } },
};

const mapCourse = (course: any) => ({
  ...course,
  departmentName: course.department?.name || "N/A",
  totalLessons: course._count?.CourseMaterial || 0,
  studentsEnrolled: course._count?.enrollments || 0,
  academicLevels: (course.academicLevels || [])
    .map((al: any) => al.academicLevel)
    .filter(Boolean)
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((lvl: any) => ({ id: lvl.id, name: lvl.name })),
  educators: (course.CourseEducatorAssignment || []).map((a: any) => ({
    id: a.educator.id,
    name: a.educator.user?.name || "N/A",
    email: a.educator.user?.email || "N/A",
    roleInCourse: a.roleInCourse,
  })),
  // Clean up nested objects
  department: undefined,
  CourseEducatorAssignment: undefined,
  _count: undefined,
});


export const GET = withApiHandler(async (request: Request) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID is required.", 400);

  
    const cacheKey = `admin:courses:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const courses = await prisma.course.findMany({
    where: { companyId },
    select: COURSE_SELECT,
    orderBy: { title: "asc" },
  });

  try {
    if (courses) {
      await cacheSet(cacheKey, courses, 60);
    }
  } catch (e) {}

  return formatResponse(true, courses.map(mapCourse), null, 200);
});


export const POST = withApiHandler(async (request: Request) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const body = await request.json();
  const { title, description, imageUrl, code, credits, rating, departmentId, companyId, academicLevelIds, educatorIds } = body;

  if (!title || !companyId || !code) {
    return formatResponse(false, null, "Title, Company ID, and Code are required.", 400);
  }

  try {
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl,
        code,
        credits,
        rating,
        companyId,
        departmentId,
        // Atomic relationship creation
        academicLevels: academicLevelIds ? {
          create: academicLevelIds.map((id: string) => ({ academicLevelId: id }))
        } : undefined,
        CourseEducatorAssignment: educatorIds ? {
          create: educatorIds.map((id: string) => ({ educatorId: id }))
        } : undefined,
      },
      select: COURSE_SELECT,
    });

    
    try { await cacheDel(`admin:courses:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, mapCourse(newCourse), "Course created successfully", 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: Unique constraint (usually 'code')
      if (error.code === 'P2002') return formatResponse(false, null, "Course code already exists.", 400);
      // P2025: Relation not found (invalid department/educator/level ID)
      if (error.code === 'P2025' || error.code === 'P2003') {
        return formatResponse(false, null, "One or more related IDs (Department, Educator, Level) are invalid.", 409);
      }
    }
    throw error;
  }
});


//   const response = courses.map((course) => {
//     const totalLessons = course._count.CourseMaterial;
//     const studentsEnrolled = course._count.enrollments;

//     const academicLevels = course.academicLevels
//       .map((assignment) => assignment.academicLevel)
//       .filter(Boolean)
//       .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
//       .map((level) => ({ id: level!.id, name: level!.name }));

//     const educators = course.CourseEducatorAssignment.map((assignment) => ({
//       id: assignment.educator.id,
//       name: assignment.educator.user?.name || "N/A",
//       email: assignment.educator.user?.email || "N/A",
//       roleInCourse: assignment.roleInCourse || null,
//     }));

//     return {
//       id: course.id,
//       title: course.title,
//       description: course.description,
//       imageUrl: course.imageUrl,
//       credits: course.credits,
//       code: course.code,
//       rating: course.rating,
//       totalLessons,
//       studentsEnrolled,
//       companyId: course.companyId,
//       departmentId: course.departmentId,
//       departmentName: course.department?.name || "N/A",
//       academicLevels,
//       educators,
//       createdAt: course.createdAt,
//       updatedAt: course.updatedAt,
//     };
//   });

//   return formatResponse(true, response, null, 200);
// });

// 
// export const POST = withApiHandler(async (request: Request) => {
//   const auth = await verifyAuth(request);
//   if (!auth.success) throw new Error(auth.error);

//   const body = await request.json();
//   const {
//     title,
//     description,
//     imageUrl,
//     code,
//     credits,
//     rating,
//     departmentId,
//     companyId,
//     academicLevelIds,
//     educatorIds,
//   } = body;

//   if (!title || !companyId || !code) {
//     return formatResponse(false, null, "Title, Company ID, and Code are required to create a course.", 400 );
//   }

//   const existingCourse = await prisma.course.findUnique({ where: { code } });
//   if (existingCourse) {
//     return formatResponse(false, null, "A course with the code '${code}' already exists.", 400 );
//   }

//   if (departmentId) {
//     const dept = await prisma.department.findUnique({ where: { id: departmentId } });
//     if (!dept) {
//       return formatResponse(false, null, "Provided departmentId does not exist.", 409 );
        
//     }
//   }

//   if (academicLevelIds?.length) {
//     const academicLevels = await prisma.academicLevel.findMany({
//       where: { id: { in: academicLevelIds }, companyId },
//       select: { id: true },
//     });
//     if (academicLevels.length !== academicLevelIds.length) {
//       const foundIds = new Set(academicLevels.map((al) => al.id));
//       const notFoundIds = academicLevelIds.filter((id: string) => !foundIds.has(id));
//       return formatResponse(false, null, `Invalid academicLevelIds: ${notFoundIds.join(", ")}`, 409 );
      
//     }
//   }

//   if (educatorIds?.length) {

//     const educators = await prisma.educator.findMany({
//       where: { id: { in: educatorIds } },
//       select: { id: true },
//     });

//     if (educators.length !== educatorIds.length) {
//       const foundIds = new Set(educators.map((e) => e.id));
//       const notFoundIds = educatorIds.filter((id: string) => !foundIds.has(id));

//       return formatResponse(false, null,  `Invalid educatorIds: ${notFoundIds.join(", ")}`, 409 );
      
//     }
//   }

//   const newCourse = await prisma.$transaction(async (tx) => {
//     const course = await tx.course.create({
//       data: {
//         title,
//         description,
//         imageUrl,
//         code,
//         credits,
//         rating,
//         companyId,
//         departmentId,
//       },
//     });

//     if (academicLevelIds?.length) {
//       await tx.courseAcademicLevel.createMany({
//         data: academicLevelIds.map((academicLevelId: string) => ({
//           courseId: course.id,
//           academicLevelId,
//         })),
//       });
//     }

//     if (educatorIds?.length) {
//       await tx.courseEducatorAssignment.createMany({
//         data: educatorIds.map((educatorId: string) => ({
//           courseId: course.id,
//           educatorId,
//         })),
//       });
//     }

//     return course;
//   });

//   const createdCourse = await prisma.course.findUnique({
//     where: { id: newCourse.id },
//     include: {
//       CourseEducatorAssignment: {
//         include: {
//           educator: { select: { id: true, user: { select: { name: true, email: true } } } },
//         },
//       },
//       department: { select: { id: true, name: true } },
//       academicLevels: {
//         include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } },
//       },
//       _count: { select: { enrollments: true, CourseMaterial: true } },
//     },
//   });

//   if (!createdCourse) throw new Error("Failed to retrieve created course");

//   const academicLevels = createdCourse.academicLevels
//     .map((a) => a.academicLevel)
//     .filter(Boolean)
//     .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
//     .map((level) => ({ id: level!.id, name: level!.name }));

//   const educators = createdCourse.CourseEducatorAssignment.map((a) => ({
//     id: a.educator.id,
//     name: a.educator.user?.name || "N/A",
//     email: a.educator.user?.email || "N/A",
//     roleInCourse: a.roleInCourse || null,
//   }));

//   const responseData = {
//     id: createdCourse.id,
//     title: createdCourse.title,
//     description: createdCourse.description,
//     imageUrl: createdCourse.imageUrl,
//     credits: createdCourse.credits,
//     code: createdCourse.code,
//     rating: createdCourse.rating,
//     totalLessons: createdCourse._count.CourseMaterial,
//     studentsEnrolled: createdCourse._count.enrollments,
//     companyId: createdCourse.companyId,
//     departmentId: createdCourse.departmentId,
//     departmentName: createdCourse.department?.name || "N/A",
//     academicLevels,
//     educators,
//     createdAt: createdCourse.createdAt,
//     updatedAt: createdCourse.updatedAt,
//   };

//   return formatResponse(true, responseData, null, 201 );
// });
