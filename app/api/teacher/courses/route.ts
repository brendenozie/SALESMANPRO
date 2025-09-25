// app/api/teacher-subjects/route.ts
// This API will fetch the list of courses (subjects) assigned to a specific teacher
// for a given companyId. It will also include the primary academic level associated
// with each course.

import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { type } from 'os';
import { title } from 'process';

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
    return NextResponse.json({ message: 'Missing teacherUserId' }, { status: 400 });
  }

  try {
    // 1. Find the Educator profile linked to the teacherUserId
    const educator = await prisma.educator.findUnique({
      where: { userId: teacherUserId }, // Find educator using their associated User.id
      select: {
        id: true,
        companyId: true,
        // Now fetching role directly from Educator model
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

    const teacherInfo = {
      id: educator.id, // Educator ID
      name: educator.user?.name || 'N/A',
      email: educator.user?.email || 'N/A',
      role: educator.user.role, // Use role directly from Educator model
    };

    // 2. Fetch courses relevant to this educator.
    // A course is relevant if:
    // a) The educator is assigned to the course via CourseEducatorAssignment
    // OR
    // b) The course is linked to an academic level that the educator is assigned to.
    const assignedCourses = await prisma.course.findMany({
      where: {
        companyId: educator.companyId, // Ensure multi-tenancy: courses must belong to the same company
        
          {
            // Condition 1: Educator is assigned to this course via CourseEducatorAssignment
            CourseEducatorAssignment: { // Relation on Course model to CourseEducatorAssignment
              some: {
                educatorId: educator.id, // Filter by the current educator's ID
              },
            },
          },
          {
            // Condition 2: Course is linked to an AcademicLevel which the educator is assigned to
            academicLevels: { // This is the CourseAcademicLevel[] relation on Course
              some: {
                academicLevel: { // This is the AcademicLevel on CourseAcademicLevel
                  educatorAssignments: { // This is the EducatorAcademicLevelAssignment[] relation on AcademicLevel
                    some: {
                      educatorId: educator.id,
                    },
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        academicLevels: { // Include the academic levels associated with the course via CourseAcademicLevel
          select: {
            academicLevel: { // Select the actual AcademicLevel details
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
        CourseMaterial: { // Basic resource info (assuming it's named CourseMaterial as per schema)
          select: {
            id: true,
            title: true,
            type: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { title: 'asc' }, // Order by course title
    });

    const teacherClasses = assignedCourses.map(course => {
      // Determine the primary academic level for the course.
      // If a course can be linked to multiple, you might need a more sophisticated logic
      // or a 'primaryAcademicLevelId' field on the Course model.
      const primaryAcademicLevel = course.academicLevels.length > 0
        ? course.academicLevels[0].academicLevel
        : { id: 'N/A', name: 'No Academic Level', description: null };

      // Mock schedule and room for now, as these are not directly on Course model in schema
      // You'd typically get this from ClassSchedule model linked to the course.
      const mockSchedule = "Mon, Wed, Fri | 9:00 AM - 9:45 AM"; // Placeholder
      const mockRoom = "Room 101"; // Placeholder

      return {
        id: course.id,
        title: course.title, // Use 'title' as per new Course model
        description: course.description,
        code: course.code, // Include course code as per new Course model
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
        resources: course.CourseMaterial.map(m => ({ // Use CourseMaterial as per schema
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