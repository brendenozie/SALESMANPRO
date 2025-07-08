// app/api/teacher/courses/[courseId]/assignments/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId'); // The educator viewing/managing assignments
  const companyId = searchParams.get('companyId');   // For multi-tenancy

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorId'.
  // 3. Ensure the 'educatorId' is authorized to manage assignments for this 'courseId' and 'companyId'.
  // const session = await auth();
  // if (!session || session.user.id !== educatorId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!courseId || !educatorId) {
    return NextResponse.json({ message: 'Missing courseId, educatorId, or companyId' }, { status: 400 });
  }

  try {
    // Verify the educator is linked to the company and course (optional but good practice)
    const course = await prisma.course.findUnique({
      where: { id: courseId,},
      select: {
        id: true,
        title: true,
        description: true,
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
      },
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found or not associated with this company' }, { status: 404 });
    }

    // Fetch Exams (assignments) for this course
    const assignments = await prisma.exam.findMany({
      where: {
        courseId: courseId,
        // companyId: companyId,
        // Filter by relevant exam types that represent assignments
        // You might want to add a specific 'ASSIGNMENT' ExamType if 'HOMEWORK'/'PROJECT' isn't sufficient
        OR: [
          { type: 'HOMEWORK' },
          { type: 'PROJECT' },
          { type: 'QUIZ' }, // Quizzes can also be assignments
          { type: 'OTHER' }, // Or a generic 'OTHER'
        ],
      },
      include: {
        _count: {
          select: { submissions: true }, // Count submissions for each assignment
        },
      },
      orderBy: { date: 'asc' }, // Order by due date
    });

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.date.toISOString().split('T')[0], // Format to YYYY-MM-DD
      maxPoints: assignment.totalPoints,
      status: assignment.type, // Using examType as status for simplicity, you might map this
      submissionCount: assignment._count.submissions,
      // You might need a more sophisticated status logic (e.g., 'Draft', 'Published', 'Graded')
      // For now, mapping ExamType to 'status' as a placeholder.
      // In a real app, you might have a separate AssignmentStatus enum or logic.
      displayStatus: assignment.type === 'HOMEWORK' ? 'Published' :
                     assignment.type === 'PROJECT' ? 'Published' :
                     assignment.type === 'QUIZ' ? 'Published' : 'Draft', // Placeholder mapping
    }));

    // Determine the primary academic level for the course for display
    const academicLevel = course.academicLevels.length > 0
      ? course.academicLevels[0].academicLevel
      : { id: 'N/A', name: 'No Academic Level' };

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        academicLevelId: academicLevel.id,
        academicLevelName: academicLevel.name,
      },
      assignments: formattedAssignments,
    });

  } catch (error) {
    console.error('Error fetching course assignments:', error);
    return NextResponse.json({ message: 'Failed to fetch course assignments' }, { status: 500 });
  }
}

// // app/api/teacher/assignments/route.ts
// import { NextResponse } from 'next/server';
// import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

// Define ExamType enum for validation
enum ExamType {
  QUIZ = 'QUIZ',
  MIDTERM = 'MIDTERM',
  FINAL = 'FINAL',
  HOMEWORK = 'HOMEWORK',
  PROJECT = 'PROJECT',
  OTHER = 'OTHER',
}

export async function POST(request: Request) {
  const {
    id, // Optional, for updating existing assignment
    title,
    description,
    dueDate,
    maxPoints,
    status, // This will map to ExamType in Prisma
    courseId,
    educatorId, // createdById
    companyId,
  } = await request.json();

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorId'.
  // 3. Ensure the 'educatorId' is authorized to manage assignments for this course/company.
  // const session = await auth();
  // if (!session || session.user.id !== educatorId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!title || !dueDate || maxPoints === undefined || maxPoints === null || !status || !courseId || !educatorId || !companyId) {
    return NextResponse.json({ message: 'Missing required assignment data: title, dueDate, maxPoints, status, courseId, educatorId, companyId' }, { status: 400 });
  }

  // Validate status mapping to ExamType
  const examType = status.toUpperCase() as ExamType; // Assuming frontend status maps directly to ExamType
  if (!(Object.values(ExamType) as string[]).includes(examType)) {
    return NextResponse.json({ message: `Invalid assignment status. Must be one of: ${Object.values(ExamType).join(', ')}` }, { status: 400 });
  }

  // Parse dueDate to Date object
  const parsedDueDate = new Date(dueDate);
  if (isNaN(parsedDueDate.getTime())) {
    return NextResponse.json({ message: 'Invalid due date format' }, { status: 400 });
  }

  try {
    const assignmentData = {
      title: title,
      description: description,
      examDate: parsedDueDate, // Using examDate as dueDate for assignments
      maxScore: maxPoints,
      examType: examType,
      courseId: courseId,
      createdById: educatorId,
      companyId: companyId,
    };

    let assignment;
    if (id) {
      // Update existing assignment (Exam)
      assignment = await prisma.exam.update({
        where: { id: id },
        data: {
          ...assignmentData,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new assignment (Exam)
      assignment = await prisma.exam.create({
        data: assignmentData,
      });
    }

    // Return the created/updated assignment, formatted similarly to GET for consistency
    const formattedAssignment = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.date.toISOString().split('T')[0],
      maxPoints: assignment.totalPoints,
      status: assignment.type, // Use ExamType as status
      // For submissionCount, we'd need to fetch it separately or count on client if not critical for response
      submissionCount: 0, // Placeholder, will be accurate on GET
      displayStatus: assignment.type === 'HOMEWORK' ? 'Published' :
                     assignment.type === 'PROJECT' ? 'Published' :
                     assignment.type === 'QUIZ' ? 'Published' : 'Draft', // Placeholder mapping
    };

    return NextResponse.json(formattedAssignment, { status: id ? 200 : 201 });
  } catch (error: any) {
    console.error('Error saving assignment:', error);
    return NextResponse.json({ message: 'Failed to save assignment', error: error.message }, { status: 500 });
  }
}


// app/api/teacher/assignments/[assignmentId]/route.ts
// import { NextResponse } from 'next/server';
// import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function DELETE(request: Request, { params }: { params: { assignmentId: string } }) {
  const { assignmentId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId'); // The educator performing the deletion
  const companyId = searchParams.get('companyId');   // For multi-tenancy

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorId'.
  // 3. Ensure the 'educatorId' is authorized to delete this assignment (e.g., they created it or are an admin).
  // const session = await auth();
  // if (!session || session.user.id !== educatorId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!assignmentId || !educatorId || !companyId) {
    return NextResponse.json({ message: 'Missing assignmentId, educatorId, or companyId' }, { status: 400 });
  }

  try {
    // Optional: Verify the assignment belongs to the correct course/company and was created by this educator
    const assignmentToDelete = await prisma.exam.findUnique({
      where: { id: assignmentId },
      select: { courseId: true, companyId: true, createdByEducatorId: true },
    });

    if (!assignmentToDelete || assignmentToDelete.companyId !== companyId || assignmentToDelete.createdByEducatorId !== educatorId) {
      return NextResponse.json({ message: 'Assignment not found or unauthorized to delete' }, { status: 404 });
    }

    // Delete the assignment (Exam record).
    // Note: Prisma's default behavior for onDelete: Cascade might handle related Submissions/Grades.
    // Review your schema's `onDelete` actions for `ExamSubmission` and `Grade` models.
    // If not cascading, you'll need to manually delete related records first.
    await prisma.exam.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({ message: 'Assignment deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ message: 'Failed to delete assignment' }, { status: 500 });
  }
}
