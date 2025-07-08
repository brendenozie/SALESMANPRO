// app/api/student/grades/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId'); // The student whose grades are being viewed
  const companyId = searchParams.get('companyId');   // For multi-tenancy
  const courseId = searchParams.get('courseId');     // Optional: filter by a specific course

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Resolve the student's ID from the session (e.g., session.user.studentId).
  // 3. Verify the student is authorized to view their grades for this company.
  // const session = await auth();
  // if (!session || session.user.studentId !== studentId || session.user.role !== 'STUDENT') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!studentId || !companyId) {
    return NextResponse.json({ message: 'Missing studentId or companyId' }, { status: 400 });
  }

  try {
    // 1. Fetch Student details
    const student = await prisma.student.findUnique({
      where: { id: studentId, companyId: companyId },
      select: {
        id: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        academicLevel: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student || !student.user) {
      return NextResponse.json({ message: 'Student not found or not associated with this company' }, { status: 404 });
    }

    // 2. Fetch CourseEnrollments for this student to get overall course grades
    const courseEnrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId: studentId,
        status: 'ENROLLED', // Only active enrollments
        ...(courseId && { courseId: courseId }), // Apply courseId filter if provided
      },
      select: {
        courseId: true,
        grade: true, // Overall grade for the course
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                user: {
                  select: { name: true },
                },
              },
            },
            assignments: { // To calculate average score per course later
              select: {
                id: true,
                maxScore: true,
                submissions: {
                  where: { studentId: studentId, status: 'GRADED' },
                  select: { grade: true },
                },
              },
            },
          },
        },
      },
    });

    const studentCourseGrades: any[] = [];
    let totalOverallScore = 0;
    let totalOverallMaxScore = 0;
    let gradedCoursesCount = 0;

    for (const enrollment of courseEnrollments) {
      const course = enrollment.course;
      if (!course) continue;

      let courseTotalScore = 0;
      let courseMaxScore = 0;
      let gradedAssignmentsInCourse = 0;

      for (const assignment of course.assignments) {
        const submission = assignment.submissions[0]; // Assuming one submission per student per assignment
        if (submission && submission.grade !== null) {
          courseTotalScore += submission.grade;
          courseMaxScore += assignment.maxScore;
          gradedAssignmentsInCourse++;
        }
      }

      const averageScore = gradedAssignmentsInCourse > 0
        ? (courseTotalScore / courseMaxScore) * 100
        : null;

      // Convert numerical grade to letter grade (example logic, adjust as needed)
      const currentGradeLetter = enrollment.grade !== null
        ? (enrollment.grade >= 90 ? 'A' :
           enrollment.grade >= 80 ? 'B' :
           enrollment.grade >= 70 ? 'C' :
           enrollment.grade >= 60 ? 'D' : 'F')
        : 'N/A';

      studentCourseGrades.push({
        id: course.id,
        name: course.title,
        teacher: course.instructor?.user?.name || 'N/A',
        currentGrade: currentGradeLetter, // Letter grade from enrollment
        averageScore: averageScore, // Calculated average from assignments
        enrollmentGradeValue: enrollment.grade, // Raw numerical grade from enrollment
      });

      if (averageScore !== null) {
        totalOverallScore += courseTotalScore;
        totalOverallMaxScore += courseMaxScore;
        gradedCoursesCount++;
      }
    }

    // Calculate overall GPA and Average (simplified for example)
    const overallAverage = totalOverallMaxScore > 0
      ? (totalOverallScore / totalOverallMaxScore) * 100
      : null;

    // A real GPA calculation would involve credit hours and specific grading scales.
    // For simplicity, we'll use a placeholder or derive from overallAverage.
    const overallGPA = overallAverage !== null
      ? (overallAverage >= 90 ? '4.0' :
         overallAverage >= 80 ? '3.0' :
         overallAverage >= 70 ? '2.0' :
         overallAverage >= 60 ? '1.0' : '0.0')
      : 'N/A';


    // 3. Fetch all graded submissions for this student
    const gradedSubmissions = await prisma.submission.findMany({
      where: {
        studentId: studentId,
        status: 'GRADED',
        exam: {
          course: {
            companyId: companyId,
            ...(courseId && { id: courseId }), // Apply courseId filter if provided
          },
        },
      },
      select: {
        id: true,
        grade: true,
        feedback: true,
        submittedAt: true,
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            examType: true,
            maxScore: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' }, // Order by most recently graded
    });

    const studentAssignmentGrades = gradedSubmissions.map(submission => ({
      id: submission.id,
      assignmentId: submission.exam.id,
      assignmentName: submission.exam.title,
      className: submission.exam.course?.title || 'N/A',
      type: submission.exam.examType,
      grade: submission.grade,
      totalPoints: submission.exam.maxScore,
      feedback: submission.feedback,
      gradedDate: submission.submittedAt.toISOString(),
      description: submission.exam.description,
    }));

    return NextResponse.json({
      studentName: student.user.name || student.user.email,
      studentGradeLevel: student.academicLevel?.name || 'N/A',
      overallGPA: overallGPA,
      overallAverage: overallAverage !== null ? overallAverage.toFixed(1) + '%' : 'N/A',
      courseGrades: studentCourseGrades,
      assignmentGrades: studentAssignmentGrades,
    });

  } catch (error) {
    console.error('Error fetching student grades:', error);
    return NextResponse.json({ message: 'Failed to fetch student grades' }, { status: 500 });
  }
}
