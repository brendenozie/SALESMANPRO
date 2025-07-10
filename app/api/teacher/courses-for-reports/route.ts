// app/api/teacher/courses-for-reports/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId');

  if (!educatorId) {
    return NextResponse.json({ message: 'Missing educatorId' }, { status: 400 });
  }

  const educator = await prisma.educator.findUnique({
    where: { userId: educatorId }, // Find educator using their associated User.id
    select: {
      id: true,
      companyId: true, // Select companyId from the educator
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!educator) {
    return NextResponse.json({ message: 'Educator not found or not associated with this company' }, { status: 404 });
  }

  try {
    const courses = await prisma.course.findMany({
      where: {
        CourseEducatorAssignment: {
          some: {
            educatorId: educator.id, // Filter by the specific educator's ID
          },
        },
      },
      select: {
        id: true,
        title: true,
        academicLevels: {
          select: {
            academicLevel: {
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

    // Return an object containing both courses and the educator's companyId
    return NextResponse.json({
      courses: formattedCourses,
      companyId: educator.companyId, // Include the companyId here
    });

  } catch (error) {
    console.error('Error fetching courses for reports:', error);
    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }
}