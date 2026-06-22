import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyAuth } from "@/lib/verifyAuth";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// --- Helper: Cache Key Builders ---
const getDetailCacheKey = (id: string) => `admin:educators:${id}:detail`;
const getListCacheKey = (companyId: string | null) =>
  `admin:educators:${companyId || "global"}:all`;

// --- Core Database Query Include Schema ---
const educatorIncludeConfig = {
  user: {
    select: { id: true, name: true, email: true, image: true, role: true },
  },
  Department: { select: { id: true, name: true } },
  academicLevelAssignments: {
    include: {
      academicLevel: { select: { id: true, name: true, sortOrder: true } },
      classRoom: { select: { id: true, name: true } },
    },
  },
  _count: {
    select: {
      classesScheduled: true,
      Exam: true,
      CourseMaterial: true,
      AttendanceRecord: true,
      createdDiscussionTopics: true,
      assignmentSubmission: true,
      examSubmission: true,
      Grade: true,
      CourseEducatorAssignment: true,
    },
  },
};

// --- Helper: Standardized Output Formatter ---
const formatEducatorResponse = (educator: any) => {
  const assignedAcademicLevels = (educator.academicLevelAssignments || [])
    .map((assignment: any) => assignment.academicLevel)
    .filter(Boolean)
    .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((level: any) => ({ id: level.id, name: level.name }));

  const assignedClassRooms = (educator.academicLevelAssignments || [])
    .map((assignment: any) => assignment.classRoom)
    .filter(Boolean)
    .map((room: any) => ({ id: room.id, name: room.name }));

  return {
    id: educator.id,
    userId: educator.userId,
    loginCode: educator.loginCode,
    name: educator.user?.name || null,
    email: educator.user?.email || null,
    profilePicture: educator.profilePicture || educator.user?.image || null,
    phone: educator.phone || null,
    bio: educator.bio || null,
    address: educator.address || null,
    companyId: educator.companyId,
    departmentId: educator.departmentId || null,
    departmentName: educator.Department?.name || "N/A",
    academicLevels: assignedAcademicLevels,
    classRooms: assignedClassRooms,
    totalStudents: 0,
    totalCoursesTaught: educator._count?.CourseEducatorAssignment ?? 0,
    totalClassesScheduled: educator._count?.classesScheduled ?? 0,
    totalExamsCreated: educator._count?.Exam ?? 0,
    totalMaterialsUploaded: educator._count?.CourseMaterial ?? 0,
    totalAttendanceRecords: educator._count?.AttendanceRecord ?? 0,
    totalDiscussionTopics: educator._count?.createdDiscussionTopics ?? 0,
    totalAssignmentSubmissions: educator._count?.assignmentSubmission ?? 0,
    totalExamSubmissions: educator._count?.examSubmission ?? 0,
    totalGradesRecorded: educator._count?.Grade ?? 0,
    createdAt: educator.createdAt,
    updatedAt: educator.updatedAt,
  };
};

// =======================================================================
// GET: Fetch a single educator by ID
// =======================================================================
async function getEducator(request: Request, context: RouteContext) {
  await verifyAuth(request);
  const { id } = await context.params;
  const cacheKey = getDetailCacheKey(id);

  // 1. Read Cache Node
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (error) {
    console.error("Educator record cache lookup error:", error);
  }

  // 2. Query Base DB Execution
  const educator = await prisma.educator.findUnique({
    where: { id },
    include: educatorIncludeConfig,
  });

  if (!educator) {
    return formatResponse(false, null, "Educator not found", 404);
  }

  const responseData = formatEducatorResponse(educator);

  // 3. Write Cache Sync
  try {
    await cacheSet(cacheKey, responseData, 60);
  } catch (error) {
    console.error("Educator record cache save error:", error);
  }

  return formatResponse(
    true,
    responseData,
    "Educator fetched successfully",
    200,
  );
}

