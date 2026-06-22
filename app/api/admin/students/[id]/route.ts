import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { StudentLevelStatus, ROLES } from "@prisma/client";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// --- Helper: Cache Key Builders ---
const getDetailCacheKey = (id: string) => `admin:students:${id}:detail`;
const getListCacheKey = (companyId: string | null) =>
  `admin:students:${companyId || "global"}:all`;

// --- Helper: Clean Payload Formatter ---
const formatStudentResponse = (student: any) => ({
  id: student.id,
  userId: student.userId,
  loginCode: student.loginCode,
  firstName: student.firstName,
  lastName: student.lastName,
  name: `${student.firstName} ${student.lastName}`,
  email: student.user?.email,
  profilePicture: student.profilePicture || student.user?.image,
  phone: student.phone,
  bio: student.bio,
  address: student.address,
  companyId: student.companyId,
  admissionNumber: student.admissionNumber,
  parentId: student.parentId,
  parentName: student.parent?.user?.name || null,
  parentEmail: student.parent?.user?.email || null,
  parentPhone: student.parent?.phone || null,
  academicRecords: student.StudentAcademicLevel.map((sal: any) => ({
    academicLevelId: sal.academicLevel.id,
    academicLevelName: sal.academicLevel.name,
    classRoomId: sal.classRoom?.id || null,
    classRoomName: sal.classRoom?.name || null,
    year: sal.year,
    term: sal.term,
    session: sal.session || null,
    levelStatus: sal.levelStatus,
  })),
  userRole: student.user?.role,
  levelStatus: student.levelStatus,
  totalCourses: student._count?.enrolledCourses ?? 0,
  completedCourses: 0,
  certificatesEarned: 0,
  averageProgress: 0.0,
  totalAssignmentSubmissions: student._count?.assignmentSubmission ?? 0,
  totalAttendanceRecords: student._count?.AttendanceRecord ?? 0,
  totalExamSubmissions: student._count?.ExamSubmission ?? 0,
  createdAt: student.createdAt,
  updatedAt: student.updatedAt,
});

