import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed



// GET /api/educators/[id]
// Fetches a single educator by ID, including associated User data, department,
// academic level assignments, and dynamically calculated counts.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const educator = await prisma.educator.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            emailVerified: true,
          },
        },
        Department: {
          select: {
            id: true,
            name: true,
          },
        },
        academicLevelAssignments: {
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
            classesScheduled: true,
            Exam: true,
            CourseMaterial: true,
            AttendanceRecord: true,
            createdDiscussionTopics: true,
            uploadedMaterials: true,
            assignmentSubmission: true,
            examSubmission: true,
            Grade: true,
            CourseEducatorAssignment: true,
          },
        },
      },
    });

    if (!educator) {
      return NextResponse.json({ message: "Educator not found" }, { status: 404 });
    }

    // Dynamically calculate totalStudents for this educator
    const totalStudents = 0; // Placeholder: Implement actual calculation if relation exists

    // Dynamically calculate totalCoursesTaught for this educator
    const totalCoursesTaught = educator._count.CourseEducatorAssignment;

    const assignedAcademicLevels = educator.academicLevelAssignments
      .map(assignment => assignment.academicLevel)
      .filter(Boolean)
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      .map(level => ({ id: level!.id, name: level!.name }));

    const responseData = {
      id: educator.id,
      userId: educator.userId,
      loginCode: educator.loginCode,
      name: educator.user?.name,
      email: educator.user?.email,
      profilePicture: educator.profilePicture || educator.user?.image,
      phone: educator.phone,
      bio: educator.bio,
      address: educator.address,
      companyId: educator.companyId,
      departmentId: educator.departmentId,
      departmentName: educator.Department?.name || 'N/A',
      academicLevels: assignedAcademicLevels,
      totalStudents: totalStudents, // Calculated
      totalCoursesTaught: totalCoursesTaught, // Calculated from CourseEducatorAssignment
      totalClassesScheduled: educator._count.classesScheduled,
      totalExamsCreated: educator._count.Exam,
      totalMaterialsUploaded: educator._count.CourseMaterial,
      totalAttendanceRecords: educator._count.AttendanceRecord,
      totalDiscussionTopics: educator._count.createdDiscussionTopics,
      totalUploadedMaterials: educator._count.uploadedMaterials,
      totalAssignmentSubmissions: educator._count.assignmentSubmission,
      totalExamSubmissions: educator._count.examSubmission,
      totalGradesRecorded: educator._count.Grade,
      createdAt: educator.createdAt,
      updatedAt: educator.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching educator with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch educator", error: error.message }, { status: 500 });
  }
}

