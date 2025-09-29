// app/api/teacher/reports/course/[courseId]/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure
import { formatResponse } from "@/lib/formatResponse";


export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId');
  const companyId = searchParams.get('companyId');

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorId'.
  // 3. Ensure the 'educatorId' is authorized to view reports for this 'courseId' and 'companyId'.
  // const session = await auth();
  // if (!session || session.user.id !== educatorId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!courseId || !educatorId || !companyId) {
    return NextResponse.json({ message: 'Missing courseId, educatorId, or companyId' }, { status: 400 });
  }

  try {
    // 1. Fetch Course details, including assignments and exams
    const course = await prisma.course.findUnique({
      where: { id: courseId, companyId: companyId },
      select: {
        id: true,
        title: true,
        academicLevels: {
          select: {
            academicLevel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        assignments: {
          select: {
            id: true,
            title: true,
            maxGrade: true, // Use maxPoints from CourseAssignment
          },
        },
        Exam: { // NEW: Select exams for this course
          select: {
            id: true,
            title: true,
            totalPoints: true,
            date: true,
            type: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found or not associated with this company' }, { status: 404 });
    }

    const academicLevel = course.academicLevels.length > 0
      ? course.academicLevels[0].academicLevel
      : { id: 'N/A', name: 'No Academic Level' };

    // 2. Fetch all enrollments for the course
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId: courseId },
      select: {
        studentId: true,
        progress: true,
        grade: true, // Enrollment grade (if applicable)
        student: {
          select: {
            id: true, // Student model ID
            userId: true, // User model ID
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Extract student IDs for efficient filtering of submissions and attendance
    const studentIds = enrollments.map(e => e.studentId);
    const courseExamIds = course.Exam.map(exam => exam.id);

    // 3. Fetch all submissions for assignments in this course
    const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
      where: {
        courseId: courseId,
        studentId: { in: studentIds } // Filter by enrolled students
      },
      select: {
        assignmentId: true,
        studentId: true,
        grade: true,
        submittedAt: true,
      },
    });

    // 4. Fetch all exam submissions for exams in this course
    const examSubmissions = await prisma.examSubmission.findMany({ // NEW: Fetch ExamSubmissions
      where: {
        examId: { in: courseExamIds }, // Filter by exams in this course
        studentId: { in: studentIds } // Filter by enrolled students
      },
      select: {
        examId: true,
        studentId: true,
        score: true,
        submittedAt: true,
      },
    });

    // 5. Fetch all attendance records for this course
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        courseId: courseId,
        studentId: { in: studentIds } // Filter by enrolled students
      },
      select: {
        studentId: true,
        date: true,
        status: true,
      },
    });

    // Process data to build the report
    const studentReports: any[] = [];
    for (const enrollment of enrollments) {
      const student = enrollment.student;
      if (!student || !student.user) continue;

      const studentAssignmentSubmissions = assignmentSubmissions.filter(sub => sub.studentId === student.id);
      const studentExamSubmissions = examSubmissions.filter(sub => sub.studentId === student.id); // Filter exam submissions
      const studentAttendance = attendanceRecords.filter(att => att.studentId === student.id);

      // Calculate assignment summary
      const totalAssignments = course.assignments.length;
      const submittedAssignments = new Set(studentAssignmentSubmissions.map(s => s.assignmentId)).size;
      const averageAssignmentGrade = studentAssignmentSubmissions.length > 0
        ? studentAssignmentSubmissions.reduce((sum, sub) => sum + (sub.grade || 0), 0) / studentAssignmentSubmissions.length
        : null;

      // Calculate exam summary (NEW)
      const totalExams = course.Exam.length;
      const submittedExamsCount = studentExamSubmissions.length;
      const averageExamScore = studentExamSubmissions.length > 0
        ? studentExamSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / studentExamSubmissions.length
        : null;

      // Optionally, include individual exam scores if needed
      const individualExamScores: { [examId: string]: number | null } = {};
      studentExamSubmissions.forEach(sub => {
        individualExamScores[sub.examId] = sub.score;
      });


      // Calculate attendance summary
      const totalAttendanceDays = studentAttendance.length;
      const presentCount = studentAttendance.filter(att => att.status === 'PRESENT').length;
      const absentCount = studentAttendance.filter(att => att.status === 'ABSENT').length;
      const tardyCount = studentAttendance.filter(att => att.status === 'TARDY').length;

      studentReports.push({
        studentId: student.id,
        studentUserId: student.userId,
        studentName: student.user.name || student.user.email,
        studentEmail: student.user.email,
        enrollmentProgress: enrollment.progress,
        enrollmentGrade: enrollment.grade,
        assignmentSummary: {
          totalAssignments: totalAssignments,
          submittedCount: submittedAssignments,
          averageGrade: averageAssignmentGrade,
        },
        attendanceSummary: {
          totalRecords: totalAttendanceDays,
          present: presentCount,
          absent: absentCount,
          tardy: tardyCount,
        },
        examSummary: { // NEW: Add exam summary
          totalExams: totalExams,
          submittedCount: submittedExamsCount,
          averageScore: averageExamScore,
          individualExamScores: individualExamScores, // Optional: for detailed view
        },
      });
    }

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        academicLevelName: academicLevel.name,
      },
      studentReports: studentReports,
    });

  } catch (error) {
    console.error('Error generating course report:', error);
    return NextResponse.json({ message: 'Failed to generate course report', error: (error as Error).message }, { status: 500 });
  }
}