// --- Core Database Query Schema Options ---
const studentIncludeConfig = {
  user: {
    select: { id: true, name: true, email: true, image: true, role: true },
  },
  parent: {
    select: {
      id: true,
      phone: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
  StudentAcademicLevel: {
    orderBy: [
      { year: "desc" as const },
      { term: "desc" as const },
      { createdAt: "desc" as const },
    ],
    include: {
      academicLevel: { select: { id: true, name: true } },
      classRoom: { select: { id: true, name: true } },
    },
  },
  _count: {
    select: {
      enrolledCourses: true,
      assignmentSubmission: true,
      AttendanceRecord: true,
      ExamSubmission: true,
    },
  },
};

// --- GET /api/admin/students/[id] ---
async function getStudent(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const cacheKey = getDetailCacheKey(id);

  // 1. Read Cache
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (error) {
    console.error("Cache read error:", error);
  }

  // 2. Database Lookup
  const student = await prisma.student.findUnique({
    where: { id },
    include: studentIncludeConfig,
  });

  if (!student) {
    return formatResponse(false, null, "Student not found", 404);
  }

  const responseData = formatStudentResponse(student);

  // 3. Populate Cache
  try {
    await cacheSet(cacheKey, responseData, 60);
  } catch (error) {
    console.error("Cache write error:", error);
  }

  return formatResponse(
    true,
    responseData,
    "Student fetched successfully",
    200,
  );
}

// --- PATCH /api/admin/students/[id] ---
async function updateStudent(req: Request, context: RouteContext) {
  const { id: studentId } = await context.params;
  const body = await req.json();

  const {
    firstName,
    lastName,
    email,
    phone,
    bio,
    address,
    profilePicture,
    parentId,
    academicLevelId,
    classRoomId,
    year,
    term,
    session,
    levelStatus,
  } = body;

  // Validate Enum if present
  if (levelStatus && !Object.values(StudentLevelStatus).includes(levelStatus)) {
    return formatResponse(
      false,
      null,
      "Invalid levelStatus value provided.",
      400,
    );
  }

  const finalizedStudent = await prisma.$transaction(async (tx) => {
    const existingStudent = await tx.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!existingStudent) throw new Error("Student not found");

    // 1. Dynamic Parent mapping verification
    if (parentId) {
      const parentExists = await tx.parent.findUnique({
        where: { id: parentId },
      });
      if (!parentExists) throw new Error("Provided parentId does not exist.");
    }

    // 2. Safe Dynamic Object composition for User Updates
    const updatedFirstName = firstName ?? existingStudent.firstName;
    const updatedLastName = lastName ?? existingStudent.lastName;

    await tx.user.update({
      where: { id: existingStudent.userId },
      data: {
        name: `${updatedFirstName} ${updatedLastName}`,
        ...(email !== undefined && { email }),
        ...(profilePicture !== undefined && { image: profilePicture }),
      },
    });

    // 3. Update Student Record
    await tx.student.update({
      where: { id: studentId },
      data: {
        firstName: updatedFirstName,
        lastName: updatedLastName,
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(address !== undefined && { address }),
        ...(profilePicture !== undefined && { profilePicture }),
        ...(levelStatus !== undefined && { levelStatus }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
    });

    // 4. Handle Academic History Track Node (Upsert)
    if (academicLevelId) {
      await tx.studentAcademicLevel.upsert({
        where: {
          studentId_academicLevelId: { studentId, academicLevelId },
        },
        update: {
          ...(classRoomId !== undefined && {
            classRoomId: classRoomId || null,
          }),
          ...(year !== undefined && { year }),
          ...(term !== undefined && { term }),
          ...(session !== undefined && { session }),
          ...(levelStatus !== undefined && { levelStatus }),
        },
        create: {
          studentId,
          academicLevelId,
          classRoomId: classRoomId || null,
          year,
          term,
          session,
          levelStatus: levelStatus || StudentLevelStatus.ACTIVE,
        },
      });
    }

    // 5. Fetch fully matching shape inside transaction context
    return await tx.student.findUnique({
      where: { id: studentId },
      include: studentIncludeConfig,
    });
  });

  const responseData = formatStudentResponse(finalizedStudent);

  // 6. Multi-tier Invalidation Clean up
  try {
    await cacheDel(getDetailCacheKey(studentId));
    await cacheDel(getListCacheKey(finalizedStudent.companyId));
  } catch (error) {
    console.error("Cache clean failure:", error);
  }

  return formatResponse(
    true,
    responseData,
    "Student updated successfully",
    200,
  );
}

// --- DELETE /api/admin/students/[id] ---
async function deleteStudent(req: Request, context: RouteContext) {
  const { id: studentId } = await context.params;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true, Parent: true },
  });

  if (!student) {
    return formatResponse(false, null, "Student not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    // 1. Clean up linked relation dependencies
    await tx.studentAcademicLevel.deleteMany({ where: { studentId } });
    await tx.courseEnrollment.deleteMany({ where: { studentId } });

    // 2. Remove primary student record node
    await tx.student.delete({ where: { id: studentId } });

    // 3. Optional Cascade User Account Account purge if no sibling relations match
    if (student.user) {
      const isSharedAccount = student.Parent?.length > 0;
      if (!isSharedAccount) {
        await tx.user.delete({ where: { id: student.userId } });
      }
    }
  });

  // 4. Wipe runtime Caches
  try {
    await cacheDel(getDetailCacheKey(studentId));
    await cacheDel(getListCacheKey(student.companyId));
  } catch (error) {
    console.error("Cache clean failure:", error);
  }

  return formatResponse(
    true,
    { deletedId: studentId },
    "Student and associated data deleted successfully",
    200,
  );
}

export const GET = withApiHandler(getStudent);
export const PATCH = withApiHandler(updateStudent);
export const DELETE = withApiHandler(deleteStudent);
