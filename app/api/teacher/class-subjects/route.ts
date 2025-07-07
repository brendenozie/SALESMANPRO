// app/api/teacher/subjects/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const academicLevelId = searchParams.get('academicLevelId');
  const teacherId = searchParams.get('teacherId'); // Used to derive companyId

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'teacherId'.
  // 3. Ensure the 'teacherId' is authorized to access data for 'academicLevelId'.
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

    // Fetch courses (subjects) linked to the academic level via CourseAcademicLevel
    const courses = await prisma.course.findMany({
      where: {
        companyId: companyId, // Ensure multi-tenancy
        academicLevels: { // Relate to CourseAcademicLevel
          some: {
            academicLevelId: academicLevelId,
          },
        },
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: 'asc',
      },
    });

    // Map to the CourseOption type expected by the frontend
    const courseOptions = courses.map(course => ({
      id: course.id,
      title: course.title,
    }));

    return NextResponse.json(courseOptions);
  } catch (error) {
    console.error('Error fetching courses for academic level:', error);
    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }
}