// =======================================================================
// PATCH: Updates an existing Educator profile by ID
// =======================================================================
async function updateEducator(request: Request, context: RouteContext) {
  await verifyAuth(request);
  const { id } = await context.params;
  const body = await request.json();

  const {
    phone,
    bio,
    address,
    profilePicture,
    name,
    email,
    departmentId,
    assignments,
  } = body;

  const existingEducator = await prisma.educator.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!existingEducator) {
    return formatResponse(false, null, "Educator profile not found.", 404);
  }

  // Handle write locks inside atomic database transaction pipelines
  const finalizedDataResult = await prisma
    .$transaction(async (tx) => {
      // 1. Process Academic Assignments Reset Strategy
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

      // 2. Sync Identity/User Node Properties
      if (name || email || profilePicture) {
        const userUpdateFields: any = {};
        if (name) userUpdateFields.name = name;
        if (profilePicture) userUpdateFields.image = profilePicture;

        if (email && email !== existingEducator.user?.email) {
          const uniqueConstraintConflict = await tx.user.findUnique({
            where: { email },
            select: { id: true },
          });
          if (uniqueConstraintConflict) throw new Error("ERR_EMAIL_IN_USE");
          userUpdateFields.email = email;
        }

        if (existingEducator.userId) {
          await tx.user.update({
            where: { id: existingEducator.userId },
            data: userUpdateFields,
          });
        }
      }

      // 3. Apply Dynamic Educator Profile Base Modification Fields
      const educatorUpdateFields: any = {};
      if (phone !== undefined) educatorUpdateFields.phone = phone;
      if (bio !== undefined) educatorUpdateFields.bio = bio;
      if (address !== undefined) educatorUpdateFields.address = address;
      if (profilePicture !== undefined)
        educatorUpdateFields.profilePicture = profilePicture;
      if (departmentId !== undefined)
        educatorUpdateFields.departmentId = departmentId || null;

      await tx.educator.update({
        where: { id },
        data: educatorUpdateFields,
      });

      // 4. Fetch the complete structural update context strictly inside the transactional loop
      return await tx.educator.findUnique({
        where: { id },
        include: educatorIncludeConfig,
      });
    })
    .catch((error) => {
      if (error.message === "ERR_EMAIL_IN_USE") return "EMAIL_CONFLICT";
      throw error;
    });

  if (finalizedDataResult === "EMAIL_CONFLICT") {
    return formatResponse(
      false,
      null,
      "The specified email address is already allocated to another account.",
      409,
    );
  }

  const responseData = formatEducatorResponse(finalizedDataResult);

  // 5. Dual-Tier Multi-Cache Invalidation Step
  try {
    await cacheDel(getDetailCacheKey(id));
    await cacheDel(getListCacheKey(existingEducator.companyId));
  } catch (error) {
    console.error("Educator cache clean process exception:", error);
  }

  return formatResponse(
    true,
    responseData,
    "Educator profile updated successfully.",
    200,
  );
}

// =======================================================================
// DELETE: Deletes an Educator profile by ID
// =======================================================================
async function deleteEducator(request: Request, context: RouteContext) {
  await verifyAuth(request);
  const { id } = await context.params;

  const existingEducator = await prisma.educator.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!existingEducator) {
    return formatResponse(false, null, "Educator profile not found.", 404);
  }

  // Execute clean systemic teardown of dependent profiles
  await prisma.$transaction(async (tx) => {
    await tx.educatorAcademicLevelAssignment.deleteMany({
      where: { educatorId: id },
    });
    await tx.courseEducatorAssignment.deleteMany({ where: { educatorId: id } });
    await tx.educator.delete({ where: { id } });

    // Safely delete loose unlinked user profiles if no other application profiles intersect
    if (existingEducator.userId) {
      const studentProfileMatch = await tx.student.findUnique({
        where: { userId: existingEducator.userId },
      });
      const parentProfileMatch = await tx.parent.findUnique({
        where: { userId: existingEducator.userId },
      });

      if (!studentProfileMatch && !parentProfileMatch) {
        await tx.user.delete({ where: { id: existingEducator.userId } });
      }
    }
  });

  // Purge runtime caches across layers
  try {
    await cacheDel(getDetailCacheKey(id));
    await cacheDel(getListCacheKey(existingEducator.companyId));
  } catch (error) {
    console.error("Educator deletion cache cleanup error:", error);
  }

  return formatResponse(
    true,
    { deletedId: id },
    "Educator account profile completely removed.",
    200,
  );
}

export const GET = withApiHandler(getEducator);
export const PATCH = withApiHandler(updateEducator);
export const DELETE = withApiHandler(deleteEducator);