// PATCH /api/educators/[id]
// Updates an existing Educator profile by ID, including user data, department,
// and academic level assignments.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await request.json();
    const { phone, bio, address, profilePicture, name, email, departmentId, academicLevelIds, ...rest } = body; // Removed totalStudents, totalCoursesTaught from direct payload

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for educator:", rest);
    }

    const existingEducator = await prisma.educator.findUnique({
      where: { id },
    });

    if (!existingEducator) {
      return NextResponse.json({ message: "Educator not found" }, { status: 404 });
    }

    // Validate departmentId if provided and it's changing
    if (departmentId !== undefined && departmentId !== existingEducator.departmentId) {
      if (departmentId !== null) { // Allow setting to null to unassign department
        const existingDepartment = await prisma.department.findUnique({
          where: { id: departmentId },
        });
        if (!existingDepartment) {
          return NextResponse.json({ message: "Provided departmentId does not exist." }, { status: 400 });
        }
      }
    }

    // Use a transaction for atomicity for complex updates
    const updatedEducator = await prisma.$transaction(async (tx) => {
      // Handle Academic Level Assignments
      if (academicLevelIds !== undefined) {
        // Validate all provided academicLevelIds exist and belong to the same company
        const existingAcademicLevels = await tx.academicLevel.findMany({
          where: {
            id: { in: academicLevelIds },
            companyId: existingEducator.companyId, // Assuming academic levels are company-specific
          },
          select: { id: true },
        });

        if (existingAcademicLevels.length !== academicLevelIds.length) {
          const foundIds = new Set(existingAcademicLevels.map(al => al.id));
          const notFoundIds = academicLevelIds.filter((id: string) => !foundIds.has(id));
          throw new Error(`One or more academic levels not found or do not belong to this company: ${notFoundIds.join(', ')}. Please ensure all provided academicLevelIds are valid.`);
        }

        // Delete existing assignments for this educator
        await tx.educatorAcademicLevelAssignment.deleteMany({
          where: { educatorId: id },
        });

        // Create new assignments
        if (academicLevelIds.length > 0) {
          const newAssignments = academicLevelIds.map((academicLevelId: string) => ({
            educatorId: id,
            academicLevelId: academicLevelId,
          }));
          await tx.educatorAcademicLevelAssignment.createMany({
            data: newAssignments,
          });
        }
      }

      // Prepare data for Educator update (direct fields)
      const educatorUpdateData: any = {};
      if (phone !== undefined) educatorUpdateData.phone = phone;
      if (bio !== undefined) educatorUpdateData.bio = bio;
      if (address !== undefined) educatorUpdateData.address = address;
      if (profilePicture !== undefined) educatorUpdateData.profilePicture = profilePicture;
      if (departmentId !== undefined) educatorUpdateData.departmentId = departmentId;
      // totalStudents and totalCoursesTaught are not updated directly via PATCH anymore

      // Perform the educator update for direct fields
      const updatedEducatorRecord = await tx.educator.update({
        where: { id },
        data: educatorUpdateData,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          Department: { select: { id: true, name: true } },
          academicLevelAssignments: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
        },
      });

      // Handle User model updates (name, email, profilePicture)
      if (name !== undefined || email !== undefined || profilePicture !== undefined) {
        const userUpdateData: any = {};
        if (name !== undefined) userUpdateData.name = name;
        if (email !== undefined) {
          if (email !== updatedEducatorRecord.user?.email) {
            const existingUserWithNewEmail = await tx.user.findUnique({ where: { email } });
            if (existingUserWithNewEmail && existingUserWithNewEmail.id !== updatedEducatorRecord.userId) {
              throw new Error("The provided email is already in use by another user.");
            }
          }
          userUpdateData.email = email;
        }
        if (profilePicture !== undefined) userUpdateData.image = profilePicture; // Update user's image if profilePicture is provided

        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id: updatedEducatorRecord.userId },
            data: userUpdateData,
          });
        }
      }
      return updatedEducatorRecord; // Return the updated educator record for the final response
    }); // End of transaction

    // Re-fetch the educator with all its relations and counts for the response
    const finalEducator = await prisma.educator.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        Department: { select: { id: true, name: true } },
        academicLevelAssignments: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
        _count: {
          select: {
            classesScheduled: true,
            Exam: true,
            CourseMaterial: true,
            AttendanceRecord: true,
            createdDiscussionTopics: true,
            uploadedMaterials: true,
            assignmentSubmission: true,
            examSubmission: true,
            Grade: true,
            CourseEducatorAssignment: true,
          },
        },
      },
    });

    if (!finalEducator) {
      throw new Error("Failed to retrieve updated educator with relations.");
    }

    // Dynamically calculate totalStudents for this educator
    const totalStudents = 0; // Placeholder: Implement actual calculation if relation exists

    // Dynamically calculate totalCoursesTaught for this educator
    const totalCoursesTaught = finalEducator._count.CourseEducatorAssignment;

    const finalAssignedAcademicLevels = finalEducator.academicLevelAssignments
      .map(assignment => assignment.academicLevel)
      .filter(Boolean)
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      .map(level => ({ id: level!.id, name: level!.name }));

    const responseData = {
      id: finalEducator.id,
      userId: finalEducator.userId,
      loginCode: finalEducator.loginCode,
      name: finalEducator.user?.name,
      email: finalEducator.user?.email,
      profilePicture: finalEducator.profilePicture || finalEducator.user?.image,
      phone: finalEducator.phone,
      bio: finalEducator.bio,
      address: finalEducator.address,
      companyId: finalEducator.companyId,
      departmentId: finalEducator.departmentId,
      departmentName: finalEducator.Department?.name || 'N/A',
      academicLevels: finalAssignedAcademicLevels,
      totalStudents: totalStudents, // Calculated
      totalCoursesTaught: totalCoursesTaught, // Calculated from CourseEducatorAssignment
      totalClassesScheduled: finalEducator._count.classesScheduled,
      totalExamsCreated: finalEducator._count.Exam,
      totalMaterialsUploaded: finalEducator._count.CourseMaterial,
      totalAttendanceRecords: finalEducator._count.AttendanceRecord,
      totalDiscussionTopics: finalEducator._count.createdDiscussionTopics,
      totalUploadedMaterials: finalEducator._count.uploadedMaterials,
      totalAssignmentSubmissions: finalEducator._count.assignmentSubmission,
      totalExamSubmissions: finalEducator._count.examSubmission,
      totalGradesRecorded: finalEducator._count.Grade,
      createdAt: finalEducator.createdAt,
      updatedAt: finalEducator.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating educator with ID ${id}:`, error);
    if (error.message.includes("already in use by another user")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update educator", error: error.message }, { status: 500 });
  }
}

// DELETE /api/educators/[id]
// Deletes an Educator profile by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const existingEducator = await prisma.educator.findUnique({
      where: { id },
    });

    if (!existingEducator) {
      return NextResponse.json({ message: "Educator not found" }, { status: 404 });
    }

    // Delete all associated EducatorAcademicLevelAssignment records
    await prisma.educatorAcademicLevelAssignment.deleteMany({
      where: { educatorId: id },
    });

    // Delete all associated CourseEducatorAssignment records
    await prisma.courseEducatorAssignment.deleteMany({
      where: { educatorId: id },
    });

    // Note: Other relations like 'coursesCreated', 'classesScheduled', 'Exam', etc.
    // might prevent deletion if not configured with onDelete actions in your schema.
    // Prisma will throw a P2003 error if linked records exist and onDelete is not set.

    const deletedEducator = await prisma.educator.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Educator deleted successfully", deletedId: deletedEducator.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting educator with ID ${id}:`, error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Cannot delete educator: They are linked to existing courses, classes, exams, materials, attendance records, discussions, or grades. Please reassign or delete associated records first." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete educator", error: error.message }, { status: 500 });
  }
}


