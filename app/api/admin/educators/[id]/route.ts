import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET /api/educators/[id]
// Fetches a single educator by ID, including associated User data and calculated counts.
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

    // Dynamically calculate totalStudents for this educator
    const totalStudents = 0;
    //  await prisma.student.count({
    //   where: {
    //     courses: {
    //       some: {
    //         instructorId: educator.id,
    //       },
    //     },
    //   },
    // });

    // Transform the data
    const responseData = {
      id: educator.id,
      userId: educator.userId,
      loginCode: educator.loginCode, // Include the new loginCode
      name: educator.user?.name,
      email: educator.user?.email,
      profilePicture: educator.profilePicture || educator.user?.image,
      phone: educator.phone,
      bio: educator.bio,
      address: educator.address,
      companyId: educator.companyId,
      departmentId: educator.departmentId,
      departmentName: educator.Department?.name || 'N/A',
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
// Updates an existing Educator profile by ID.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await request.json();
    // Exclude loginCode from direct update via PATCH
    const { phone, bio, address, profilePicture, departmentId, name, email, loginCode, ...rest } = body;

    // Check for any unexpected fields
    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for educator:", rest);
    }

    // Check if educator exists
    const existingEducator = await prisma.educator.findUnique({
      where: { id },
    });

    if (!existingEducator) {
      return NextResponse.json({ message: "Educator not found" }, { status: 404 });
    }

    // Prepare data for Educator update
    const educatorUpdateData: any = {};
    if (phone !== undefined) educatorUpdateData.phone = phone;
    if (bio !== undefined) educatorUpdateData.bio = bio;
    if (address !== undefined) educatorUpdateData.address = address;
    if (profilePicture !== undefined) educatorUpdateData.profilePicture = profilePicture;
    if (departmentId !== undefined) educatorUpdateData.departmentId = departmentId;

    // Perform Educator update
    const updatedEducator = await prisma.educator.update({
      where: { id },
      data: educatorUpdateData,
      include: {
        user: { // Include user for response
          select: { id: true, name: true, email: true, image: true },
        },
        Department: { // Include department for response
          select: { id: true, name: true },
        },
      },
    });

    // Optionally update associated User's name/email if provided (careful with email uniqueness)
    if (name !== undefined || email !== undefined) {
      const userUpdateData: any = {};
      if (name !== undefined) userUpdateData.name = name;
      if (email !== undefined) {
        // Check if new email is already taken by another user if it's changing
        if (email !== updatedEducator.user?.email) {
          const existingUserWithNewEmail = await prisma.user.findUnique({ where: { email } });
          if (existingUserWithNewEmail && existingUserWithNewEmail.id !== updatedEducator.userId) {
            return NextResponse.json({ message: "The provided email is already in use by another user." }, { status: 409 });
          }
        }
        userUpdateData.email = email;
      }
      if (profilePicture !== undefined) userUpdateData.image = profilePicture; // Sync profile picture to User model too

      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: updatedEducator.userId },
          data: userUpdateData,
        });
      }
    }

    // Re-fetch to get the most current state after potential user update
    const finalEducator = await prisma.educator.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        Department: {
          select: { id: true, name: true },
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

    const responseData = {
      id: finalEducator!.id,
      userId: finalEducator!.userId,
      loginCode: finalEducator!.loginCode, // Include the new loginCode
      name: finalEducator!.user?.name,
      email: finalEducator!.user?.email,
      profilePicture: finalEducator!.profilePicture || finalEducator!.user?.image,
      phone: finalEducator!.phone,
      bio: finalEducator!.bio,
      address: finalEducator!.address,
      companyId: finalEducator!.companyId,
      departmentId: finalEducator!.departmentId,
      departmentName: finalEducator!.Department?.name || 'N/A',
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
