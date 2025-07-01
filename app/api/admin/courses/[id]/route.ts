import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET /api/courses/[id]
// Fetches a single course by ID, including related data and calculated counts.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        academicLevels: {
          include: {
            academicLevel: {
              select: {
                id: true,
                name: true,
                sortOrder: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            CourseMaterial: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    const totalLessons = course._count.CourseMaterial;
    const studentsEnrolled = course._count.enrollments;

    const assignedAcademicLevels = course.academicLevels
      .map(assignment => assignment.academicLevel)
      .filter(Boolean)
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      .map(level => ({ id: level!.id, name: level!.name }));

    const responseData = {
      id: course.id,
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl,
      instructorId: course.instructorId,
      instructorName: course.instructor?.user?.name || 'N/A',
      instructorEmail: course.instructor?.user?.email || 'N/A',
      totalLessons: totalLessons,
      rating: course.rating,
      studentsEnrolled: studentsEnrolled,
      companyId: course.companyId,
      departmentId: course.departmentId,
      departmentName: course.department?.name || 'N/A',
      academicLevels: assignedAcademicLevels,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching course with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch course", error: error.message }, { status: 500 });
  }
}

// PATCH /api/courses/[id]
// Updates an existing Course, including its academic level assignments.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await request.json();
    const { title, description, imageUrl, instructorId, departmentId, rating, academicLevelIds, ...rest } = body;

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for course:", rest);
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // Check for uniqueness of course title if it's being updated
    if (title !== undefined && title !== existingCourse.title) {
      const duplicateCheck = await prisma.course.findUnique({
        where: {
          companyId_title: {
            companyId: existingCourse.companyId,
            title: title,
          },
        },
      });
      if (duplicateCheck) {
        return NextResponse.json({ message: `A course with the title '${title}' already exists for this company.` }, { status: 409 });
      }
    }

    // Validate instructorId if provided and it's changing
    if (instructorId !== undefined && instructorId !== existingCourse.instructorId) {
      if (instructorId !== null) { // Allow setting to null to unassign instructor
        const existingInstructor = await prisma.educator.findUnique({
          where: { id: instructorId },
        });
        if (!existingInstructor) {
          return NextResponse.json({ message: "Provided instructorId does not exist." }, { status: 400 });
        }
      }
    }

    // Validate departmentId if provided and it's changing
    if (departmentId !== undefined && departmentId !== existingCourse.departmentId) {
      if (departmentId !== null) { // Allow setting to null
        const existingDepartment = await prisma.department.findUnique({
          where: { id: departmentId },
        });
        if (!existingDepartment) {
          return NextResponse.json({ message: "Provided departmentId does not exist." }, { status: 400 });
        }
      }
    }

    // Use a transaction for atomicity: update course and its academic level assignments
    const result = await prisma.$transaction(async (prisma) => {
      // Handle Academic Level Assignments
      if (academicLevelIds !== undefined) {
        // Validate all provided academicLevelIds exist and belong to the same company
        const existingAcademicLevels = await prisma.academicLevel.findMany({
          where: {
            id: { in: academicLevelIds },
            companyId: existingCourse.companyId,
          },
          select: { id: true },
        });

        if (existingAcademicLevels.length !== academicLevelIds.length) {
          const foundIds = new Set(existingAcademicLevels.map(al => al.id));
          const notFoundIds = academicLevelIds.filter((id: string) => !foundIds.has(id));
          throw new Error(`One or more academic levels not found or do not belong to this company: ${notFoundIds.join(', ')}. Please ensure all provided academicLevelIds are valid.`);
        }

        // Delete existing assignments for this course
        await prisma.courseAcademicLevel.deleteMany({
          where: { courseId: id },
        });

        // Create new assignments
        if (academicLevelIds.length > 0) {
          const newAssignments = academicLevelIds.map((academicLevelId: string) => ({
            courseId: id,
            academicLevelId: academicLevelId,
          }));
          await prisma.courseAcademicLevel.createMany({
            data: newAssignments,
          });
        }
      }

      // Update Course's direct fields
      const courseUpdateData: any = {};
      if (title !== undefined) courseUpdateData.title = title;
      if (description !== undefined) courseUpdateData.description = description;
      if (imageUrl !== undefined) courseUpdateData.imageUrl = imageUrl;
      if (instructorId !== undefined) courseUpdateData.instructorId = instructorId;
      if (departmentId !== undefined) courseUpdateData.departmentId = departmentId;
      if (rating !== undefined) courseUpdateData.rating = rating;

      const updatedCourse = await prisma.course.update({
        where: { id },
        data: courseUpdateData,
      });

      return updatedCourse;
    }); // End of transaction

    // Re-fetch the course with all its relations and counts for the response
    const finalCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, user: { select: { name: true, email: true } } } },
        department: { select: { id: true, name: true } },
        academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
        _count: { select: { enrollments: true, CourseMaterial: true } },
      },
    });

    if (!finalCourse) {
      throw new Error("Failed to retrieve updated course with relations.");
    }

    const totalLessons = finalCourse._count.CourseMaterial;
    const studentsEnrolled = finalCourse._count.enrollments;

    const assignedAcademicLevels = finalCourse.academicLevels
      .map(assignment => assignment.academicLevel)
      .filter(Boolean)
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      .map(level => ({ id: level!.id, name: level!.name }));

    const responseData = {
      id: finalCourse.id,
      title: finalCourse.title,
      description: finalCourse.description,
      imageUrl: finalCourse.imageUrl,
      instructorId: finalCourse.instructorId,
      instructorName: finalCourse.instructor?.user?.name || 'N/A',
      instructorEmail: finalCourse.instructor?.user?.email || 'N/A',
      totalLessons: totalLessons,
      rating: finalCourse.rating,
      studentsEnrolled: studentsEnrolled,
      companyId: finalCourse.companyId,
      departmentId: finalCourse.departmentId,
      departmentName: finalCourse.department?.name || 'N/A',
      academicLevels: assignedAcademicLevels,
      createdAt: finalCourse.createdAt,
      updatedAt: finalCourse.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating course with ID ${id}:`, error);
    if (error.message.includes("already exists for this company")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update course", error: error.message }, { status: 500 });
  }
}

// DELETE /api/courses/[id]
// Deletes a Course by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // When deleting a Course, the onDelete: Cascade on CourseAcademicLevel
    // will automatically delete associated assignment records.
    // However, other relations (CourseAssignment, ClassSchedule, CourseEnrollment, Exam, CourseMaterial, DiscussionTopic)
    // might prevent deletion if not configured with onDelete actions in your schema.
    // Prisma will throw a P2003 error if linked records exist and onDelete is not set.

    const deletedCourse = await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Course deleted successfully", deletedId: deletedCourse.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting course with ID ${id}:`, error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Cannot delete course: It is linked to existing assignments, schedules, enrollments, exams, materials, or discussions. Please delete or reassign associated records first." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete course", error: error.message }, { status: 500 });
  }
}
