// // app/api/teacher/reports/course/[courseId]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const GET = withApiHandler(async (request: Request, { params }: { params: { courseId: string } }) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get("educatorId"); // User ID
  const classroomId = searchParams.get("classroomId"); // Optional filter

  if (!courseId || !educatorId) {
    return formatResponse(false, null, "Missing courseId or educatorId", 400);
  }

  try {
    // 1. Get Course details & associated Exams/Assignments
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        assignments: { select: { id: true, title: true, maxGrade: true } },
        Exam: { select: { id: true, title: true, totalPoints: true } },
      },
    });

    if (!course) return formatResponse(false, null, "Course not found", 404);

    // 2. Identify the Roster via ClassSchedules
    // We look for classrooms where this course is taught by this educator
    const schedules = await prisma.classSchedule.findMany({
      where: {
        courseId,
        educator: { userId: educatorId },
        ...(classroomId && { classroomId })
      },
      select: { classroomId: true, academicLevelId: true }
    });

    const classroomIds = Array.from(new Set(schedules.map(s => s.classroomId)));
    
    // 3. Fetch Students associated with these Classrooms
    const studentAssignments = await prisma.studentAcademicLevel.findMany({
      where: { classRoomId: { in: classroomIds as string[] } },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, image: true } }
          }
        }
      }
    });

    const students = studentAssignments.map(sa => sa.student).filter(Boolean);
    const studentIds = students.map(s => s!.id);

    // 4. Fetch Performance Data for these specific students in this course
    const [assignmentSubs, examSubs, attendance] = await Promise.all([
      prisma.assignmentSubmission.findMany({
        where: { courseId, studentId: { in: studentIds } }
      }),
      prisma.examSubmission.findMany({
        where: { examId: { in: course.Exam.map(e => e.id) }, studentId: { in: studentIds } }
      }),
      prisma.attendanceRecord.findMany({
        where: { courseId, studentId: { in: studentIds } }
      })
    ]);

    // 5. Build the Report Roster
    const studentReports = students.map(student => {
      const sSubs = assignmentSubs.filter(sub => sub.studentId === student!.id);
      const eSubs = examSubs.filter(sub => sub.studentId === student!.id);
      const sAtt = attendance.filter(att => att.studentId === student!.id);

      const avgAssignmentGrade = sSubs.length > 0 
        ? sSubs.reduce((sum, curr) => sum + (curr.grade || 0), 0) / sSubs.length 
        : 0;

      const avgExamScore = eSubs.length > 0
        ? eSubs.reduce((sum, curr) => sum + (curr.score || 0), 0) / eSubs.length
        : 0;

      return {
        studentId: student!.id,
        name: student!.user.name || student!.firstName + " " + student!.lastName,
        email: student!.user.email,
        image: student!.user.image,
        admissionNumber: student!.admissionNumber,
        stats: {
          assignments: {
            completed: sSubs.length,
            total: course.assignments.length,
            average: avgAssignmentGrade.toFixed(1)
          },
          exams: {
            completed: eSubs.length,
            total: course.Exam.length,
            average: avgExamScore.toFixed(1)
          },
          attendance: {
            present: sAtt.filter(a => a.status === 'PRESENT').length,
            total: sAtt.length,
            percentage: sAtt.length > 0 ? ((sAtt.filter(a => a.status === 'PRESENT').length / sAtt.length) * 100).toFixed(1) : "100"
          }
        }
      };
    });

    return formatResponse(true, {
      courseTitle: course.title,
      studentReports
    });

  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
});

// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";
// import { verifyAuth } from "@/lib/verifyAuth";

// // GET /api/teacher/reports/course/[courseId]
// export const GET = withApiHandler(async (request: Request, { params }: { params: { courseId: string } }) => {
//   const auth = await verifyAuth(request);
//   if (!auth.success) return formatResponse(false, null, auth.error, 401);

//   const { courseId } = params;
//   const { searchParams } = new URL(request.url);
//   const educatorId = searchParams.get("educatorId");
//   const companyId = searchParams.get("companyId");

//   if (!courseId || !educatorId || !companyId) {
//     return formatResponse(false, null, "Missing courseId, educatorId, or companyId", 400);
//   }

