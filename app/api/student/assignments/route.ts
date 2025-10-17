// app/api/student/assignments/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// ✅ GET student assignments
const getAssignments = async (req: Request) => {

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const courseId = searchParams.get("courseId");

  if (!studentId) {
    return formatResponse(false, null, "Missing studentId", 400);
  } 

  const student = await prisma.student.findUnique({
    where: { userId: studentId },
    select: {
      id: true,
      companyId: true,
      user: { select: { name: true, email: true } },
      StudentAcademicLevel: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { academicLevel: { select: { name: true } } },
      },
    },
  });

  if (!student || !student.user) {
    return formatResponse(false, null, "Student not found", 404);
  }

  const enrolledCourses = await prisma.courseEnrollment.findMany({
    where: {
      studentId,
      companyId: student.companyId,
      status: "ENROLLED",
      ...(courseId && { courseId }),
    },
    select: {
      course: {
        select: {
          id: true,
          title: true,
          CourseEducatorAssignment: {
            select: { educator: { select: { user: { select: { name: true } } } } },
          },
          assignments: {
            where: { status: "Published" },
            select: {
              id: true,
              title: true,
              description: true,
              dueDate: true,
              type: true,
              maxGrade: true,
              submissions: {
                where: { studentId },
                select: {
                  id: true,
                  submissionUrl: true,
                  submissionContent: true,
                  grade: true,
                  comments: true,
                  submittedAt: true,
                },
              },
            },
            orderBy: { dueDate: "asc" },
          },
        },
      },
    },
  });

  const now = new Date();
  const assignments = enrolledCourses.flatMap((enrollment) => {
    const course = enrollment.course;
    if (!course) return [];

    const teacherName =
      course.CourseEducatorAssignment[0]?.educator?.user?.name || "N/A";

    return course.assignments.map((assignment) => {
      const submission = assignment.submissions[0] || null;
      let status = "Not Submitted";

      if (submission) {
        if (submission.grade !== null) status = "Graded";
        else if (submission.submittedAt !== null) status = "Submitted";
      }

      if (
        status === "Not Submitted" &&
        assignment.dueDate < now
      ) {
        status = "Overdue";
      }

      return {
        id: assignment.id,
        name: assignment.title,
        classId: course.id,
        className: course.title,
        teacher: teacherName,
        dueDate: assignment.dueDate.toISOString(),
        status,
        type: assignment.type,
        totalPoints: assignment.maxGrade,
        grade: submission?.grade ?? null,
        feedback: submission?.comments ?? null,
        submissionUrl: submission?.submissionUrl ?? null,
        submissionContent: submission?.submissionContent ?? null,
        description: assignment.description,
        submittedAt: submission?.submittedAt?.toISOString() ?? null,
      };
    });
  });

  return formatResponse(true, {
    studentName: student.user.name || student.user.email,
    studentGradeLevel: student.StudentAcademicLevel[0]?.academicLevel?.name ?? "N/A",
    assignments,
  });
};

// ✅ POST student submission
const submitAssignment = async (req: Request) => {

  const { studentId, assignmentId, submissionUrl, submissionContent, companyId } =
    await req.json();

  if (!studentId || !assignmentId || !companyId || (!submissionUrl && !submissionContent)) {
    return formatResponse(false, null, "Missing required data", 400);
  }

  const assignment = await prisma.courseAssignment.findUnique({
    where: { id: assignmentId, companyId },
    select: { courseId: true, dueDate: true },
  });

  if (!assignment) {
    return formatResponse(false, null, "Assignment not found", 404);
  }

  const enrollment = await prisma.courseEnrollment.findFirst({
    where: {
      studentId,
      courseId: assignment.courseId,
      companyId,
      status: "ENROLLED",
    },
  });

  if (!enrollment) {
    return formatResponse(
      false,
      null,
      "Student not enrolled in this course or unauthorized",
      403
    );
  }

  const existing = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId } },
  });

  const now = new Date();
  let submission;

  if (existing) {
    submission = await prisma.assignmentSubmission.update({
      where: { id: existing.id },
      data: {
        submissionUrl,
        submissionContent,
        submittedAt: now,
        updatedAt: now,
      },
    });
  } else {
    submission = await prisma.assignmentSubmission.create({
      data: {
        studentId,
        assignmentId,
        courseId: assignment.courseId,
        submissionUrl,
        submissionContent,
        submittedAt: now,
        companyId,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  return formatResponse(true, { message: "Assignment submitted", submission });
};

export const GET = withApiHandler(getAssignments);
export const POST = withApiHandler(submitAssignment);
