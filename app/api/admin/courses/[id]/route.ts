import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- Types ---
type HandlerContext = { params: { id: string }; user?: any };

// --- GET /api/courses/[id] ---
export const GET = withApiHandler(async (request: Request, context: HandlerContext) => {
  const { id } = context.params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      CourseEducatorAssignment: {
        include: {
          educator: { select: { id: true, user: { select: { name: true, email: true } } } },
        },
      },
      department: { select: { id: true, name: true } },
      academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
      _count: { select: { enrollments: true, CourseMaterial: true, assignmentSubmission: true } },
    },
  });

  if (!course) throw new Error("Course not found");

  const academicLevels = course.academicLevels
    .map((a) => a.academicLevel)
    .filter(Boolean)
    .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
    .map((lvl) => ({ id: lvl!.id, name: lvl!.name }));

  const educators = course.CourseEducatorAssignment.map((assignment) => ({
    id: assignment.educator.id,
    name: assignment.educator.user?.name || "N/A",
    email: assignment.educator.user?.email || "N/A",
    roleInCourse: assignment.roleInCourse || null,
  }));

    return NextResponse.json(
                              {
                                id: course.id,
                                title: course.title,
                                description: course.description,
                                imageUrl: course.imageUrl,
                                credits: course.credits,
                                code: course.code,
                                rating: course.rating,
                                totalLessons: course._count.CourseMaterial,
                                studentsEnrolled: course._count.enrollments,
                                companyId: course.companyId,
                                departmentId: course.departmentId,
                                departmentName: course.department?.name || "N/A",
                                academicLevels,
                                educators,
                                createdAt: course.createdAt,
                                updatedAt: course.updatedAt,
                              },
                              { status: 200 });
  
});

// --- PATCH /api/courses/[id] ---
import { NextResponse } from "next/server";

export const PATCH = withApiHandler(async (request: Request, context: HandlerContext) => {
  const { id } = context.params;
  const body = await request.json();
  const { title, description, imageUrl, code, credits, departmentId, rating, academicLevelIds, educatorIds, ...rest } =
    body;

  if (Object.keys(rest).length > 0) {
    console.warn("Unexpected fields in PATCH request for course:", rest);
  }

  const existingCourse = await prisma.course.findUnique({ where: { id } });
  if (!existingCourse) throw new Error("Course not found");

  // Ensure course code is unique if updated
  if (code && code !== existingCourse.code) {
    const duplicate = await prisma.course.findUnique({ where: { code } });
    if (duplicate) throw new Error(`A course with the code '${code}' already exists.`);
  }

  // Ensure department exists if provided
  if (departmentId && departmentId !== existingCourse.departmentId) {
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) throw new Error("Provided departmentId does not exist.");
  }

  // Transaction for updating course + assignments
  await prisma.$transaction(async (tx) => {
    if (academicLevelIds) {
      const validLevels = await tx.academicLevel.findMany({
        where: { id: { in: academicLevelIds }, companyId: existingCourse.companyId },
        select: { id: true },
      });

      if (validLevels.length !== academicLevelIds.length) {
        const found = new Set(validLevels.map((l) => l.id));
        const missing = academicLevelIds.filter((x: string) => !found.has(x));
        throw new Error(`Invalid academicLevelIds: ${missing.join(", ")}`);
      }

      await tx.courseAcademicLevel.deleteMany({ where: { courseId: id } });
      if (academicLevelIds.length > 0) {
        await tx.courseAcademicLevel.createMany({
          data: academicLevelIds.map((levelId: string) => ({ courseId: id, academicLevelId: levelId })),
        });
      }
    }

    if (educatorIds) {
      const validEducators = await tx.educator.findMany({
        where: { id: { in: educatorIds } },
        select: { id: true },
      });

      if (validEducators.length !== educatorIds.length) {
        const found = new Set(validEducators.map((e) => e.id));
        const missing = educatorIds.filter((x: string) => !found.has(x));
        throw new Error(`Invalid educatorIds: ${missing.join(", ")}`);
      }

      await tx.courseEducatorAssignment.deleteMany({ where: { courseId: id } });
      if (educatorIds.length > 0) {
        await tx.courseEducatorAssignment.createMany({
          data: educatorIds.map((educatorId: string) => ({ courseId: id, educatorId })),
        });
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (code !== undefined) updateData.code = code;
    if (credits !== undefined) updateData.credits = credits;
    if (departmentId !== undefined) updateData.departmentId = departmentId;
    if (rating !== undefined) updateData.rating = rating;

    await tx.course.update({ where: { id }, data: updateData });
  });

  // Return updated course with relations
  const finalCourse = await prisma.course.findUniqueOrThrow({
    where: { id },
    include: {
      CourseEducatorAssignment: {
        include: { educator: { select: { id: true, user: { select: { name: true, email: true } } } } },
      },
      department: { select: { id: true, name: true } },
      academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
      _count: { select: { enrollments: true, CourseMaterial: true, assignmentSubmission: true } },
    },
  });

  const academicLevels = finalCourse.academicLevels
    .map((a) => a.academicLevel)
    .filter(Boolean)
    .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
    .map((lvl) => ({ id: lvl!.id, name: lvl!.name }));

  const educators = finalCourse.CourseEducatorAssignment.map((a) => ({
    id: a.educator.id,
    name: a.educator.user?.name || "N/A",
    email: a.educator.user?.email || "N/A",
    roleInCourse: a.roleInCourse || null,
  }));

  const responseData = {
    id: finalCourse.id,
    title: finalCourse.title,
    description: finalCourse.description,
    imageUrl: finalCourse.imageUrl,
    credits: finalCourse.credits,
    code: finalCourse.code,
    rating: finalCourse.rating,
    totalLessons: finalCourse._count.CourseMaterial,
    studentsEnrolled: finalCourse._count.enrollments,
    companyId: finalCourse.companyId,
    departmentId: finalCourse.departmentId,
    departmentName: finalCourse.department?.name || "N/A",
    academicLevels,
    educators,
    createdAt: finalCourse.createdAt,
    updatedAt: finalCourse.updatedAt,
  };

  return NextResponse.json(responseData, { status: 200 });
});

// --- DELETE /api/courses/[id] ---
export const DELETE = withApiHandler(async (_: Request, context: HandlerContext) => {
  const { id } = context.params;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw new Error("Course not found");

  const deleted = await prisma.course.delete({ where: { id } });
  
  return NextResponse.json({ message: "Course deleted successfully", deletedId: deleted.id }, { status: 200 });
  
});
