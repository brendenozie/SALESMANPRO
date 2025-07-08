// app/api/teacher/academic-levels/[academicLevelId]/courses/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";  // Adjust path as per your project structure

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
      where: { userId: teacherId },
      select: { companyId: true },
    });

    if (!educator || !educator.companyId) {
      return NextResponse.json({ message: 'Educator not found or not associated with a company' }, { status: 404 });
    }
    const companyId = educator.companyId;

    const courses = await prisma.course.findMany({
      where: {
        companyId: companyId, // Ensure multi-tenancy
        academicLevels: {
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

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses for academic level:', error);
    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }
}
