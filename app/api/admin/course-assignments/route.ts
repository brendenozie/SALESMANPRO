// app/api/course-assignments/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// ---------------- GET ----------------
// /api/course-assignments
const getHandler = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const companyId = searchParams.get("companyId");

  const whereClause: any = {};

  if (courseId) {
    whereClause.courseId = courseId;
  } else if (companyId) {
    // get courses belonging to company
    const coursesInCompany = await prisma.course.findMany({
      where: { companyId },
      select: { id: true },
    });
    const courseIdsInCompany = coursesInCompany.map((c) => c.id);
    whereClause.courseId = { in: courseIdsInCompany };
  } else {
    return formatResponse(false, null, "Either courseId or companyId is required.", 400);
  }

  const assignments = await prisma.courseAssignment.findMany({
    where: whereClause,
    include: {
      course: {
        select: {
          id: true,
          title: true,
          instructor: { select: { user: { select: { name: true } } } },
          academicLevels: {
            include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } },
          },
        },
      },
      _count: { select: { submissions: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const response = assignments.map((assignment) => ({
    id: assignment.id,
    courseId: assignment.courseId,
    courseTitle: assignment.course?.title || "N/A",
    courseInstructorName: assignment.course?.instructor?.user?.name || "N/A",
    courseAcademicLevels:
      assignment.course?.academicLevels
        .map((al) => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map((level) => ({ id: level!.id, name: level!.name })) || [],
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate,
    maxGrade: assignment.maxGrade,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
    totalSubmissions: assignment._count.submissions,
  }));

  return formatResponse(true, response, null, 200);
};
export const GET = withApiHandler(getHandler);

// ---------------- POST ----------------
// /api/course-assignments
const postHandler = async (req: Request) => {
  const body = await req.json();
  const { courseId, title, description, dueDate, maxGrade } = body;

  if (!courseId || !title || !dueDate) {
    return formatResponse(false, null, "Course ID, Title, and Due Date are required.", 400);
  }

  // validate course exists
  const existingCourse = await prisma.course.findUnique({ where: { id: courseId } });
  if (!existingCourse) {
    return formatResponse(false, null, "Provided courseId does not exist.", 400);
  }

  const newAssignment = await prisma.courseAssignment.create({
    data: {
      courseId,
      title,
      description,
      dueDate: new Date(dueDate),
      maxGrade,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          instructor: { select: { user: { select: { name: true } } } },
          academicLevels: {
            include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } },
          },
        },
      },
      _count: { select: { submissions: true } },
    },
  });

  const responseData = {
    id: newAssignment.id,
    courseId: newAssignment.courseId,
    courseTitle: newAssignment.course?.title || "N/A",
    courseInstructorName: newAssignment.course?.instructor?.user?.name || "N/A",
    courseAcademicLevels:
      newAssignment.course?.academicLevels
        .map((al) => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map((level) => ({ id: level!.id, name: level!.name })) || [],
    title: newAssignment.title,
    description: newAssignment.description,
    dueDate: newAssignment.dueDate,
    maxGrade: newAssignment.maxGrade,
    createdAt: newAssignment.createdAt,
    updatedAt: newAssignment.updatedAt,
    totalSubmissions: newAssignment._count.submissions,
  };

  return formatResponse(true, responseData, null, 201);
};
export const POST = withApiHandler(postHandler);
