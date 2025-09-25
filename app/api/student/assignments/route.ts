// app/api/student/assignments/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId'); // The student whose assignments are being viewed
  // const companyId = searchParams.get('companyId');   // For multi-tenancy - now required
  const courseId = searchParams.get('courseId');     // Optional: filter by a specific course

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Resolve the student's ID from the session (e.g., session.user.studentId).
  // 3. Verify the student is authorized to view their assignments for this company.
  // const session = await auth();
  // if (!session || session.user.studentId !== studentId || session.user.role !== 'STUDENT' || session.user.companyId !== companyId) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!studentId ) {
    return NextResponse.json({ message: 'Missing studentId or companyId' }, { status: 400 });
  }

  try {
    // 1. Fetch Student details, including companyId in the where clause
    const student = await prisma.student.findUnique({
      where: {
        userId: studentId,
        // companyId: companyId, // Ensure student belongs to this company
      },
      select: {
        id: true,
        companyId: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        StudentAcademicLevel: { // Fetch related academic level
          // where: {
          //   // Assuming current academic level is the one with the latest update or active status
          //   // This might need more specific logic depending on your schema
          //   studentId: companyId,
          // },
          orderBy: {
            updatedAt: 'desc', // Or a specific 'isActive' field
          },
          take: 1,
          select: {
            academicLevel: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!student || !student.user) {
      return NextResponse.json({ message: 'Student not found or not associated with this company' }, { status: 404 });
    }

    const studentAcademicLevelName = student.StudentAcademicLevel[0]?.academicLevel?.name || 'N/A';

    // 2. Find all courses the student is enrolled in for the given company
    const enrolledCourses = await prisma.courseEnrollment.findMany({
      where: {
        studentId: studentId,
        companyId: student.companyId, // Ensure enrollment is for this company
        status: 'ENROLLED',
        ...(courseId && { courseId: courseId }), // Apply courseId filter if provided
      },
      select: {
        courseId: true,
        course: {
          select: {
            id: true,
            title: true,
            // Fetch educators assigned to this course
            CourseEducatorAssignment: {
              select: {
                educator: {
                  select: {
                    user: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
            // Select CourseAssignments related to this course
            assignments: {
              where: {
                // Only fetch published assignments relevant to students
                status: 'Published',
              },
              select: {
                id: true,
                title: true,
                description: true,
                dueDate: true,
                type: true, // Use 'type' from AssignmentType enum
                maxGrade: true, // Use 'maxGrade'
                submissions: { // Fetch student's submission for this specific assignment
                  where: { studentId: studentId },
                  select: {
                    id: true,
                    submissionUrl: true,
                    submissionContent: true, // New field for text content
                    grade: true,
                    comments: true, // Feedback is now 'comments'
                    submittedAt: true,
                  },
                },
              },
              orderBy: {
                dueDate: 'asc', // Order assignments by due date
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

      const teacherName = course.CourseEducatorAssignment[0]?.educator?.user?.name || 'N/A';

      for (const assignment of course.assignments) {
        const studentSubmission = assignment.submissions[0] || null; // A student can have at most one submission per assignment

        let assignmentStatus = 'Not Submitted'; // Default status
        let grade = null;
        let feedback = null; // Renamed from 'feedback' to 'comments'
        let submissionUrl = null;
        let submissionContent = null; // New field
        let submittedAt = null;

        if (studentSubmission) {
          grade = studentSubmission.grade;
          feedback = studentSubmission.comments; // Use comments for feedback
          submissionUrl = studentSubmission.submissionUrl;
          submissionContent = studentSubmission.submissionContent;
          submittedAt = studentSubmission.submittedAt;

          if (grade !== null) {
            assignmentStatus = 'Graded';
          } else if (submittedAt !== null) {
            assignmentStatus = 'Submitted';
          }
        }

        // Determine if overdue if not already graded or submitted
        if (assignmentStatus !== 'Graded' && assignmentStatus !== 'Submitted' && assignment.dueDate < now) {
          assignmentStatus = 'Overdue';
        }


        studentAssignments.push({
          id: assignment.id,
          name: assignment.title,
          classId: course.id,
          className: course.title,
          teacher: teacherName,
          dueDate: assignment.dueDate.toISOString(), // ISO string for date inputs
          status: assignmentStatus,
          type: assignment.type, // From AssignmentType enum
          totalPoints: assignment.maxGrade, // Use maxGrade
          grade: grade,
          feedback: feedback,
          submissionUrl: submissionUrl,
          submissionContent: submissionContent, // Include new field
          description: assignment.description,
          submittedAt: submittedAt?.toISOString() || null,
        });
      }
    }

    // Assignments are already sorted by due date from the Prisma query
    // studentAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return NextResponse.json({
      studentName: student.user.name || student.user.email,
      studentGradeLevel: studentAcademicLevelName,
      assignments: studentAssignments,
    });

  } catch (error) {
    console.error('Error fetching student assignments:', error);
    return NextResponse.json({ message: 'Failed to fetch student assignments', error: (error as Error).message }, { status: 500 });
  }
}

// app/api/student/submit-assignment/route.ts
// import { NextResponse } from 'next/server';
// import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function POST(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const {
    studentId,
    assignmentId,
    submissionUrl,
    submissionContent, // Updated from submissionText
    companyId,
  } = await request.json();

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Resolve the student's ID from the session (e.g., session.user.studentId).
  // 3. Verify the student is authorized to submit for this assignment/company.
  // const session = await auth();
  // if (!session || session.user.studentId !== studentId || session.user.role !== 'STUDENT' || session.user.companyId !== companyId) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!studentId || !assignmentId || !companyId || (!submissionUrl && !submissionContent)) {
    return NextResponse.json({ message: 'Missing required data: studentId, assignmentId, companyId, and either submissionUrl or submissionContent' }, { status: 400 });
  }

  try {
    // Verify the assignment exists and belongs to a course associated with the student's enrollment
    const assignment = await prisma.courseAssignment.findUnique({ // Changed from prisma.exam
      where: { id: assignmentId, companyId: companyId }, // Add companyId check
      select: { courseId: true, dueDate: true }, // Use dueDate
    });

    if (!assignment) {
      return NextResponse.json({ message: 'Assignment not found or not associated with this company' }, { status: 404 });
    }

    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: studentId,
        courseId: assignment.courseId,
        companyId: companyId, // Add companyId check
        status: 'ENROLLED',
      },
    });

    if (!enrollment) {
      return NextResponse.json({ message: 'Student not enrolled in this course or not authorized to submit this assignment' }, { status: 403 });
    }

    // Check if a submission already exists for this student and assignment
    const existingSubmission = await prisma.assignmentSubmission.findUnique({ // Changed from prisma.submission
      where: {
        assignmentId_studentId: { // Use the unique compound ID for AssignmentSubmission
          assignmentId: assignmentId,
          studentId: studentId,
        },
      },
    });

    let submission;
    const now = new Date();
    const isLate = now > assignment.dueDate; // Use assignment.dueDate

    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.assignmentSubmission.update({ // Changed from prisma.submission
        where: { id: existingSubmission.id }, // Use the individual ID for update
        data: {
          submissionUrl: submissionUrl,
          submissionContent: submissionContent, // Updated field name
          submittedAt: now,
          // Removed 'status' field as it's not in the schema
          // isLate: isLate, // 'isLate' field is not in schema
          updatedAt: now,
        },
      });
    } else {
      // Create new submission
      submission = await prisma.assignmentSubmission.create({ // Changed from prisma.submission
        data: {
          studentId: studentId,
          assignmentId: assignmentId, // Changed from examId
          courseId: assignment.courseId, // Link submission to course
          submissionUrl: submissionUrl,
          submissionContent: submissionContent, // Updated field name
          submittedAt: now,
          companyId: companyId, // Ensure companyId is saved with submission
          // Removed 'status' field as it's not in the schema
          // isLate: isLate, // 'isLate' field is not in schema
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