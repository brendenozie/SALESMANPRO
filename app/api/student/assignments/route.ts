import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheSet, cacheGet, cacheDel } from "@/lib/cache";

// ✅ GET student assignments based on Classroom & Academic Level
const getAssignments = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("studentId"); // Passed as userId from frontend
  const courseId = searchParams.get("courseId");

  if (!userId) {
    return formatResponse(false, null, "Missing studentId", 400);
  }

  const cacheKey = `student:${userId}:assignments`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Assignments retrieved from cache", 200);
  } catch (e) {
    console.error("Failed to retrieve assignments from cache:", e);
  }

  try {
    // 1. Fetch Student and their current Classroom/Grade anchor
    const student = await prisma.student.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        companyId: true,
        user: { select: { name: true, email: true } },
        StudentAcademicLevel: {
          orderBy: { assignedAt: "desc" },
          take: 1,
          select: {
            academicLevelId: true,
            classRoomId: true,
            academicLevel: { select: { name: true } },
          },
        },
      },
    });

    const activeLevel = student?.StudentAcademicLevel[0];

    if (!student || !activeLevel || !student.companyId) {
      return formatResponse(false, null, "Student or Classroom assignment not found", 404);
    }

    const { academicLevelId, classRoomId } = activeLevel;

    // 2. Fetch Courses linked to this Student's Grade
    const courses = await prisma.course.findMany({
      where: {
        companyId: student.companyId,
        academicLevels: { some: { academicLevelId } },
        ...(courseId && { id: courseId }),
      },
      select: {
        id: true,
        title: true,
        CourseEducatorAssignment: {
          where: { classRoomId: classRoomId },
          select: { educator: { select: { user: { select: { name: true } } } } },
          take: 1,
        },
        // 3. Fetch assignments filtered by Classroom
        assignments: {
          where: {
            // status: "Published",
            OR: [
              { classroomId: classRoomId }, // Room-specific homework
              { classroomId: null },        // General course-wide assignments
              { status: "Upcoming" },      // New filter for upcoming assignments
              { status: "Published" },     // Include published assignments regardless of room
            ],
          },
          include: {
            submissions: {
              where: { studentId: student.id },
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
          orderBy: { startTime: "asc" },
        },
      },
    });

    const now = new Date();

    // 4. Flatten assignments for the frontend
    const assignments = courses.flatMap((course) => {
      const teacherName = course.CourseEducatorAssignment[0]?.educator?.user?.name || "TBA";

      return course.assignments.map((assignment) => {
        const submission = assignment.submissions[0] || null;
        let status = "Not Submitted";

        if (submission) {
          if (submission.grade !== null) status = "Graded";
          else if (submission.submittedAt !== null) status = "Submitted";
        }

        if (status === "Not Submitted" && new Date(assignment.endTime || assignment.dueDate) < now) {
          status = "Overdue";
        }

        return {
          id: assignment.id,
          name: assignment.title,
          classId: course.id,
          className: course.title,
          teacher: teacherName,
          dueDate: assignment.endTime?.toISOString() || assignment.dueDate?.toISOString() || null,
          startTime: assignment.startTime?.toISOString(),
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

    try {
      await cacheSet(cacheKey, {
      studentName: student.user.name || student.user.email,
      studentGradeLevel: activeLevel.academicLevel.name,
      assignments,
    }, 300); // Cache for 5 minutes
    } catch (e) {
      console.error("Failed to cache assignments data:", e);
    }

    return formatResponse(true, {
      studentName: student.user.name || student.user.email,
      studentGradeLevel: activeLevel.academicLevel.name,
      assignments,
    });
  } catch (error) {
    console.error("GET Assignments Error:", error);
    return formatResponse(false, null, "Internal Server Error", 500);
  }
};

// ✅ POST student submission
const submitAssignment = async (req: Request) => {
  const { studentId, assignmentId, submissionUrl, submissionContent, companyId } = await req.json();

  if (!studentId || !assignmentId || !companyId) {
    return formatResponse(false, null, "Missing required data", 400);
  }

  try {
    const assignment = await prisma.courseAssignment.findUnique({
      where: { id: assignmentId },
      select: { courseId: true },
    });

    if (!assignment) {
      return formatResponse(false, null, "Assignment not found", 404);
    }

    // Upsert submission
    const now = new Date();
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
      update: {
        submissionUrl,
        submissionContent,
        submittedAt: now,
        updatedAt: now,
      },
      create: {
        studentId,
        assignmentId,
        courseId: assignment.courseId,
        submissionUrl,
        submissionContent,
        submittedAt: now,
        companyId,
      },
    });

    //clear cache for this student's assignments to reflect the new submission status on next GET
    try {
      await cacheDel(`student:${studentId}:assignments`);
    }                                                     catch (e) {
      console.error("Failed to invalidate assignments cache after submission:", e);
    }
    return formatResponse(true, { message: "Assignment submitted successfully", submission });
  } catch (error) {
    console.error("POST Submission Error:", error);
    return formatResponse(false, null, "Failed to submit assignment", 500);
  }
};

export const GET = withApiHandler(getAssignments);
export const POST = withApiHandler(submitAssignment);