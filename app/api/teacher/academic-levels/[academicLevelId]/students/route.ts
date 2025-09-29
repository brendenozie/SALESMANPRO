// app/api/teacher/academic-levels/[academicLevelId]/students/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure
import { formatResponse } from "@/lib/formatResponse";


export async function GET(request: Request, { params }: { params: { academicLevelId: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const academicLevelId = params.academicLevelId;
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
      where: { userId: teacherId },
      select: { companyId: true },
    });

    if (!educator || !educator.companyId) {
      return NextResponse.json({ message: 'Educator not found or not associated with a company' }, { status: 404 });
    }
    const companyId = educator.companyId;

    // Query the StudentAcademicLevel junction table to get students for the academic level.
    const studentAcademicLevels = await prisma.studentAcademicLevel.findMany({
      where: {
        academicLevelId: academicLevelId,
        // Ensure the student associated with this academic level belongs to the same company
        student: {
          companyId: companyId,
        }
      },
      include: {
        student: { // Include the related Student model
          select: { // Select only necessary student fields
            id: true,
            parentId: true,
            user: { // Include User details for student name/email
              select: { name: true, email: true },
            },
            parent: { // Include the related Parent and its User model for parent email
              select: {
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
        },
      },
      // Order by student name
      orderBy: {
        student: {
          user: {
            name: 'asc',
          },
        },
      },
    });

    // Map the results from StudentAcademicLevel to the desired StudentOption type
    // studentAcademicLevels will be an array of { id: ..., student: { ... } }
    const studentOptions = studentAcademicLevels.map(sal => ({
      id: sal.student.id, // This is the Student's actual ID
      name: sal.student.user?.name || 'N/A',
      email: sal.student.user?.email || 'N/A',
      parentId: sal.student.parentId,
      parentName: sal.student.parent?.user?.name || null,
      parentEmail: sal.student.parent?.user?.email || null,
    }));

    return NextResponse.json(studentOptions);
  } catch (error) {
    console.error('Error fetching students for academic level:', error);
    return NextResponse.json({ message: 'Failed to fetch students', error: (error as Error).message }, { status: 500 });
  }
}