import { NextResponse, NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// Define the type for the dynamic segment 'id' from the URL
interface Params {
  params: { id: string };
}

// =======================================================================
// GET: Fetch a single educator by ID
// =======================================================================
async function getEducator(request: Request, { params }: Params) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

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
    return formatResponse(false, null, "Educator not found", 404);
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
    totalStudents: totalStudents,
    totalCoursesTaught: totalCoursesTaught,
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

  return formatResponse(true, { data: responseData }, null, 200);
}

// =======================================================================
// PATCH: Updates an existing Educator profile by ID
// =======================================================================
async function updateEducator(request: Request, { params }: Params) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const body = await request.json();
  const { phone, bio, address, profilePicture, name, email, departmentId, academicLevelIds, ...rest } = body;

  const existingEducator = await prisma.educator.findUnique({
    where: { id },
  });

  if (!existingEducator) {
    return formatResponse(false, null, "Educator not found", 404);
  }

  // Validate departmentId if provided and it's changing
  if (departmentId !== undefined && departmentId !== existingEducator.departmentId) {
    if (departmentId !== null) {
      const existingDepartment = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!existingDepartment) {
        return formatResponse(false, null, "Provided departmentId does not exist.", 400);
      }
    }
  }

  // Use a transaction for atomicity for complex updates
  const updatedEducator = await prisma.$transaction(async (tx) => {
    // Handle Academic Level Assignments
    if (academicLevelIds !== undefined) {
      const existingAcademicLevels = await tx.academicLevel.findMany({
        where: {
          id: { in: academicLevelIds },
          companyId: existingEducator.companyId,
        },
        select: { id: true },
      });

      if (existingAcademicLevels.length !== academicLevelIds.length) {
        const foundIds = new Set(existingAcademicLevels.map(al => al.id));
        const notFoundIds = academicLevelIds.filter((id: string) => !foundIds.has(id));
        throw new Error(`One or more academic levels not found or do not belong to this company: ${notFoundIds.join(', ')}. Please ensure all provided academicLevelIds are valid.`);
      }

      await tx.educatorAcademicLevelAssignment.deleteMany({
        where: { educatorId: id },
      });

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

    const educatorUpdateData: any = {};
    if (phone !== undefined) educatorUpdateData.phone = phone;
    if (bio !== undefined) educatorUpdateData.bio = bio;
    if (address !== undefined) educatorUpdateData.address = address;
    if (profilePicture !== undefined) educatorUpdateData.profilePicture = profilePicture;
    if (departmentId !== undefined) educatorUpdateData.departmentId = departmentId;

    const updatedEducatorRecord = await tx.educator.update({
      where: { id },
      data: educatorUpdateData,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        Department: { select: { id: true, name: true } },
        academicLevelAssignments: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
      },
    });

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
      if (profilePicture !== undefined) userUpdateData.image = profilePicture;

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: updatedEducatorRecord.userId },
          data: userUpdateData,
        });
      }
    }
    return updatedEducatorRecord;
  });

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
    return formatResponse(false, null, "Failed to retrieve updated educator with relations.", 500);
  }

  const totalStudents = 0;
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
    totalStudents: totalStudents,
    totalCoursesTaught: totalCoursesTaught,
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

  return formatResponse(true, { data: responseData }, null, 200);
}

// =======================================================================
// DELETE: Deletes an Educator profile by ID
// =======================================================================
async function deleteEducator(request: Request, { params }: Params) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  const existingEducator = await prisma.educator.findUnique({
    where: { id },
  });

  if (!existingEducator) {
    return formatResponse(false, null, "Educator not found", 404);
  }

  // Delete all associated records before deleting the educator profile
  await prisma.educatorAcademicLevelAssignment.deleteMany({
    where: { educatorId: id },
  });
  await prisma.courseEducatorAssignment.deleteMany({
    where: { educatorId: id },
  });

  const deletedEducator = await prisma.educator.delete({
    where: { id },
  });

  return formatResponse(true, { message: "Educator deleted successfully", deletedId: deletedEducator.id }, null, 200);
}

// Export handlers with standardized wrapper
export const GET = withApiHandler(getEducator);
export const PATCH = withApiHandler(updateEducator);
export const DELETE = withApiHandler(deleteEducator);
