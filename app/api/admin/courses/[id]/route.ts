import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { Prisma } from "@prisma/client";

type HandlerContext = { params: { id: string }; user?: any };

// Unified Selector to ensure consistent, lean data fetching
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
    select: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } 
  },
  CourseEducatorAssignment: {
    select: {
      roleInCourse: true,
      educator: { select: { id: true, user: { select: { name: true, email: true } } } },
    },
  },
  _count: { select: { enrollments: true, CourseMaterial: true } },
};

// Unified Data Mapper
const mapCourseResponse = (course: any) => ({
  ...course,
  departmentName: course.department?.name || "N/A",
  totalLessons: course._count.CourseMaterial,
  studentsEnrolled: course._count.enrollments,
  academicLevels: course.academicLevels
    .map((al: any) => al.academicLevel)
    .filter(Boolean)
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((lvl: any) => ({ id: lvl.id, name: lvl.name })),
  educators: course.CourseEducatorAssignment.map((a: any) => ({
    id: a.educator.id,
    name: a.educator.user?.name || "N/A",
    email: a.educator.user?.email || "N/A",
    roleInCourse: a.roleInCourse,
  })),
  department: undefined, // Cleanup
  CourseEducatorAssignment: undefined,
  _count: undefined,
});


export const GET = withApiHandler(async (_req, { params }) => {
  
    const cacheKey = `admin:courses:${'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    select: COURSE_SELECT,
  });

  try {
    if (course) {
      await cacheSet(cacheKey, course, 60);
    }
  } catch (e) {}

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  return NextResponse.json(mapCourseResponse(course), { status: 200 });
});


export const PATCH = withApiHandler(async (req, { params }) => {
  const { id } = params;
  const body = await req.json();
  const { academicLevelIds, educatorIds, ...data } = body;

  try {
    const updatedCourse = await prisma.$transaction(async (tx) => {
      // 1. Handle Many-to-Many Syncing (Atomic Delete/Create)
      if (academicLevelIds) {
        await tx.courseAcademicLevel.deleteMany({ where: { courseId: id } });
        await tx.courseAcademicLevel.createMany({
          data: academicLevelIds.map((levelId: string) => ({ courseId: id, academicLevelId: levelId })),
        });
      }

      if (educatorIds) {
        await tx.courseEducatorAssignment.deleteMany({ where: { courseId: id } });
        await tx.courseEducatorAssignment.createMany({
          data: educatorIds.map((educatorId: string) => ({ courseId: id, educatorId })),
        });
      }

      // 2. Update Main Course Data & Return Final Shape in one go
      return await tx.course.update({
        where: { id },
        data,
        select: COURSE_SELECT,
      });
    });

    return NextResponse.json(mapCourseResponse(updatedCourse), { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return NextResponse.json({ error: "Course code must be unique" }, { status: 400 });
      if (error.code === 'P2025') return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    throw error;
  }
});


export const DELETE = withApiHandler(async (_, { params }) => {
  try {
    await prisma.course.delete({ where: { id: params.id } });
    
    try { await cacheDel(`admin:courses:${'global' || 'global'}:*`); } catch (e) {}
    return NextResponse.json({ message: "Course deleted", deletedId: params.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Course not found or has active dependencies" }, { status: 404 });
  }
});


//   if (!course) throw new Error("Course not found");

//   const academicLevels = course.academicLevels
//     .map((a) => a.academicLevel)
//     .filter(Boolean)
//     .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
//     .map((lvl) => ({ id: lvl!.id, name: lvl!.name }));

//   const educators = course.CourseEducatorAssignment.map((assignment) => ({
//     id: assignment.educator.id,
//     name: assignment.educator.user?.name || "N/A",
//     email: assignment.educator.user?.email || "N/A",
//     roleInCourse: assignment.roleInCourse || null,
//   }));

//     return NextResponse.json(
//                               {
//                                 id: course.id,
//                                 title: course.title,
//                                 description: course.description,
//                                 imageUrl: course.imageUrl,
//                                 credits: course.credits,
//                                 code: course.code,
//                                 rating: course.rating,
//                                 totalLessons: course._count.CourseMaterial,
//                                 studentsEnrolled: course._count.enrollments,
//                                 companyId: course.companyId,
//                                 departmentId: course.departmentId,
//                                 departmentName: course.department?.name || "N/A",
//                                 academicLevels,
//                                 educators,
//                                 createdAt: course.createdAt,
//                                 updatedAt: course.updatedAt,
//                               },
//                               { status: 200 });
  
// });

// // --- PATCH /api/courses/[id] ---
// import { NextResponse } from "next/server";

// export const PATCH = withApiHandler(async (request: Request, context: HandlerContext) => {
//   const { id } = context.params;
//   const body = await request.json();
//   const { title, description, imageUrl, code, credits, departmentId, rating, academicLevelIds, educatorIds, ...rest } =
//     body;

//   if (Object.keys(rest).length > 0) {
//     console.warn("Unexpected fields in PATCH request for course:", rest);
//   }

//   const existingCourse = await prisma.course.findUnique({ where: { id } });
//   if (!existingCourse) throw new Error("Course not found");

//   // Ensure course code is unique if updated
//   if (code && code !== existingCourse.code) {
//     const duplicate = await prisma.course.findUnique({ where: { code } });
//     if (duplicate) throw new Error(`A course with the code '${code}' already exists.`);
//   }

//   // Ensure department exists if provided
//   if (departmentId && departmentId !== existingCourse.departmentId) {
//     const department = await prisma.department.findUnique({ where: { id: departmentId } });
//     if (!department) throw new Error("Provided departmentId does not exist.");
//   }

//   // Transaction for updating course + assignments
//   await prisma.$transaction(async (tx) => {
//     if (academicLevelIds) {
//       const validLevels = await tx.academicLevel.findMany({
//         where: { id: { in: academicLevelIds }, companyId: existingCourse.companyId },
//         select: { id: true },
//       });

//       if (validLevels.length !== academicLevelIds.length) {
//         const found = new Set(validLevels.map((l) => l.id));
//         const missing = academicLevelIds.filter((x: string) => !found.has(x));
//         throw new Error(`Invalid academicLevelIds: ${missing.join(", ")}`);
//       }

//       await tx.courseAcademicLevel.deleteMany({ where: { courseId: id } });
//       if (academicLevelIds.length > 0) {
//         await tx.courseAcademicLevel.createMany({
//           data: academicLevelIds.map((levelId: string) => ({ courseId: id, academicLevelId: levelId })),
//         });
//       }
//     }

//     if (educatorIds) {
//       const validEducators = await tx.educator.findMany({
//         where: { id: { in: educatorIds } },
//         select: { id: true },
//       });

//       if (validEducators.length !== educatorIds.length) {
//         const found = new Set(validEducators.map((e) => e.id));
//         const missing = educatorIds.filter((x: string) => !found.has(x));
//         throw new Error(`Invalid educatorIds: ${missing.join(", ")}`);
//       }

//       await tx.courseEducatorAssignment.deleteMany({ where: { courseId: id } });
//       if (educatorIds.length > 0) {
//         await tx.courseEducatorAssignment.createMany({
//           data: educatorIds.map((educatorId: string) => ({ courseId: id, educatorId })),
//         });
//       }
//     }

//     const updateData: any = {};
//     if (title !== undefined) updateData.title = title;
//     if (description !== undefined) updateData.description = description;
//     if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
//     if (code !== undefined) updateData.code = code;
//     if (credits !== undefined) updateData.credits = credits;
//     if (departmentId !== undefined) updateData.departmentId = departmentId;
//     if (rating !== undefined) updateData.rating = rating;

//     await tx.course.update({ where: { id }, data: updateData });
//   });

//   // Return updated course with relations
//   const finalCourse = await prisma.course.findUniqueOrThrow({
//     where: { id },
//     include: {
//       CourseEducatorAssignment: {
//         include: { educator: { select: { id: true, user: { select: { name: true, email: true } } } } },
//       },
//       department: { select: { id: true, name: true } },
//       academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
//       _count: { select: { enrollments: true, CourseMaterial: true, assignmentSubmission: true } },
//     },
//   });

//   const academicLevels = finalCourse.academicLevels
//     .map((a) => a.academicLevel)
//     .filter(Boolean)
//     .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
//     .map((lvl) => ({ id: lvl!.id, name: lvl!.name }));

//   const educators = finalCourse.CourseEducatorAssignment.map((a) => ({
//     id: a.educator.id,
//     name: a.educator.user?.name || "N/A",
//     email: a.educator.user?.email || "N/A",
//     roleInCourse: a.roleInCourse || null,
//   }));

//   const responseData = {
//     id: finalCourse.id,
//     title: finalCourse.title,
//     description: finalCourse.description,
//     imageUrl: finalCourse.imageUrl,
//     credits: finalCourse.credits,
//     code: finalCourse.code,
//     rating: finalCourse.rating,
//     totalLessons: finalCourse._count.CourseMaterial,
//     studentsEnrolled: finalCourse._count.enrollments,
//     companyId: finalCourse.companyId,
//     departmentId: finalCourse.departmentId,
//     departmentName: finalCourse.department?.name || "N/A",
//     academicLevels,
//     educators,
//     createdAt: finalCourse.createdAt,
//     updatedAt: finalCourse.updatedAt,
//   };

//   return NextResponse.json(responseData, { status: 200 });
// });

// // --- DELETE /api/courses/[id] ---
// export const DELETE = withApiHandler(async (_: Request, context: HandlerContext) => {
//   const { id } = context.params;

//   const course = await prisma.course.findUnique({ where: { id } });
//   if (!course) throw new Error("Course not found");

//   const deleted = await prisma.course.delete({ where: { id } });
  
//   return NextResponse.json({ message: "Course deleted successfully", deletedId: deleted.id }, { status: 200 });
  
// });
