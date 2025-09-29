// app/api/teacher/reports/course/[courseId]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// GET /api/teacher/reports/course/[courseId]
export const GET = withApiHandler(async (request: Request, { params }: { params: { courseId: string } }) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get("educatorId");
  const companyId = searchParams.get("companyId");

  if (!courseId || !educatorId || !companyId) {
    return formatResponse(false, null, "Missing courseId, educatorId, or companyId", 400);
  }

  try {
    // Fetch course details
    const course = await prisma.course.findUnique({
      where: { id: courseId, companyId },
      select: {
        id: true,
        title: true,
        academicLevels: { select: { academicLevel: { select: { id: true, name: true } } } },
        assignments: { select: { id: true, title: true, maxGrade: true } },
        Exam: { select: { id: true, title: true, totalPoints: true, date: true, type: true } },
      },
    });

    if (!course) return formatResponse(false, null, "Course not found or unauthorized", 404);

    const academicLevel = course.academicLevels[0]?.academicLevel || { id: "N/A", name: "No Academic Level" };

    // Fetch enrollments
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId },
      select: {
        studentId: true,
        progress: true,
        grade: true,
        student: {
          select: {
            id: true,
            userId: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    const studentIds = enrollments.map(e => e.studentId);
    const courseExamIds = course.Exam.map(exam => exam.id);

    // Fetch submissions
    const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
      where: { courseId, studentId: { in: studentIds } },
      select: { assignmentId: true, studentId: true, grade: true, submittedAt: true },
    });

    const examSubmissions = await prisma.examSubmission.findMany({
      where: { examId: { in: courseExamIds }, studentId: { in: studentIds } },
      select: { examId: true, studentId: true, score: true, submittedAt: true },
    });

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { courseId, studentId: { in: studentIds } },
      select: { studentId: true, date: true, status: true },
    });

    // Build student reports
    const studentReports = enrollments.map(enrollment => {
      const student = enrollment.student;
      if (!student || !student.user) return null;

      const studentAssignmentSubmissions = assignmentSubmissions.filter(s => s.studentId === student.id);
      const studentExamSubmissions = examSubmissions.filter(s => s.studentId === student.id);
      const studentAttendance = attendanceRecords.filter(a => a.studentId === student.id);

      const totalAssignments = course.assignments.length;
      const submittedAssignments = new Set(studentAssignmentSubmissions.map(s => s.assignmentId)).size;
      const averageAssignmentGrade =
        studentAssignmentSubmissions.length > 0
          ? studentAssignmentSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / studentAssignmentSubmissions.length
          : null;

      const totalExams = course.Exam.length;
      const submittedExamsCount = studentExamSubmissions.length;
      const averageExamScore =
        studentExamSubmissions.length > 0
          ? studentExamSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / studentExamSubmissions.length
          : null;

      const individualExamScores: Record<string, number | null> = {};
      studentExamSubmissions.forEach(sub => {
        individualExamScores[sub.examId] = sub.score;
      });

      const totalAttendanceDays = studentAttendance.length;
      const presentCount = studentAttendance.filter(a => a.status === "PRESENT").length;
      const absentCount = studentAttendance.filter(a => a.status === "ABSENT").length;
      const tardyCount = studentAttendance.filter(a => a.status === "TARDY").length;

      return {
        studentId: student.id,
        studentUserId: student.userId,
        studentName: student.user.name || student.user.email,
        studentEmail: student.user.email,
        enrollmentProgress: enrollment.progress,
        enrollmentGrade: enrollment.grade,
        assignmentSummary: { totalAssignments, submittedCount: submittedAssignments, averageGrade: averageAssignmentGrade },
        attendanceSummary: { totalRecords: totalAttendanceDays, present: presentCount, absent: absentCount, tardy: tardyCount },
        examSummary: { totalExams, submittedCount: submittedExamsCount, averageScore: averageExamScore, individualExamScores },
      };
    }).filter(Boolean);

    return formatResponse(true, {
      course: { id: course.id, title: course.title, academicLevelName: academicLevel.name },
      studentReports,
    });
  } catch (error: any) {
    console.error("Error generating course report:", error);
    return formatResponse(false, null, error.message || "Failed to generate course report", 500);
  }
});
