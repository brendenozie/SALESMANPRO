// app/api/student/assignments/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId'); // The student whose assignments are being viewed
  const companyId = searchParams.get('companyId');   // For multi-tenancy
  const courseId = searchParams.get('courseId');     // Optional: filter by a specific course

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Resolve the student's ID from the session (e.g., session.user.studentId).
  // 3. Verify the student is authorized to view their assignments for this company.
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

    // 2. Find all courses the student is enrolled in
    const enrolledCourses = await prisma.courseEnrollment.findMany({
      where: {
        studentId: studentId,
        status: 'ENROLLED',
        ...(courseId && { courseId: courseId }), // Apply courseId filter if provided
      },
      select: {
        courseId: true,
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                id: true, // Educator ID
                user: {
                  select: { name: true }, // Educator's user name
                },
              },
            },
            assignments: {
              where: {
                // Filter for assignment types relevant to students (e.g., Homework, Project, Quiz)
                // Adjust based on your ExamType enum and what you consider 'assignments'
                examType: {
                  in: ['HOMEWORK', 'PROJECT', 'QUIZ', 'EXAM'], // Include all relevant types
                },
              },
              select: {
                id: true,
                title: true,
                description: true,
                examDate: true, // Due Date
                examType: true,
                maxScore: true,
                submissions: { // Fetch student's submission for this assignment
                  where: { studentId: studentId },
                  select: {
                    id: true,
                    submissionUrl: true,
                    grade: true,
                    feedback: true,
                    status: true, // SUBMITTED, GRADED, PENDING
                    submittedAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const studentAssignments = [];
    const now = new Date();

    for (const enrollment of enrolledCourses) {
      const course = enrollment.course;
      if (!course) continue;

      for (const assignment of course.assignments) {
        const studentSubmission = assignment.submissions[0] || null; // A student should have at most one submission per assignment

        let assignmentStatus = 'Not Submitted'; // Default status
        let grade = null;
        let feedback = null;
        let submissionUrl = null;
        let submittedAt = null;

        if (studentSubmission) {
          grade = studentSubmission.grade;
          feedback = studentSubmission.feedback;
          submissionUrl = studentSubmission.submissionUrl;
          submittedAt = studentSubmission.submittedAt;

          if (studentSubmission.status === 'GRADED') {
            assignmentStatus = 'Graded';
          } else if (studentSubmission.status === 'SUBMITTED') {
            assignmentStatus = 'Submitted';
          } else if (studentSubmission.status === 'PENDING') {
            assignmentStatus = 'Submitted'; // Treat PENDING as submitted for student view
          }
        }

        // Determine if overdue
        if (assignmentStatus !== 'Graded' && assignment.examDate < now && assignmentStatus !== 'Submitted') {
            assignmentStatus = 'Overdue';
        }


        studentAssignments.push({
          id: assignment.id,
          name: assignment.title,
          classId: course.id,
          className: course.title,
          teacher: course.instructor?.user?.name || 'N/A',
          dueDate: assignment.examDate.toISOString(), // ISO string for date inputs
          status: assignmentStatus,
          type: assignment.examType,
          totalPoints: assignment.maxScore,
          grade: grade,
          feedback: feedback,
          submissionUrl: submissionUrl,
          description: assignment.description,
          submittedAt: submittedAt?.toISOString() || null,
        });
      }
    }

    // Sort assignments by due date
    studentAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return NextResponse.json({
      studentName: student.user.name || student.user.email,
      studentGradeLevel: student.academicLevel?.name || 'N/A',
      assignments: studentAssignments,
    });

  } catch (error) {
    console.error('Error fetching student assignments:', error);
    return NextResponse.json({ message: 'Failed to fetch student assignments' }, { status: 500 });
  }
}


// app/api/student/submit-assignment/route.ts
// import { NextResponse } from 'next/server';
// import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function POST(request: Request) {
  const {
    studentId,
    assignmentId,
    submissionUrl,
    submissionText, // Optional: for text-based submissions
    companyId,
  } = await request.json();

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Resolve the student's ID from the session (e.g., session.user.studentId).
  // 3. Verify the student is authorized to submit for this assignment/company.
  // const session = await auth();
  // if (!session || session.user.studentId !== studentId || session.user.role !== 'STUDENT') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!studentId || !assignmentId || !companyId || (!submissionUrl && !submissionText)) {
    return NextResponse.json({ message: 'Missing required data: studentId, assignmentId, companyId, and either submissionUrl or submissionText' }, { status: 400 });
  }

  try {
    // Verify the assignment exists and belongs to a course associated with the student's enrollment
    const assignment = await prisma.exam.findUnique({
      where: { id: assignmentId },
      select: { courseId: true, examDate: true },
    });

    if (!assignment) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: studentId,
        courseId: assignment.courseId,
        status: 'ENROLLED',
      },
    });

    if (!enrollment) {
      return NextResponse.json({ message: 'Student not enrolled in this course or not authorized to submit this assignment' }, { status: 403 });
    }

    // Check if a submission already exists for this student and assignment
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        studentId: studentId,
        examId: assignmentId,
      },
    });

    let submission;
    const now = new Date();
    const isLate = now > assignment.examDate;

    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          submissionUrl: submissionUrl,
          submissionText: submissionText,
          submittedAt: now,
          status: 'SUBMITTED', // Set to SUBMITTED upon update
          isLate: isLate,
          updatedAt: now,
        },
      });
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          studentId: studentId,
          examId: assignmentId,
          courseId: assignment.courseId, // Link submission to course
          submissionUrl: submissionUrl,
          submissionText: submissionText,
          submittedAt: now,
          status: 'SUBMITTED', // Initial status upon submission
          isLate: isLate,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    return NextResponse.json({ message: 'Assignment submitted successfully', submission }, { status: 200 });
  } catch (error: any) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ message: 'Failed to submit assignment', error: error.message }, { status: 500 });
  }
}
