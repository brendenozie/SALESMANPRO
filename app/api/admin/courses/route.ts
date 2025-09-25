import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET /api/courses
// Fetches all courses for a given company, including related data and calculated counts.
export async function GET(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ message: "Company ID is required to fetch courses." }, { status: 400 });
    }

    const courses = await prisma.course.findMany({
      where: { companyId },
      include: {
        // REMOVED: direct 'instructor' include
        CourseEducatorAssignment: { // NEW: Include the junction table for educators
          include: {
            educator: { // Include the actual Educator details
              select: {
                id: true,
                user: {
                  select: { name: true, email: true },
                },
                // You might want to select other educator fields here if needed
              },
            },
          },
        },
        department: { // Include department details
          select: {
            id: true,
            name: true,
          },
        },
        academicLevels: { // Include the junction table for academic levels
          include: {
            academicLevel: { // Include the actual AcademicLevel details
              select: {
                id: true,
                name: true,
                sortOrder: true,
              },
            },
          },
        },
        _count: { // Include counts of related records for calculated fields
          select: {
            enrollments: true,
            CourseMaterial: true, // For totalLessons
          },
        },
      },
      orderBy: {
        title: 'asc', // Order courses alphabetically by title
      },
    });

    // Transform the data to include flattened relations and calculated fields
    const response = courses.map((course) => {
      const totalLessons = course._count.CourseMaterial;
      const studentsEnrolled = course._count.enrollments;

      // Extract and sort assigned academic levels
      const assignedAcademicLevels = course.academicLevels
        .map(assignment => assignment.academicLevel)
        .filter(Boolean) // Remove any nulls if academicLevel could be null (though unlikely with onDelete: Cascade)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name }));

      // NEW: Extract assigned educators
      const assignedEducators = course.CourseEducatorAssignment
        .map(assignment => ({
          id: assignment.educator.id,
          name: assignment.educator.user?.name || 'N/A',
          email: assignment.educator.user?.email || 'N/A',
          roleInCourse: assignment.roleInCourse || null, // Include the role
        }));

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        credits: course.credits, // Include credits
        code: course.code, // NEW: Include course code
        rating: course.rating,
        totalLessons: totalLessons, // Calculated
        studentsEnrolled: studentsEnrolled, // Calculated
        companyId: course.companyId,
        departmentId: course.departmentId,
        departmentName: course.department?.name || 'N/A',
        academicLevels: assignedAcademicLevels, // Array of assigned academic levels
        educators: assignedEducators, // NEW: Array of assigned educators
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ message: "Failed to fetch courses", error: error.message }, { status: 500 });
  }
}

