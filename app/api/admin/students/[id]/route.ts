import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET /api/students/[id]
// Fetches a single student by ID, including associated User data and calculated counts.
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
        parent: { // NEW: Include parent details
          select: {
            id: true,
            phone: true,
          },
          include: {
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
        _count: {
          select: {
            enrolledCourses: true,
            submissions: true,
            AttendanceRecord: true,
            ExamSubmission: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Transform the data
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
      studentGrade: student.studentGrade,
      parentId: student.parentId, // NEW: Include parentId
      parentName: student.parent?.user.name, // NEW: Flatten parent name
      parentEmail: student.parent?.user.email, // NEW: Flatten parent email
      parentPhone: student.parent?.phone, // NEW: Flatten parent phone
      totalCourses: student._count.enrolledCourses,
      completedCourses: student.completedCourses,
      certificatesEarned: student.certificatesEarned,
      averageProgress: student.averageProgress,
      totalSubmissions: student._count.submissions,
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
// Updates an existing Student profile by ID.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await request.json();
    const { phone, bio, address, profilePicture, studentGrade, name, email, loginCode, parentId, ...rest } = body; // NEW: parentId

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

    // Prepare data for Student update
    const studentUpdateData: any = {};
    if (phone !== undefined) studentUpdateData.phone = phone;
    if (bio !== undefined) studentUpdateData.bio = bio;
    if (address !== undefined) studentUpdateData.address = address;
    if (profilePicture !== undefined) studentUpdateData.profilePicture = profilePicture;
    if (studentGrade !== undefined) studentUpdateData.studentGrade = studentGrade;
    if (parentId !== undefined) studentUpdateData.parentId = parentId; // NEW: Allow updating parentId

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: studentUpdateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        parent: { // NEW: Include parent for response
          select: { id: true, phone: true },
          include: {
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
      },
    });

    if (name !== undefined || email !== undefined) {
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
      if (profilePicture !== undefined) userUpdateData.image = profilePicture;

      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: updatedStudent.userId },
          data: userUpdateData,
        });
      }
    }

    const finalStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        parent: { // NEW: Include parent for final response
          select: { id: true, phone: true },
          include: {
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
        _count: {
          select: {
            enrolledCourses: true,
            submissions: true,
            AttendanceRecord: true,
            ExamSubmission: true,
          },
        },
      },
    });

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
      studentGrade: finalStudent!.studentGrade,
      parentId: finalStudent!.parentId,
      parentName: finalStudent!.parent?.user.name,
      parentEmail: finalStudent!.parent?.user.email,
      parentPhone: finalStudent!.parent?.phone,
      totalCourses: finalStudent!._count.enrolledCourses,
      completedCourses: finalStudent!.completedCourses,
      certificatesEarned: finalStudent!.certificatesEarned,
      averageProgress: finalStudent!.averageProgress,
      totalSubmissions: finalStudent!._count.submissions,
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
