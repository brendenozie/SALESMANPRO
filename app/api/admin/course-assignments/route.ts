import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET /api/course-assignments
// Fetches all course assignments, optionally filtered by courseId or companyId.
export async function GET(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const companyId = searchParams.get('companyId');

    const whereClause: any = {};

    if (courseId) {
      whereClause.courseId = courseId;
    } else if (companyId) {
      // If filtering by company, we need to find courses belonging to that company first
      const coursesInCompany = await prisma.course.findMany({
        where: { companyId: companyId },
        select: { id: true },
      });
      const courseIdsInCompany = coursesInCompany.map(c => c.id);
      whereClause.courseId = { in: courseIdsInCompany };
    } else {
      // For a multi-tenant app, it's safer to require companyId or courseId for a global view.
      // If neither is provided, we might return an error or all assignments (less secure).
      // For now, let's require companyId for the global view.
      return NextResponse.json({ message: "Either courseId or companyId is required to fetch course assignments." }, { status: 400 });
    }

    const courseAssignments = await prisma.courseAssignment.findMany({
      where: whereClause,
      include: {
        course: { // Include course details
          select: {
            id: true,
            title: true,
            instructor: { select: { user: { select: { name: true } } } },
            academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
          },
        },
        _count: { // Count submissions for this assignment
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc', // Order by due date
      },
    });

    // Transform the data to include flattened relations and calculated counts
    const response = courseAssignments.map((assignment) => {
      const totalSubmissions = assignment._count.submissions;
      const courseAcademicLevels = assignment.course?.academicLevels
        .map(al => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name }));

      return {
        id: assignment.id,
        courseId: assignment.courseId,
        courseTitle: assignment.course?.title || 'N/A',
        courseInstructorName: assignment.course?.instructor?.user?.name || 'N/A',
        courseAcademicLevels: courseAcademicLevels || [],
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        maxGrade: assignment.maxGrade,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        totalSubmissions: totalSubmissions,
      };
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching course assignments:", error);
    return NextResponse.json({ message: "Failed to fetch course assignments", error: error.message }, { status: 500 });
  }
}

// POST /api/course-assignments
// Creates a new CourseAssignment.
export async function POST(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const body = await request.json();
    const { courseId, title, description, dueDate, maxGrade } = body;

    // Basic validation
    if (!courseId || !title || !dueDate) {
      return NextResponse.json({ message: "Course ID, Title, and Due Date are required to create an assignment." }, { status: 400 });
    }

    // Validate courseId exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!existingCourse) {
      return NextResponse.json({ message: "Provided courseId does not exist." }, { status: 400 });
    }

    const newAssignment = await prisma.courseAssignment.create({
      data: {
        courseId,
        title,
        description,
        dueDate: new Date(dueDate), // Ensure dueDate is a Date object
        maxGrade,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: { select: { user: { select: { name: true } } } },
            academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
          },
        },
        _count: { select: { submissions: true } },
      },
    });

    // Transform response
    const responseData = {
      id: newAssignment.id,
      courseId: newAssignment.courseId,
      courseTitle: newAssignment.course?.title || 'N/A',
      courseInstructorName: newAssignment.course?.instructor?.user?.name || 'N/A',
      courseAcademicLevels: newAssignment.course?.academicLevels
        .map(al => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name })) || [],
      title: newAssignment.title,
      description: newAssignment.description,
      dueDate: newAssignment.dueDate,
      maxGrade: newAssignment.maxGrade,
      createdAt: newAssignment.createdAt,
      updatedAt: newAssignment.updatedAt,
      totalSubmissions: newAssignment._count.submissions,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course assignment:", error);
    return NextResponse.json({ message: "Failed to create course assignment", error: error.message }, { status: 500 });
  }
}
