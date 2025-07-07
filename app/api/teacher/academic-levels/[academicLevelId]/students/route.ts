// app/api/teacher/academic-levels/[classId]/students/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";  // Adjust path as per your project structure

export async function GET(request: Request, { params }: { params: { classId: string } }) {
  const academicLevelId = params.classId;
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacherId'); // Used to derive companyId

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'teacherId'.
  // 3. Ensure the 'teacherId' is authorized to access students in 'academicLevelId'.
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

    const students = await prisma.student.findMany({
      where: {
        academicLevelId: academicLevelId,
        companyId: companyId, // Ensure multi-tenancy
      },
      include: {
        user: {
          select: { name: true, email: true }, // Include user details for student name/email
        },
        parent: { // Include the related Parent and its User model for parent email
          include: {
            user: {
              select: { name: true, email: true, },
            },
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    // Map to the StudentOption type expected by the frontend
    const studentOptions = students.map(student => ({
      id: student.id,
      name: student.user?.name || 'N/A',
      email: student.user?.email || 'N/A',
      parentId: student.parentId,
      parentName: student.parent?.user?.name || null,
      parentEmail: student.parent?.user?.email || null,
    }));

    return NextResponse.json(studentOptions);
  } catch (error) {
    console.error('Error fetching students for academic level:', error);
    return NextResponse.json({ message: 'Failed to fetch students' }, { status: 500 });
  }
}