//   try {
//     // Fetch course details
//     const course = await prisma.course.findUnique({
//       where: { id: courseId, companyId },
//       select: {
//         id: true,
//         title: true,
//         academicLevels: { select: { academicLevel: { select: { id: true, name: true } } } },
//         assignments: { select: { id: true, title: true, maxGrade: true } },
//         Exam: { select: { id: true, title: true, totalPoints: true, date: true, type: true } },
//       },
//     });

//     if (!course) return formatResponse(false, null, "Course not found or unauthorized", 404);

//     const academicLevel = course.academicLevels[0]?.academicLevel || { id: "N/A", name: "No Academic Level" };

//     // Fetch enrollments
//     const enrollments = await prisma.courseEnrollment.findMany({
//       where: { courseId },
//       select: {
//         studentId: true,
//         progress: true,
//         grade: true,
//         student: {
//           select: {
//             id: true,
//             userId: true,
//             user: { select: { name: true, email: true } },
//           },
//         },
//       },
//     });

//     const studentIds = enrollments.map(e => e.studentId);
//     const courseExamIds = course.Exam.map(exam => exam.id);

//     // Fetch submissions
//     const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
//       where: { courseId, studentId: { in: studentIds } },
//       select: { assignmentId: true, studentId: true, grade: true, submittedAt: true },
//     });

//     const examSubmissions = await prisma.examSubmission.findMany({
//       where: { examId: { in: courseExamIds }, studentId: { in: studentIds } },
//       select: { examId: true, studentId: true, score: true, submittedAt: true },
//     });

//     const attendanceRecords = await prisma.attendanceRecord.findMany({
//       where: { courseId, studentId: { in: studentIds } },
//       select: { studentId: true, date: true, status: true },
//     });

//     // Build student reports
//     const studentReports = enrollments.map(enrollment => {
//       const student = enrollment.student;
//       if (!student || !student.user) return null;

//       const studentAssignmentSubmissions = assignmentSubmissions.filter(s => s.studentId === student.id);
//       const studentExamSubmissions = examSubmissions.filter(s => s.studentId === student.id);
//       const studentAttendance = attendanceRecords.filter(a => a.studentId === student.id);

//       const totalAssignments = course.assignments.length;
//       const submittedAssignments = new Set(studentAssignmentSubmissions.map(s => s.assignmentId)).size;
//       const averageAssignmentGrade =
//         studentAssignmentSubmissions.length > 0
//           ? studentAssignmentSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / studentAssignmentSubmissions.length
//           : null;

//       const totalExams = course.Exam.length;
//       const submittedExamsCount = studentExamSubmissions.length;
//       const averageExamScore =
//         studentExamSubmissions.length > 0
//           ? studentExamSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / studentExamSubmissions.length
//           : null;

//       const individualExamScores: Record<string, number | null> = {};
//       studentExamSubmissions.forEach(sub => {
//         individualExamScores[sub.examId] = sub.score;
//       });

//       const totalAttendanceDays = studentAttendance.length;
//       const presentCount = studentAttendance.filter(a => a.status === "PRESENT").length;
//       const absentCount = studentAttendance.filter(a => a.status === "ABSENT").length;
//       const tardyCount = studentAttendance.filter(a => a.status === "TARDY").length;

//       return {
//         studentId: student.id,
//         studentUserId: student.userId,
//         studentName: student.user.name || student.user.email,
//         studentEmail: student.user.email,
//         enrollmentProgress: enrollment.progress,
//         enrollmentGrade: enrollment.grade,
//         assignmentSummary: { totalAssignments, submittedCount: submittedAssignments, averageGrade: averageAssignmentGrade },
//         attendanceSummary: { totalRecords: totalAttendanceDays, present: presentCount, absent: absentCount, tardy: tardyCount },
//         examSummary: { totalExams, submittedCount: submittedExamsCount, averageScore: averageExamScore, individualExamScores },
//       };
//     }).filter(Boolean);

//     return formatResponse(true, {
//       course: { id: course.id, title: course.title, academicLevelName: academicLevel.name },
//       studentReports,
//     });
//   } catch (error: any) {
//     console.error("Error generating course report:", error);
//     return formatResponse(false, null, error.message || "Failed to generate course report", 500);
//   }
// });
