// app/api/student/classes/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

import { formatResponse } from "@/lib/formatResponse";

const GET = async (request: Request) => {

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return formatResponse(false, null, "Missing studentId (User ID)", 400);
  }

  try {
    // Fetch student details
    const student = await prisma.student.findUnique({
      where: { userId: studentId },
      select: {
        id: true,
        companyId: true,
        user: { select: { name: true, email: true } },
        StudentAcademicLevel: {
          select: { academicLevel: { select: { name: true } } },
          take: 1,
          orderBy: { assignedAt: "desc" },
        },
      },
    });

    if (!student || !student.user) {
      return formatResponse(false, null, "Student not found or not associated with this company", 404);
    }

    // Fetch course enrollments
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId: student.id,
        status: "ENROLLED",
        companyId: student.companyId,
      },
      select: {
        courseId: true,
        progress: true,
        grade: true,
        course: {
          select: {
            id: true,
            title: true,
            CourseEducatorAssignment: {
              select: { educator: { select: { user: { select: { name: true } } } } },
              take: 1,
              orderBy: { createdAt: "asc" },
            },
            classSchedules: {
              select: {
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                topic: true,
                meetingLink: true,
              },
              orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
            },
            Exam: {
              select: { id: true, title: true, date: true, type: true, totalPoints: true },
              where: { OR: [{ type: "HOMEWORK" }, { type: "PROJECT" }, { type: "QUIZ" }] },
            },
          },
        },
      },
    });

    // Build response data
    const studentEnrolledClasses = enrollments.map((enrollment) => {
      const course = enrollment.course;
      if (!course) return null;

      // Format schedule
      const daysMap: Record<string, string[]> = {};
      course.classSchedules.forEach((cs) => {
        const startTime = new Date(cs.startTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        const endTime = new Date(cs.endTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        daysMap[cs.dayOfWeek] = [...(daysMap[cs.dayOfWeek] || []), `${startTime} - ${endTime}`];
      });

      const sortedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const formattedSchedule = sortedDays
        .filter((day) => daysMap[day])
        .map((day) => `${day.substring(0, 3)}, ${daysMap[day].join(", ")}`)
        .join(" | ");

      // Assignments
      const now = new Date();
      const upcomingAssignments = course.Exam.filter((a) => new Date(a.date) > now).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return {
        id: course.id,
        name: course.title,
        teacher: course.CourseEducatorAssignment[0]?.educator?.user?.name || "N/A",
        schedule: formattedSchedule || "No regular schedule",
        currentGrade: enrollment.grade !== null ? enrollment.grade.toFixed(2) : "N/A",
        progress: enrollment.progress,
        upcomingAssignmentsCount: upcomingAssignments.length,
        nextAssignmentDue:
          upcomingAssignments.length > 0
            ? new Date(upcomingAssignments[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "None",
      };
    }).filter(Boolean);

    return formatResponse(true, {
      studentName: student.user.name || student.user.email,
      studentGradeLevel: student.StudentAcademicLevel[0]?.academicLevel?.name || "N/A",
      enrolledClasses: studentEnrolledClasses,
    });
  } catch (error) {
    console.error("Error fetching student classes:", error);
    return formatResponse(false, null, "Failed to fetch student classes", 500);
  }
};

export const GETHandler = withApiHandler(GET);
export { GETHandler as GET };
