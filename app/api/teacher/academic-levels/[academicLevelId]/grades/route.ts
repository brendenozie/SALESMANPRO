// app/api/teacher/academic-levels/[academicLevelId]/grades/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request, { params }: { params: { academicLevelId: string } }) {
  const { academicLevelId } = params; // This is the academic level for which we want historical grades
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacherId'); // Used for company context and authorization
  const courseId = searchParams.get('courseId'); // Optional filter
  const studentId = searchParams.get('studentId'); // Optional filter
  const examId = searchParams.get('examId'); // Optional filter

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'teacherId'.
  // 3. Ensure the 'teacherId' is authorized to access grades for this 'academicLevelId'.
  // const session = await auth();
  // if (!session || session.user.id !== teacherId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!academicLevelId || !teacherId) {
    return NextResponse.json({ message: 'Missing academicLevelId or teacherId' }, { status: 400 });
  }

  try {
    // Derive companyId from the educator (teacherId) for multi-tenancy filtering
    const educator = await prisma.educator.findUnique({
      where: { userId: teacherId },
      select: { companyId: true },
    });

    if (!educator || !educator.companyId) {
      return NextResponse.json({ message: 'Educator not found or not associated with a company' }, { status: 404 });
    }
    const companyId = educator.companyId;

    // Build the WHERE clause dynamically based on filters
    // NOW, we filter directly on academicLevelAtTimeOfGradeId and companyId
    const whereClause: any = {
      academicLevelAtTimeOfGradingId: academicLevelId, // Filter grades by the historical academic level
      companyId: companyId, // Ensure grades belong to the same company
    };

    if (courseId) {
      whereClause.courseId = courseId;
    }
    if (studentId) {
      whereClause.studentId = studentId;
    }
    if (examId) {
      whereClause.examId = examId;
    }

    // CRITICAL CHANGE: Query the `grade` model directly
    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: { // Include student details
          select: {
            id: true,
            user: { select: { name: true, email: true } },
          },
        },
        course: { // Include course details
          select: {
            id: true,
            title: true,
          },
        },
        exam: { // Include exam details if linked
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        academicLevelAtTimeOfGrading:{ // Include the academic level info for context
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { student: { user: { name: 'asc' } } }, // Sort by student name
        { course: { title: 'asc' } },           // Then by course title
        { createdAt: 'asc' },                   // Then by grade creation date
      ],
    });

    // Format the response to be more usable by the frontend
    const formattedGrades = grades.map(grade => ({
      id: grade.id,
      score: grade.score,
      gradeValue: grade.gradeValue,
      gradeStatus: grade.gradeStatus,
      comments: grade.comments,
      createdAt: grade.createdAt.toISOString(),
      updatedAt: grade.updatedAt.toISOString(),
      studentId: grade.student.id,
      studentName: grade.student.user?.name || 'N/A',
      studentEmail: grade.student.user?.email || 'N/A',
      courseId: grade.course.id,
      courseTitle: grade.course.title,
      examId: grade.exam?.id || null,
      examTitle: grade.exam?.title || null,
      examType: grade.exam?.type || null,
      // Include the academic level name for this grade record
      academicLevelAtTimeOfGradeName: grade.academicLevelAtTimeOfGrading.name,
    }));

    return NextResponse.json(formattedGrades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({ message: 'Failed to fetch grades' }, { status: 500 });
  }
}
