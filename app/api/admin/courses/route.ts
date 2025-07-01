import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET /api/courses
// Fetches all courses for a given company, including related data and calculated counts.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ message: "Company ID is required to fetch courses." }, { status: 400 });
    }

    const courses = await prisma.course.findMany({
      where: { companyId },
      include: {
        instructor: { // Include instructor (Educator) details
          select: {
            id: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
        department: { // Include department details
          select: {
            id: true,
            name: true,
          },
        },
        academicLevels: { // Include the junction table
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
        .filter(Boolean) // Remove any nulls
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name }));

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        instructorId: course.instructorId,
        instructorName: course.instructor?.user?.name || 'N/A',
        instructorEmail: course.instructor?.user?.email || 'N/A',
        totalLessons: totalLessons, // Calculated
        rating: course.rating,
        studentsEnrolled: studentsEnrolled, // Calculated
        companyId: course.companyId,
        departmentId: course.departmentId,
        departmentName: course.department?.name || 'N/A',
        academicLevels: assignedAcademicLevels, // Array of assigned academic levels
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
// Creates a new Course, with optional instructor, department, and academic level assignments.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, instructorId, departmentId, companyId, rating, academicLevelIds } = body;

    // Basic validation
    if (!title || !companyId) {
      return NextResponse.json({ message: "Title and Company ID are required to create a course." }, { status: 400 });
    }

    // Check for uniqueness of course title within the company
    const existingCourse = await prisma.course.findUnique({
      where: {
        companyId_title: { // Using the @@unique compound index
          companyId: companyId,
          title: title,
        },
      },
    });

    if (existingCourse) {
      return NextResponse.json({ message: `A course with the title '${title}' already exists for this company.` }, { status: 409 });
    }

    // Validate instructorId if provided
    if (instructorId) {
      const existingInstructor = await prisma.educator.findUnique({
        where: { id: instructorId },
      });
      if (!existingInstructor) {
        return NextResponse.json({ message: "Provided instructorId does not exist." }, { status: 400 });
      }
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

    // Use a transaction for atomicity: create course and its academic level assignments
    const newCourse = await prisma.$transaction(async (prisma) => {
      const course = await prisma.course.create({
        data: {
          title,
          description,
          imageUrl,
          instructorId,
          rating,
          companyId,
          departmentId,
        },
      });

      if (academicLevelIds && academicLevelIds.length > 0) {
        const assignmentsData = academicLevelIds.map((academicLevelId: string) => ({
          courseId: course.id,
          academicLevelId: academicLevelId,
        }));
        await prisma.courseAcademicLevel.createMany({
          data: assignmentsData,
        });
      }

      return course;
    });

    // Fetch the newly created course with all its relations for a complete response
    const createdCourseWithRelations = await prisma.course.findUnique({
      where: { id: newCourse.id },
      include: {
        instructor: { select: { id: true, user: { select: { name: true, email: true } } } },
        department: { select: { id: true, name: true } },
        academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
        _count: { select: { enrollments: true, CourseMaterial: true } },
      },
    });

    if (!createdCourseWithRelations) {
      throw new Error("Failed to retrieve created course with relations.");
    }

    const responseData = {
      id: createdCourseWithRelations.id,
      title: createdCourseWithRelations.title,
      description: createdCourseWithRelations.description,
      imageUrl: createdCourseWithRelations.imageUrl,
      instructorId: createdCourseWithRelations.instructorId,
      instructorName: createdCourseWithRelations.instructor?.user?.name || 'N/A',
      instructorEmail: createdCourseWithRelations.instructor?.user?.email || 'N/A',
      totalLessons: createdCourseWithRelations._count.CourseMaterial,
      rating: createdCourseWithRelations.rating,
      studentsEnrolled: createdCourseWithRelations._count.enrollments,
      companyId: createdCourseWithRelations.companyId,
      departmentId: createdCourseWithRelations.departmentId,
      departmentName: createdCourseWithRelations.department?.name || 'N/A',
      academicLevels: createdCourseWithRelations.academicLevels
        .map(assignment => assignment.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name })),
      createdAt: createdCourseWithRelations.createdAt,
      updatedAt: createdCourseWithRelations.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('title')) {
      return NextResponse.json({ message: `A course with this title already exists for this company.` }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create course", error: error.message }, { status: 500 });
  }
}
