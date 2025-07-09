import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET /api/students/[id]
// Fetches a single student by ID, including associated User data, academic levels, and calculated counts.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const student = await prisma.student.findUnique({
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
        parent: {
          select: {
            id: true,
            phone: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        // NEW: Include StudentAcademicLevel to get academic level details via the junction table
        StudentAcademicLevel: {
          include: {
            academicLevel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrolledCourses: true,
            assignmentSubmission: true, // Renamed from 'submissions'
            AttendanceRecord: true,
            ExamSubmission: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Transform the data to match the UI's StudentType
    const academicLevelsResponse = student.StudentAcademicLevel.map(sal => ({
      id: sal.academicLevel.id,
      name: sal.academicLevel.name,
    }));

    const responseData = {
      id: student.id,
      userId: student.userId,
      loginCode: student.loginCode,
      name: student.user?.name,
      email: student.user?.email,
      profilePicture: student.profilePicture || student.user?.image,
      phone: student.phone,
      bio: student.bio,
      address: student.address,
      companyId: student.companyId,
      // studentGrade removed as it's no longer a direct field
      parentId: student.parentId,
      parentName: student.parent?.user.name,
      parentEmail: student.parent?.user.email,
      parentPhone: student.parent?.phone,
      academicLevels: academicLevelsResponse, // Changed to array
      totalCourses: student._count.enrolledCourses,
      completedCourses: 0, // Not stored directly in model, set to 0 for consistency with GET /students
      certificatesEarned: 0, // Not stored directly in model, set to 0 for consistency with GET /students
      averageProgress: 0.0, // Not stored directly in model, set to 0.0 for consistency with GET /students
      totalAssignmentSubmissions: student._count.assignmentSubmission, // Renamed
      totalAttendanceRecords: student._count.AttendanceRecord,
      totalExamSubmissions: student._count.ExamSubmission,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching student with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch student", error: error.message }, { status: 500 });
  }
}

// PATCH /api/students/[id]
// Updates an existing Student profile by ID, including managing academic level assignments.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await request.json();
    // Removed studentGrade from destructuring as it's no longer a direct field
    const { phone, bio, address, profilePicture, name, email, loginCode, parentId, academicLevelId, ...rest } = body;

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for student:", rest);
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Validate ParentId if provided and it's changing
    if (parentId !== undefined && parentId !== existingStudent.parentId) {
      if (parentId !== null) { // Allow setting to null to unassign parent
        const existingParent = await prisma.parent.findUnique({
          where: { id: parentId },
        });
        if (!existingParent) {
          return NextResponse.json({ message: "Provided parentId does not exist." }, { status: 400 });
        }
      }
    }

    // Handle academicLevelId update via StudentAcademicLevel junction
    if (academicLevelId !== undefined) {
      // If a new academicLevelId is provided (not null/empty string)
      if (academicLevelId) {
        const existingAcademicLevel = await prisma.academicLevel.findUnique({
          where: { id: academicLevelId },
        });
        if (!existingAcademicLevel) {
          return NextResponse.json({ message: "Provided academicLevelId does not exist." }, { status: 400 });
        }

        // Use a transaction for atomicity: delete existing links, then create new one
        await prisma.$transaction(async (tx) => {
          // Delete all existing academic level links for this student
          await tx.studentAcademicLevel.deleteMany({
            where: { studentId: existingStudent.id },
          });
          // Create the new link
          await tx.studentAcademicLevel.create({
            data: {
              studentId: existingStudent.id,
              academicLevelId: academicLevelId,
            },
          });
        });
      } else { // academicLevelId is null or empty string, meaning unassign all academic levels
        await prisma.studentAcademicLevel.deleteMany({
          where: { studentId: existingStudent.id },
        });
      }
    }

    // Prepare data for Student update (only direct fields on Student model)
    const studentUpdateData: any = {};
    if (phone !== undefined) studentUpdateData.phone = phone;
    if (bio !== undefined) studentUpdateData.bio = bio;
    if (address !== undefined) studentUpdateData.address = address;
    if (profilePicture !== undefined) studentUpdateData.profilePicture = profilePicture;
    if (parentId !== undefined) studentUpdateData.parentId = parentId;

    // Perform the student update for direct fields
    // Note: academicLevelId is handled separately via the junction table logic above
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: studentUpdateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        parent: { // Include parent for response
          select: {
            id: true, phone: true,
            user: {
              select: {
                id: true, name: true, email: true, phone: true
              }
            }
          },
        },
        // Include the junction table for academic levels in the response
        StudentAcademicLevel: {
          include: {
            academicLevel: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Handle User model updates (name, email, profilePicture)
    if (name !== undefined || email !== undefined || profilePicture !== undefined) {
      const userUpdateData: any = {};
      if (name !== undefined) userUpdateData.name = name;
      if (email !== undefined) {
        if (email !== updatedStudent.user?.email) {
          const existingUserWithNewEmail = await prisma.user.findUnique({ where: { email } });
          if (existingUserWithNewEmail && existingUserWithNewEmail.id !== updatedStudent.userId) {
            return NextResponse.json({ message: "The provided email is already in use by another user." }, { status: 409 });
          }
        }
        userUpdateData.email = email;
      }
      if (profilePicture !== undefined) userUpdateData.image = profilePicture; // Update user's image if profilePicture is provided

      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: updatedStudent.userId },
          data: userUpdateData,
        });
      }
    }

    // Fetch the final student data with all relations for the response
    // This re-fetches to ensure consistency after all updates (Student, User, StudentAcademicLevel)
    const finalStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        parent: {
          select: {
            id: true, phone: true,
            user: {
              select: {
                id: true, name: true, email: true, phone: true
              }
            }
          },
        },
        StudentAcademicLevel: { // Include the junction table for final response
          include: {
            academicLevel: { // And the academic level through it
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            enrolledCourses: true,
            assignmentSubmission: true, // Renamed
            AttendanceRecord: true,
            ExamSubmission: true,
          },
        },
      },
    });

    // Transform the final data for the response
    const finalAcademicLevelsResponse = finalStudent?.StudentAcademicLevel.map(sal => ({
      id: sal.academicLevel.id,
      name: sal.academicLevel.name,
    })) || [];

    const responseData = {
      id: finalStudent!.id,
      userId: finalStudent!.userId,
      loginCode: finalStudent!.loginCode,
      name: finalStudent!.user?.name,
      email: finalStudent!.user?.email,
      profilePicture: finalStudent!.profilePicture || finalStudent!.user?.image,
      phone: finalStudent!.phone,
      bio: finalStudent!.bio,
      address: finalStudent!.address,
      companyId: finalStudent!.companyId,
      // studentGrade removed
      parentId: finalStudent!.parentId,
      parentName: finalStudent!.parent?.user.name,
      parentEmail: finalStudent!.parent?.user.email,
      parentPhone: finalStudent!.parent?.phone,
      academicLevels: finalAcademicLevelsResponse, // Changed to array
      totalCourses: finalStudent!._count.enrolledCourses,
      completedCourses: 0, // Not stored directly
      certificatesEarned: 0, // Not stored directly
      averageProgress: 0.0, // Not stored directly
      totalAssignmentSubmissions: finalStudent!._count.assignmentSubmission, // Renamed
      totalAttendanceRecords: finalStudent!._count.AttendanceRecord,
      totalExamSubmissions: finalStudent!._count.ExamSubmission,
      createdAt: finalStudent!.createdAt,
      updatedAt: finalStudent!.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating student with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to update student", error: error.message }, { status: 500 });
  }
}

// DELETE /api/students/[id]
// Deletes a Student profile by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Before deleting the student, delete all associated StudentAcademicLevel entries
    await prisma.studentAcademicLevel.deleteMany({
      where: { studentId: id },
    });

    const deletedStudent = await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Student deleted successfully", deletedId: deletedStudent.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting student with ID ${id}:`, error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Cannot delete student: They are linked to existing enrollments, submissions, or other records. Please reassign or delete associated records first." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete student", error: error.message }, { status: 500 });
  }
}
