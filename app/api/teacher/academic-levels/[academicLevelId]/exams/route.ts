// app/api/teacher/academic-levels/[academicLevelId]/exams/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request, { params }: { params: { academicLevelId: string } }) {
  const { academicLevelId } = params;
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacherId'); // Used for company context and authorization

  // --- Authentication & Authorization (Placeholder) ---
  // const session = await auth();
  // if (!session || session.user.id !== teacherId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!academicLevelId || !teacherId) {
    return NextResponse.json({ message: 'Missing academicLevelId or teacherId' }, { status: 400 });
  }

  try {
    // Derive companyId from the educator (teacherId)
    const educator = await prisma.educator.findUnique({
      where: { id: teacherId },
      select: { companyId: true },
    });

    if (!educator || !educator.companyId) {
      return NextResponse.json({ message: 'Educator not found or not associated with a company' }, { status: 404 });
    }
    const companyId = educator.companyId;

    const exams = await prisma.exam.findMany({
      where: {
        companyId: companyId, // Ensure multi-tenancy
        course: { // Filter by courses linked to the academic level
          academicLevels: {
            some: {
              academicLevelId: academicLevelId,
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        examType: true,
        courseId: true, // Include courseId to link back
        course: { select: { title: true } }, // Include course title
      },
      orderBy: {
        examDate: 'desc', // Order by most recent exams
      },
    });

    // Format for frontend
    const formattedExams = exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      examType: exam.examType,
      courseId: exam.courseId,
      courseTitle: exam.course.title,
    }));

    return NextResponse.json(formattedExams);
  } catch (error) {
    console.error('Error fetching exams for academic level:', error);
    return NextResponse.json({ message: 'Failed to fetch exams' }, { status: 500 });
  }
}
