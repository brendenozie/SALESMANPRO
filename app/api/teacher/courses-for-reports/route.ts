// app/api/teacher/courses-for-reports/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // educatorId is assumed to be the unique identifier (_id) of the Educator document
  const educatorId = searchParams.get('educatorId');
  const companyId = searchParams.get('companyId');

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorId'.
  // 3. Ensure the educator is authorized for this company.
  // const session = await auth();
  // if (!session || session.user.id !== educatorId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  // Ensure both educatorId and companyId are provided for proper filtering
  if (!educatorId || !companyId) {
    return NextResponse.json({ message: 'Missing educatorId or companyId' }, { status: 400 });
  }

  try {
    // Fetch courses taught by this educator within this company.
    // The relationship is now through the CourseEducatorAssignment junction table.
    const courses = await prisma.course.findMany({
      where: {
        companyId: companyId, // Filter courses by companyId for multi-tenancy
        CourseEducatorAssignment: { // Use the new junction table for educator-course assignments
          some: {
            educatorId: educatorId, // Filter by the specific educator's ID
          },
        },
      },
      select: {
        id: true,
        title: true, // Use 'title' as per your updated Course model
        academicLevels: { // Access academic levels via the CourseAcademicLevel junction table
          select: {
            academicLevel: { // Select the actual AcademicLevel details
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { title: 'asc' }, // Order the results by course title
    });

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      // Safely access academic level name. If a course is linked to multiple
      // academic levels, this will pick the name of the first one found.
      academicLevelName: course.academicLevels[0]?.academicLevel?.name || 'N/A',
    }));

    return NextResponse.json(formattedCourses);

  } catch (error) {
    console.error('Error fetching courses for reports:', error);
    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }
}