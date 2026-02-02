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
  const { id } = params;
  const body = await request.json();
  const { 
    phone, 
    bio, 
    address, 
    profilePicture, 
    name, 
    email, 
    departmentId, 
    assignments // Structured array from frontend
  } = body;

  const existingEducator = await prisma.educator.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!existingEducator) {
    return formatResponse(false, null, "Educator not found", 404);
  }

  const updatedEducator = await prisma.$transaction(async (tx) => {
    // 1. Update Assignments (Delete and Recreate)
    if (assignments !== undefined) {
      await tx.educatorAcademicLevelAssignment.deleteMany({
        where: { educatorId: id },
      });

      if (assignments.length > 0) {
        await tx.educatorAcademicLevelAssignment.createMany({
          data: assignments.map((asn: any) => ({
            educatorId: id,
            academicLevelId: asn.academicLevelId,
            classRoomId: asn.classRoomId || null,
          })),
        });
      }
    }

    // 2. Update Educator Profile
    const educatorUpdateData: any = {};
    if (phone !== undefined) educatorUpdateData.phone = phone;
    if (bio !== undefined) educatorUpdateData.bio = bio;
    if (address !== undefined) educatorUpdateData.address = address;
    if (profilePicture !== undefined) educatorUpdateData.profilePicture = profilePicture;
    if (departmentId !== undefined) educatorUpdateData.departmentId = departmentId;

    const educatorRecord = await tx.educator.update({
      where: { id },
      data: educatorUpdateData,
    });

    // 3. Update User Record (Name/Email/Image)
    if (name || email || profilePicture) {
      const userUpdateData: any = {};
      if (name) userUpdateData.name = name;
      if (profilePicture) userUpdateData.image = profilePicture;
      if (email && email !== existingEducator.user?.email) {
        const emailConflict = await tx.user.findUnique({ where: { email } });
        if (emailConflict) throw new Error("Email already in use.");
        userUpdateData.email = email;
      }

      if (existingEducator.userId) {
        await tx.user.update({
          where: { id: existingEducator.userId },
          data: userUpdateData,
        });
      }
    }

    return educatorRecord;
  });

  // Fetch final state for response (Standardized response object)
  const final = await prisma.educator.findUnique({
    where: { id: updatedEducator.id },
    include: {
      user: true,
      Department: true,
      academicLevelAssignments: {
        include: { academicLevel: true, classRoom: true }
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
        }
      }
    }
  });

  return formatResponse(true, { data: final }, "Teacher updated successfully", 200);
}

// =======================================================================
// DELETE: Deletes an Educator profile by ID
// =======================================================================
async function deleteEducator(request: Request, { params }: Params) {
  


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
