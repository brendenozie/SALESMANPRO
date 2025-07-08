// app/api/teacher/reports/course/[courseId]/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
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
    // 1. Fetch Course details
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
            maxGrade: true,
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
        grade: true, // Enrollment grade
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

    // 3. Fetch all submissions for assignments in this course
    const submissions = await prisma.submission.findMany({
      where: { courseId: courseId },
      select: {
        assignmentId: true,
        studentId: true,
        grade: true,
        submittedAt: true,
      },
    });

    // 4. Fetch all attendance records for this course
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { courseId: courseId },
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

      const studentSubmissions = submissions.filter(sub => sub.studentId === student.id);
      const studentAttendance = attendanceRecords.filter(att => att.studentId === student.id);

      // Calculate assignment summary
      const totalAssignments = course.assignments.length;
      const submittedAssignments = new Set(studentSubmissions.map(s => s.assignmentId)).size;
      const averageAssignmentGrade = studentSubmissions.length > 0
        ? studentSubmissions.reduce((sum, sub) => sum + (sub.grade || 0), 0) / studentSubmissions.length
        : null;

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
    return NextResponse.json({ message: 'Failed to generate course report' }, { status: 500 });
  }
}
