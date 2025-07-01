import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET /api/educators/[id]
// Fetches a single educator by ID, including associated User data, calculated counts,
// and assigned academic levels.
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
        academicLevelAssignments: { // NEW: Include the junction table
          include: {
            academicLevel: { // NEW: Include the actual AcademicLevel details
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
            coursesCreated: true,
            Exam: true,
            CourseMaterial: true,
            AttendanceRecord: true,
            createdDiscussionTopics: true,
            uploadedMaterials: true,
          },
        },
      },
    });

    if (!educator) {
      return NextResponse.json({ message: "Educator not found" }, { status: 404 });
    }

    const totalStudents = 0;
    // await prisma.student.count({
    //   where: {
    //     courses: {
    //       some: {
    //         instructorId: educator.id,
    //       },
    //     },
    //   },
    // });

    // Extract and sort assigned academic levels
    const assignedAcademicLevels = educator.academicLevelAssignments
      .map(assignment => assignment.academicLevel)
      .filter(Boolean) // Filter out any nulls
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      .map(level => ({ id: level!.id, name: level!.name }));

    // Transform the data
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
      assignedAcademicLevels: assignedAcademicLevels, // NEW: Array of assigned academic levels
      totalStudents: totalStudents,
      totalCoursesTaught: educator._count.coursesCreated,
      totalClassesScheduled: educator._count.classesScheduled,
      totalExamsCreated: educator._count.Exam,
      totalMaterialsUploaded: educator._count.CourseMaterial,
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
// Updates an existing Educator profile by ID, including academic level assignments.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await request.json();
    // Destructure assignedAcademicLevelIds from the body
    const { phone, bio, address, profilePicture, departmentId, name, email, assignedAcademicLevelIds, ...rest } = body;

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for educator:", rest);
    }

    const existingEducator = await prisma.educator.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    if (!existingEducator) {
      return NextResponse.json({ message: "Educator not found" }, { status: 404 });
    }

    // Start a Prisma transaction to ensure atomicity for assignments and educator update
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Update associated User's name/email/image if provided
      if (name !== undefined || email !== undefined || profilePicture !== undefined) {
        const userUpdateData: any = {};
        if (name !== undefined) userUpdateData.name = name;
        if (email !== undefined) {
          if (email !== existingEducator.user?.email) { // Check if email is actually changing
            const existingUserWithNewEmail = await prisma.user.findUnique({ where: { email } });
            if (existingUserWithNewEmail && existingUserWithNewEmail.id !== existingEducator.userId) {
              throw new Error("The provided email is already in use by another user.");
            }
          }
          userUpdateData.email = email;
        }
        if (profilePicture !== undefined) userUpdateData.image = profilePicture; // Sync profile picture to User model too

        if (Object.keys(userUpdateData).length > 0) {
          await prisma.user.update({
            where: { id: existingEducator.userId },
            data: userUpdateData,
          });
        }
      }

      // 2. Handle Academic Level Assignments
      if (assignedAcademicLevelIds !== undefined) {
        // Validate all provided academicLevelIds exist
        const existingAcademicLevels = await prisma.academicLevel.findMany({
          where: {
            id: {
              in: assignedAcademicLevelIds,
            },
          },
          select: { id: true },
        });

        if (existingAcademicLevels.length !== assignedAcademicLevelIds.length) {
          const foundIds = new Set(existingAcademicLevels.map(al => al.id));
          const notFoundIds = assignedAcademicLevelIds.filter((id: string) => !foundIds.has(id));
          throw new Error(`One or more academic levels not found: ${notFoundIds.join(', ')}. Please ensure all provided academicLevelIds are valid.`);
        }

        // Delete existing assignments for this educator
        await prisma.educatorAcademicLevelAssignment.deleteMany({
          where: { educatorId: id },
        });

        // Create new assignments
        if (assignedAcademicLevelIds.length > 0) {
          const newAssignments = assignedAcademicLevelIds.map((academicLevelId: string) => ({
            educatorId: id,
            academicLevelId: academicLevelId,
          }));
          await prisma.educatorAcademicLevelAssignment.createMany({
            data: newAssignments
          });
        }
      }

      // 3. Update Educator's other fields
      const educatorUpdateData: any = {};
      if (phone !== undefined) educatorUpdateData.phone = phone;
      if (bio !== undefined) educatorUpdateData.bio = bio;
      if (address !== undefined) educatorUpdateData.address = address;
      if (profilePicture !== undefined) educatorUpdateData.profilePicture = profilePicture;
      if (departmentId !== undefined) educatorUpdateData.departmentId = departmentId;

      const updatedEducator = await prisma.educator.update({
        where: { id },
        data: educatorUpdateData,
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
          Department: {
            select: { id: true, name: true },
          },
          academicLevelAssignments: { // Re-include for the response
            include: {
              academicLevel: {
                select: { id: true, name: true, sortOrder: true },
              },
            },
          },
        },
      });

      return updatedEducator;
    }); // End of transaction

    // Re-fetch to get the most current state after potential user update and assignments
    const finalEducator = await prisma.educator.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        Department: {
          select: { id: true, name: true },
        },
        academicLevelAssignments: {
          include: {
            academicLevel: {
              select: { id: true, name: true, sortOrder: true },
            },
          },
        },
        _count: {
          select: {
            classesScheduled: true,
            coursesCreated: true,
            Exam: true,
            CourseMaterial: true,
            AttendanceRecord: true,
            createdDiscussionTopics: true,
            uploadedMaterials: true,
          },
        },
      },
    });

    const totalStudents = 0;
    
    // await prisma.student.count({
    //   where: {
    //     courses: {
    //       some: {
    //         instructorId: id,
    //       },
    //     },
    //   },
    // });

    const assignedAcademicLevels = finalEducator!.academicLevelAssignments
      .map(assignment => assignment.academicLevel)
      .filter(Boolean)
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      .map(level => ({ id: level!.id, name: level!.name }));

    const responseData = {
      id: finalEducator!.id,
      userId: finalEducator!.userId,
      loginCode: finalEducator!.loginCode,
      name: finalEducator!.user?.name,
      email: finalEducator!.user?.email,
      profilePicture: finalEducator!.profilePicture || finalEducator!.user?.image,
      phone: finalEducator!.phone,
      bio: finalEducator!.bio,
      address: finalEducator!.address,
      companyId: finalEducator!.companyId,
      departmentId: finalEducator!.departmentId,
      departmentName: finalEducator!.Department?.name || 'N/A',
      assignedAcademicLevels: assignedAcademicLevels,
      totalStudents: totalStudents,
      totalCoursesTaught: finalEducator!._count.coursesCreated,
      totalClassesScheduled: finalEducator!._count.classesScheduled,
      totalExamsCreated: finalEducator!._count.Exam,
      totalMaterialsUploaded: finalEducator!._count.CourseMaterial,
      createdAt: finalEducator!.createdAt,
      updatedAt: finalEducator!.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating educator with ID ${id}:`, error);
    // Handle unique constraint error for email if it's the cause of the transaction failure
    if (error.message.includes("The provided email is already in use")) {
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

    // When deleting an Educator, the onDelete: Cascade on EducatorAcademicLevelAssignment
    // will automatically delete associated assignment records.
    // However, other relations (Courses, Classes, Exams, etc.) might prevent deletion
    // if not configured with onDelete actions in your schema.

    const deletedEducator = await prisma.educator.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Educator deleted successfully", deletedId: deletedEducator.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting educator with ID ${id}:`, error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Cannot delete educator: They are linked to existing courses, classes, exams, or other records. Please reassign or delete associated records first." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete educator", error: error.message }, { status: 500 });
  }
}
