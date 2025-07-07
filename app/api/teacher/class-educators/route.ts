// app/api/admin/educators/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";  // Adjust path as per your project structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const academicLevelId = searchParams.get('academicLevelId'); // The classId from frontend
  const teacherId = searchParams.get('teacherId'); // Used to derive companyId

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user has 'ADMIN' or 'EDUCATOR' role.
  // 3. If 'EDUCATOR', ensure they are accessing data within their company.
  // const session = await auth();
  // if (!session || !session.user) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!academicLevelId || !teacherId) {
    return NextResponse.json({ message: 'Missing academicLevelId or teacherId' }, { status: 400 });
  }

  try {
    // Derive companyId from the educator (teacherId)
    const requestingEducator = await prisma.educator.findUnique({
      where: { id: teacherId },
      select: { companyId: true },
    });

    if (!requestingEducator || !requestingEducator.companyId) {
      return NextResponse.json({ message: 'Requesting educator not found or not associated with a company' }, { status: 404 });
    }
    const companyId = requestingEducator.companyId;

    // Find educators either directly assigned to the academic level
    // OR who are instructors of courses within that academic level
    const educators = await prisma.educator.findMany({
      where: {
        companyId: companyId, // Ensure multi-tenancy
        OR: [
          {
            // Educators directly assigned to this academic level
            academicLevelAssignments: {
              some: {
                academicLevelId: academicLevelId,
              },
            },
          },
          {
            // Educators who instruct courses that are linked to this academic level
            coursesCreated: {
              some: {
                academicLevels: {
                  some: {
                    academicLevelId: academicLevelId,
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: { name: true, email: true }, // Include user details for educator name/email
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    // Map to the EducatorOption type expected by the frontend
    const educatorOptions = educators.map(educator => ({
      id: educator.id,
      name: educator.user?.name || 'N/A',
      email: educator.user?.email || 'N/A',
    }));

    return NextResponse.json(educatorOptions);
  } catch (error) {
    console.error('Error fetching educators for academic level:', error);
    return NextResponse.json({ message: 'Failed to fetch educators' }, { status: 500 });
  }
}
