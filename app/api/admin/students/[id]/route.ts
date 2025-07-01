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
      loginCode: student.loginCode, // Include the new loginCode
      name: student.user?.name,
      email: student.user?.email,
      profilePicture: student.profilePicture || student.user?.image,
      phone: student.phone,
      bio: student.bio,
      address: student.address,
      companyId: student.companyId,
      studentGrade: student.studentGrade,
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
    // Exclude loginCode from direct update via PATCH
    const { phone, bio, address, profilePicture, studentGrade, name, email, loginCode, ...rest } = body;

    // Check for any unexpected fields
    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for student:", rest);
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Prepare data for Student update
    const studentUpdateData: any = {};
    if (phone !== undefined) studentUpdateData.phone = phone;
    if (bio !== undefined) studentUpdateData.bio = bio;
    if (address !== undefined) studentUpdateData.address = address;
    if (profilePicture !== undefined) studentUpdateData.profilePicture = profilePicture;
    if (studentGrade !== undefined) studentUpdateData.studentGrade = studentGrade;
    // Note: totalCourses, completedCourses, certificatesEarned, averageProgress are not directly updated via PATCH
    // They are typically derived or updated through other actions (e.g., course completion).

    // Perform Student update
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: studentUpdateData,
      include: {
        user: { // Include user for response
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    // Optionally update associated User's name/email if provided (careful with email uniqueness)
    if (name !== undefined || email !== undefined) {
      const userUpdateData: any = {};
      if (name !== undefined) userUpdateData.name = name;
      if (email !== undefined) {
        // Check if new email is already taken by another user if it's changing
        if (email !== updatedStudent.user?.email) {
          const existingUserWithNewEmail = await prisma.user.findUnique({ where: { email } });
          if (existingUserWithNewEmail && existingUserWithNewEmail.id !== updatedStudent.userId) {
            return NextResponse.json({ message: "The provided email is already in use by another user." }, { status: 409 });
          }
        }
        userUpdateData.email = email;
      }
      if (profilePicture !== undefined) userUpdateData.image = profilePicture; // Sync profile picture to User model too

      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: updatedStudent.userId },
          data: userUpdateData,
        });
      }
    }

    // Re-fetch to get the most current state after potential user update
    const finalStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
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
      loginCode: finalStudent!.loginCode, // Include the new loginCode
      name: finalStudent!.user?.name,
      email: finalStudent!.user?.email,
      profilePicture: finalStudent!.profilePicture || finalStudent!.user?.image,
      phone: finalStudent!.phone,
      bio: finalStudent!.bio,
      address: finalStudent!.address,
      companyId: finalStudent!.companyId,
      studentGrade: finalStudent!.studentGrade,
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

    // IMPORTANT: When deleting a Student, consider the cascading effects.
    // - What happens to their course enrollments?
    // - What happens to their submissions?
    // - What happens to their attendance records?
    // - What happens to their exam submissions?
    // Prisma's foreign key constraints will prevent deletion if related records exist
    // unless you configure onDelete actions (e.g., CASCADE, SET NULL).
    // For now, this will throw an error if linked records exist.
    // You might need to:
    // 1. Delete related records (use with extreme caution!).
    // 2. Set the foreign key to NULL if the field is optional.

    const deletedStudent = await prisma.student.delete({
      where: { id },
    });

    // Optionally, if the user associated with this student profile should also be deleted
    // AND they have no other roles/profiles, you could delete the user here.
    // This requires careful logic to avoid deleting users who might also be educators, admins, etc.
    // For safety, we are NOT deleting the User here. The User record will remain.

    return NextResponse.json({ message: "Student deleted successfully", deletedId: deletedStudent.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting student with ID ${id}:`, error);
    // Handle specific error if foreign key constraint fails
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Cannot delete student: They are linked to existing enrollments, submissions, or other records. Please reassign or delete associated records first." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete student", error: error.message }, { status: 500 });
  }
}