// POST /api/courses
// Creates a new Course, with optional department, academic level, and educator assignments.
export async function POST(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const body = await request.json();
    // NEW: 'code' is required, 'educatorIds' replaces 'instructorId'
    const { title, description, imageUrl, code, credits, rating, departmentId, companyId, academicLevelIds, educatorIds } = body;

    // Basic validation
    if (!title || !companyId || !code) {
      return NextResponse.json({ message: "Title, Company ID, and Code are required to create a course." }, { status: 400 });
    }

    // Check for uniqueness of course code within the database
    const existingCourseByCode = await prisma.course.findUnique({
      where: { code: code },
    });

    if (existingCourseByCode) {
      return NextResponse.json({ message: `A course with the code '${code}' already exists.` }, { status: 409 });
    }

    // Validate departmentId if provided
    if (departmentId) {
      const existingDepartment = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!existingDepartment) {
        return NextResponse.json({ message: "Provided departmentId does not exist." }, { status: 400 });
      }
    }

    // Validate academicLevelIds if provided
    if (academicLevelIds && academicLevelIds.length > 0) {
      const existingAcademicLevels = await prisma.academicLevel.findMany({
        where: {
          id: { in: academicLevelIds },
          companyId: companyId, // Ensure academic levels belong to the same company
        },
        select: { id: true },
      });
      if (existingAcademicLevels.length !== academicLevelIds.length) {
        const foundIds = new Set(existingAcademicLevels.map(al => al.id));
        const notFoundIds = academicLevelIds.filter((id: string) => !foundIds.has(id));
        return NextResponse.json({ message: `One or more provided academicLevelIds are invalid or do not belong to this company: ${notFoundIds.join(', ')}` }, { status: 400 });
      }
    }

    // NEW: Validate educatorIds if provided
    if (educatorIds && educatorIds.length > 0) {
      const existingEducators = await prisma.educator.findMany({
        where: {
          id: { in: educatorIds },
          // Assuming educators are also linked to a company, add companyId filter if applicable
          // companyId: companyId,
        },
        select: { id: true },
      });
      if (existingEducators.length !== educatorIds.length) {
        const foundIds = new Set(existingEducators.map(e => e.id));
        const notFoundIds = educatorIds.filter((id: string) => !foundIds.has(id));
        return NextResponse.json({ message: `One or more provided educatorIds are invalid: ${notFoundIds.join(', ')}` }, { status: 400 });
      }
    }

    // Use a transaction for atomicity: create course and its assignments
    const newCourse = await prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          title,
          description,
          imageUrl,
          code, // NEW: Add code
          credits, // Add credits
          rating,
          companyId,
          departmentId,
          // REMOVED: instructorId
        },
      });

      // Create CourseAcademicLevel assignments
      if (academicLevelIds && academicLevelIds.length > 0) {
        const academicAssignmentsData = academicLevelIds.map((academicLevelId: string) => ({
          courseId: course.id,
          academicLevelId: academicLevelId,
        }));
        await tx.courseAcademicLevel.createMany({
          data: academicAssignmentsData,
        });
      }

      // NEW: Create CourseEducatorAssignment entries
      if (educatorIds && educatorIds.length > 0) {
        const educatorAssignmentsData = educatorIds.map((educatorId: string) => ({
          courseId: course.id,
          educatorId: educatorId,
          // roleInCourse: "Lead Educator", // Optional: set a default role or pass from frontend
        }));
        await tx.courseEducatorAssignment.createMany({
          data: educatorAssignmentsData,
        });
      }

      return course;
    });

    // Fetch the newly created course with all its relations for a complete response
    const createdCourseWithRelations = await prisma.course.findUnique({
      where: { id: newCourse.id },
      include: {
        CourseEducatorAssignment: { // NEW: Include junction table
          include: {
            educator: { select: { id: true, user: { select: { name: true, email: true } } } },
          },
        },
        department: { select: { id: true, name: true } },
        academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
        _count: { select: { enrollments: true, CourseMaterial: true } },
      },
    });

    if (!createdCourseWithRelations) {
      throw new Error("Failed to retrieve created course with relations.");
    }

    // Transform the response data
    const assignedAcademicLevelsResponse = createdCourseWithRelations.academicLevels
      .map(assignment => assignment.academicLevel)
      .filter(Boolean)
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      .map(level => ({ id: level!.id, name: level!.name }));

    const assignedEducatorsResponse = createdCourseWithRelations.CourseEducatorAssignment
      .map(assignment => ({
        id: assignment.educator.id,
        name: assignment.educator.user?.name || 'N/A',
        email: assignment.educator.user?.email || 'N/A',
        roleInCourse: assignment.roleInCourse || null,
      }));

    const responseData = {
      id: createdCourseWithRelations.id,
      title: createdCourseWithRelations.title,
      description: createdCourseWithRelations.description,
      imageUrl: createdCourseWithRelations.imageUrl,
      credits: createdCourseWithRelations.credits, // Include credits
      code: createdCourseWithRelations.code, // NEW: Include code
      rating: createdCourseWithRelations.rating,
      totalLessons: createdCourseWithRelations._count.CourseMaterial,
      studentsEnrolled: createdCourseWithRelations._count.enrollments,
      companyId: createdCourseWithRelations.companyId,
      departmentId: createdCourseWithRelations.departmentId,
      departmentName: createdCourseWithRelations.department?.name || 'N/A',
      academicLevels: assignedAcademicLevelsResponse,
      educators: assignedEducatorsResponse, // NEW: Array of educators
      createdAt: createdCourseWithRelations.createdAt,
      updatedAt: createdCourseWithRelations.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course:", error);
    // Updated error code check for unique 'code'
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
      return NextResponse.json({ message: `A course with the code already exists.` }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create course", error: error.message }, { status: 500 });
  }
}
