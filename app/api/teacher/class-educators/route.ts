// app/api/admin/educators/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { searchParams } = new URL(request.url);
  const academicLevelId = searchParams.get('academicLevelId'); // The classId from frontend
  const teacherId = searchParams.get('teacherId'); // Used to derive companyId (this is the User.id of the educator making the request)

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
    // Derive companyId from the requesting educator (teacherId is User.id)
    const requestingEducator = await prisma.educator.findUnique({
      where: { userId: teacherId }, // Find educator using their associated User.id
      select: { companyId: true },
    });

    if (!requestingEducator || !requestingEducator.companyId) {
      return NextResponse.json({ message: 'Requesting educator not found or not associated with a company' }, { status: 404 });
    }
    const companyId = requestingEducator.companyId;

    // Find educators who meet either of the following criteria:
    // 1. Directly assigned to the academic level
    // 2. Instruct courses that are linked to this academic level
    const educators = await prisma.educator.findMany({
      where: {
        companyId: companyId, // Ensure multi-tenancy: educators must belong to the same company
        OR: [
          {
            // Condition 1: Educators directly assigned to this academic level
            academicLevelAssignments: { // Relation on Educator model to EducatorAcademicLevelAssignment
              some: {
                academicLevelId: academicLevelId, // Filter by the target academic level
              },
            },
          },
          {
            // Condition 2: Educators who instruct courses (via CourseEducatorAssignment)
            // that are linked to this academic level (via CourseAcademicLevel)
            CourseEducatorAssignment: { // Relation on Educator model to CourseEducatorAssignment
              some: {
                course: { // Assuming CourseEducatorAssignment has a 'course' relation to Course model
                  academicLevels: { // Assuming Course model has a 'CourseAcademicLevel' relation
                    some: {
                      academicLevelId: academicLevelId, // Filter by the target academic level
                    },
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        user: { // Include the related User model details
          select: { name: true, email: true }, // Select specific user fields
        },
      },
      orderBy: {
        user: { // Order by user's name
          name: 'asc',
        },
      },
    });

    // Map the retrieved educators to the desired frontend format
    const educatorOptions = educators.map(educator => ({
      id: educator.id,
      name: educator.user?.name || 'N/A', // Access user name via optional chaining
      email: educator.user?.email || 'N/A', // Access user email via optional chaining
    }));

    return NextResponse.json(educatorOptions);
  } catch (error) {
    console.error('Error fetching educators for academic level:', error);
    return NextResponse.json({ message: 'Failed to fetch educators' }, { status: 500 });
  }
}