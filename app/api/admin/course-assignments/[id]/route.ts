import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET /api/course-assignments/[id]
// Fetches a single CourseAssignment by its ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const assignment = await prisma.courseAssignment.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: { select: { user: { select: { name: true } } } },
            academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ message: "Course assignment not found" }, { status: 404 });
    }

    // Transform response
    const responseData = {
      id: assignment.id,
      courseId: assignment.courseId,
      courseTitle: assignment.course?.title || 'N/A',
      courseInstructorName: assignment.course?.instructor?.user?.name || 'N/A',
      courseAcademicLevels: assignment.course?.academicLevels
        .map(al => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name })) || [],
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      maxGrade: assignment.maxGrade,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      totalSubmissions: assignment._count.submissions,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching course assignment with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch course assignment", error: error.message }, { status: 500 });
  }
}

// PATCH /api/course-assignments/[id]
// Updates an existing CourseAssignment by ID.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const body = await request.json();
    const { courseId, title, description, dueDate, maxGrade, ...rest } = body; // courseId is typically not changed after creation

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for course assignment:", rest);
    }

    const existingAssignment = await prisma.courseAssignment.findUnique({
      where: { id },
    });

    if (!existingAssignment) {
      return NextResponse.json({ message: "Course assignment not found" }, { status: 404 });
    }

    // If courseId is provided in PATCH, ensure it exists (though typically not changed)
    if (courseId !== undefined && courseId !== existingAssignment.courseId) {
      const newCourse = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!newCourse) {
        return NextResponse.json({ message: "Provided courseId does not exist for reassignment." }, { status: 400 });
      }
    }

    const updatedAssignment = await prisma.courseAssignment.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined, // Update only if provided
        maxGrade,
        courseId, // Update courseId if provided in body
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
      id: updatedAssignment.id,
      courseId: updatedAssignment.courseId,
      courseTitle: updatedAssignment.course?.title || 'N/A',
      courseInstructorName: updatedAssignment.course?.instructor?.user?.name || 'N/A',
      courseAcademicLevels: updatedAssignment.course?.academicLevels
        .map(al => al.academicLevel)
        .filter(Boolean)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map(level => ({ id: level!.id, name: level!.name })) || [],
      title: updatedAssignment.title,
      description: updatedAssignment.description,
      dueDate: updatedAssignment.dueDate,
      maxGrade: updatedAssignment.maxGrade,
      createdAt: updatedAssignment.createdAt,
      updatedAt: updatedAssignment.updatedAt,
      totalSubmissions: updatedAssignment._count.submissions,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating course assignment with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to update course assignment", error: error.message }, { status: 500 });
  }
}

// DELETE /api/course-assignments/[id]
// Deletes a CourseAssignment by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const existingAssignment = await prisma.courseAssignment.findUnique({
      where: { id },
    });

    if (!existingAssignment) {
      return NextResponse.json({ message: "Course assignment not found" }, { status: 404 });
    }

    // If AssignmentSubmission has onDelete: Cascade, submissions will be deleted automatically.
    // Otherwise, you might get a P2003 error if submissions exist.
    const deletedAssignment = await prisma.courseAssignment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Course assignment deleted successfully", deletedId: deletedAssignment.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting course assignment with ID ${id}:`, error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Cannot delete assignment: It has associated submissions. Please delete submissions first." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete course assignment", error: error.message }, { status: 500 });
  }
}
