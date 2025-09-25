// app/api/teacher-subjects/route.ts
// This API will fetch the list of courses (subjects) assigned to a specific teacher
// for a given companyId. It will also include the primary academic level associated
// with each course.

import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { searchParams } = new URL(request.url);
  
  const teacherUserId = searchParams.get('teacherUserId'); // This is the User.id for the Educator

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user's role and ID.
  // 3. Ensure the user (teacherUserId) is authorized to access data for this companyId.
  // const session = await auth();
  // if (!session || session.user.id !== teacherUserId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!teacherUserId) {
    return NextResponse.json({ message: 'Missing companyId or teacherUserId' }, { status: 400 });
  }

  try {
    // 1. Find the Educator profile linked to the teacherUserId
    const educator = await prisma.educator.findUnique({
      where: { userId: teacherUserId },
      select: {
        id: true,
        companyId: true,
        user: {
          select: {
            name: true,
            email: true,
            role: true, // Assuming role is on User model
          },
        },
      },
    });

    if (!educator) {
      return NextResponse.json({ message: 'Educator not found or not associated with this company' }, { status: 404 });
    }

    const teacherInfo = {
      id: educator.id, // Educator ID
      name: educator.user?.name || 'N/A',
      email: educator.user?.email || 'N/A',
      role: educator.user?.role || 'Educator',
    };

    // 2. Fetch courses where this educator is the instructor OR where they are assigned to the academic level the course is linked to.
    // This query is a bit complex due to the many-to-many relationships.
    // We'll fetch courses where the educator is the direct instructor,
    // and courses linked to academic levels the educator is assigned to.

    const assignedCourses = await prisma.course.findMany({
      where: {
           instructorId: educator.id , // Courses where this educator is the direct instructor
          
            academicLevels: { // Courses linked to academic levels the educator is assigned to
              some: {
                academicLevel: {
                  educatorAssignments: {
                    some: {
                      educatorId: educator.id,
                    },
                  },
                },
              },
            },
      },
      include: {
        academicLevels: { // Include the academic levels associated with the course
          select: {
            academicLevel: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        enrollments: { // Count students enrolled
          select: {
            studentId: true, // Just need the count
          },
        },
        assignments: { // Basic assignment info
          select: {
            id: true,
            title: true,
            dueDate: true,
            status: true,
          },
          orderBy: { dueDate: 'asc' },
        },
        CourseMaterial: { // Basic resource info
          select: {
            id: true,
            title: true,
            type: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        // Assuming events are linked to courses or academic levels, you might fetch them separately
        // or refine this to include events directly related to the course.
        // For now, we'll keep events as a placeholder/mock on the client side for simplicity
        // as fetching all events and filtering them here might be too heavy.
      },
      orderBy: { title: 'asc' },
    });

    const teacherClasses = assignedCourses.map(course => {
      // Determine the primary academic level for the course.
      // If a course can be linked to multiple, you might need a more sophisticated logic
      // or a 'primaryAcademicLevelId' field on the Course model.
      const primaryAcademicLevel = course.academicLevels.length > 0
        ? course.academicLevels[0].academicLevel
        : { id: 'N/A', name: 'No Academic Level', description: null };

      // Mock schedule and room for now, as these are not directly on Course model in schema
      // You'd typically get this from ClassSchedule model.
      const mockSchedule = "Mon, Wed, Fri | 9:00 AM - 9:45 AM"; // Placeholder
      const mockRoom = "Room 101"; // Placeholder

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        schedule: mockSchedule, // Replace with actual schedule from ClassSchedule
        room: mockRoom, // Replace with actual room from ClassSchedule
        studentsEnrolled: course.enrollments.length,
        academicLevel: primaryAcademicLevel,
        // Students array is not directly included for performance; fetch separately if needed
        students: [], // Placeholder, fetch on demand for roster
        assignments: course.assignments.map(a => ({
          id: a.id,
          title: a.title,
          dueDate: a.dueDate.toISOString(),
          status: a.status,
        })),
        resources: course.CourseMaterial.map(m => ({
          id: m.id,
          name: m.title,
          type: m.type,
        })),
        events: [], // Placeholder, fetch class events separately
      };
    });

    // Mock theme settings - in a real app, these would come from CompanySettings
    const themeSettings = {
      primaryColor: "#4F46E5", // Indigo-600
      accentColor: "#818CF8", // Indigo-300
    };

    return NextResponse.json({
      teacherInfo,
      themeSettings,
      teacherClasses,
    });

  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    return NextResponse.json({ message: 'Failed to fetch teacher subjects' }, { status: 500 });
  }
}
