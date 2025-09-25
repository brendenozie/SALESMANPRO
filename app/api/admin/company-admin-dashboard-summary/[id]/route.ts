import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET /api/courses/[id]
// Fetches a single course by ID, including related data and calculated counts.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        // REMOVED: direct 'instructor' include as per new schema
        CourseEducatorAssignment: { // NEW: Include the junction table for educators
          include: {
            educator: { // Include the actual Educator details
              select: {
                id: true,
                user: {
                  select: { name: true, email: true },
                },
              },
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
            assignmentSubmission: true, // Renamed from 'submissions'
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

    // NEW: Extract assigned educators
    const assignedEducators = course.CourseEducatorAssignment
      .map(assignment => ({
        id: assignment.educator.id,
        name: assignment.educator.user?.name || 'N/A',
        email: assignment.educator.user?.email || 'N/A',
        roleInCourse: assignment.roleInCourse || null, // Include the role
      }));

    const responseData = {
      id: course.id,
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl,
      credits: course.credits, // NEW: Include credits
      code: course.code, // NEW: Include code
      rating: course.rating,
      totalLessons: totalLessons,
      studentsEnrolled: studentsEnrolled,
      companyId: course.companyId,
      departmentId: course.departmentId,
      departmentName: course.department?.name || 'N/A',
      academicLevels: assignedAcademicLevels,
      educators: assignedEducators, // NEW: Array of assigned educators
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
// Updates an existing Course, including its academic level and educator assignments.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const body = await request.json();
    // NEW: 'code' and 'credits' are now direct fields. 'educatorIds' replaces 'instructorId'.
    const { title, description, imageUrl, code, credits, departmentId, rating, academicLevelIds, educatorIds, ...rest } = body;

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for course:", rest);
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // Check for uniqueness of course code if it's being updated
    if (code !== undefined && code !== existingCourse.code) {
      const duplicateCheck = await prisma.course.findUnique({
        where: { code: code },
      });
      if (duplicateCheck) {
        return NextResponse.json({ message: `A course with the code '${code}' already exists.` }, { status: 409 });
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

    // Use a transaction for atomicity: update course and its assignments
    const result = await prisma.$transaction(async (tx) => {
      // Handle Academic Level Assignments
      if (academicLevelIds !== undefined) {
        // Validate all provided academicLevelIds exist and belong to the same company
        const existingAcademicLevels = await tx.academicLevel.findMany({
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

        // Delete existing academic level assignments for this course
        await tx.courseAcademicLevel.deleteMany({
          where: { courseId: id },
        });

        // Create new academic level assignments
        if (academicLevelIds.length > 0) {
          const newAcademicAssignments = academicLevelIds.map((academicLevelId: string) => ({
            courseId: id,
            academicLevelId: academicLevelId,
          }));
          await tx.courseAcademicLevel.createMany({
            data: newAcademicAssignments,
          });
        }
      }

      // NEW: Handle Educator Assignments
      if (educatorIds !== undefined) {
        // Validate all provided educatorIds exist
        const existingEducators = await tx.educator.findMany({
          where: {
            id: { in: educatorIds },
            // Add companyId filter here if educators are also tied to a company
            // companyId: existingCourse.companyId,
          },
          select: { id: true },
        });

        if (existingEducators.length !== educatorIds.length) {
          const foundIds = new Set(existingEducators.map(e => e.id));
          const notFoundIds = educatorIds.filter((id: string) => !foundIds.has(id));
          throw new Error(`One or more educators not found: ${notFoundIds.join(', ')}. Please ensure all provided educatorIds are valid.`);
        }

        // Delete existing educator assignments for this course
        await tx.courseEducatorAssignment.deleteMany({
          where: { courseId: id },
        });

        // Create new educator assignments
        if (educatorIds.length > 0) {
          const newEducatorAssignments = educatorIds.map((educatorId: string) => ({
            courseId: id,
            educatorId: educatorId,
            // roleInCourse: "Lead Educator", // You might want to pass this from frontend
          }));
          await tx.courseEducatorAssignment.createMany({
            data: newEducatorAssignments,
          });
        }
      }

      // Update Course's direct fields
      const courseUpdateData: any = {};
      if (title !== undefined) courseUpdateData.title = title;
      if (description !== undefined) courseUpdateData.description = description;
      if (imageUrl !== undefined) courseUpdateData.imageUrl = imageUrl;
      if (code !== undefined) courseUpdateData.code = code; // NEW: Update code
      if (credits !== undefined) courseUpdateData.credits = credits; // NEW: Update credits
      // REMOVED: instructorId from direct update
      if (departmentId !== undefined) courseUpdateData.departmentId = departmentId;
      if (rating !== undefined) courseUpdateData.rating = rating;

      const updatedCourse = await tx.course.update({
        where: { id },
        data: courseUpdateData,
      });

      return updatedCourse;
    }); // End of transaction

    // Re-fetch the course with all its relations and counts for the response
    const finalCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        CourseEducatorAssignment: { // NEW: Include junction table for final response
          include: {
            educator: { select: { id: true, user: { select: { name: true, email: true } } } },
          },
        },
        department: { select: { id: true, name: true } },
        academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
        _count: {
          select: {
            enrollments: true,
            CourseMaterial: true,
            assignmentSubmission: true, // Renamed
          },
        },
      },
    });

    if (!finalCourse) {
      throw new Error("Failed to retrieve updated course with relations.");
    }

    // Transform the final data for the response
    const finalAssignedAcademicLevels = finalCourse.academicLevels
      .map(assignment => assignment.academicLevel)
      .filter(Boolean)
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      .map(level => ({ id: level!.id, name: level!.name }));

    const finalAssignedEducators = finalCourse.CourseEducatorAssignment
      .map(assignment => ({
        id: assignment.educator.id,
        name: assignment.educator.user?.name || 'N/A',
        email: assignment.educator.user?.email || 'N/A',
        roleInCourse: assignment.roleInCourse || null,
      }));

    const responseData = {
      id: finalCourse.id,
      title: finalCourse.title,
      description: finalCourse.description,
      imageUrl: finalCourse.imageUrl,
      credits: finalCourse.credits, // NEW: Include credits
      code: finalCourse.code, // NEW: Include code
      rating: finalCourse.rating,
      totalLessons: finalCourse._count.CourseMaterial,
      studentsEnrolled: finalCourse._count.enrollments,
      companyId: finalCourse.companyId,
      departmentId: finalCourse.departmentId,
      departmentName: finalCourse.department?.name || 'N/A',
      academicLevels: finalAssignedAcademicLevels,
      educators: finalAssignedEducators, // NEW: Array of educators
      createdAt: finalCourse.createdAt,
      updatedAt: finalCourse.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating course with ID ${id}:`, error);
    // Updated error message for unique 'code' instead of 'title'
    if (error.message.includes("A course with the code")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update course", error: error.message }, { status: 500 });
  }
}

// DELETE /api/courses/[id]
// Deletes a Course by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

const { id } = params;

  try {
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // When deleting a Course, the onDelete: Cascade on CourseAcademicLevel and CourseEducatorAssignment
    // will automatically delete associated assignment records.
    // Other relations (CourseAssignment, ClassSchedule, CourseEnrollment, Exam, CourseMaterial, DiscussionTopic)
    // might prevent deletion if not configured with onDelete actions in your schema.
    // Prisma will throw a P2003 error if linked records exist and onDelete is not set.

    // No explicit deletion of junction tables needed here due to onDelete: Cascade in schema

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
