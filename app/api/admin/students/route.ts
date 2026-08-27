import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { StudentLevelStatus, ROLES } from "@prisma/client";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

// --- Helper: Cache Key Builder ---
const getCacheKey = (companyId: string | null) =>
  `admin:students:${companyId || "global"}:all`;

// --- Helper: Generate Unique Login Code ---
async function generateUniqueLoginCode(tx: any): Promise<string> {
  const maxAttempts = 5;
  for (let i = 0; i < maxAttempts; i++) {
    const code = Math.floor(100000 + Math.random() * 900000)
      .toString()
      .padStart(6, "0");
    const existing = await tx.student.findUnique({
      where: { loginCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error(
    "Failed to generate a unique login code after multiple attempts.",
  );
}

// --- Helper: Generate Unique Admission Number ---
async function generateUniqueAdmissionNumber(tx: any): Promise<string> {
  const maxAttempts = 5;
  for (let i = 0; i < maxAttempts; i++) {
    const number =
      "ADM" + Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await tx.student.findUnique({
      where: { admissionNumber: number },
      select: { id: true },
    });
    if (!existing) return number;
  }
  throw new Error(
    "Failed to generate a unique admission number after multiple attempts.",
  );
}

// --- Helper: Format Student Response Payload ---
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
  address: student.address,
  companyId: student.companyId,
  admissionNumber: student.admissionNumber,
  parentId: student.parentId,
  parentName: student.parent?.user?.name,
  academicRecords: student.StudentAcademicLevel.map((sal: any) => ({
    academicLevelId: sal.academicLevel.id,
    academicLevelName: sal.academicLevel.name,
    classRoomId: sal.classRoom?.id || null,
    classRoomName: sal.classRoom?.name || null,
    year: sal.year,
    term: sal.term,
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

// --- Core Prisma Select Include Block ---
const studentIncludeConfig = {
  user: {
    select: { id: true, name: true, email: true, image: true, role: true },
  },
  parent: {
    select: {
      id: true,
      phone: true,
      user: { select: { id: true, name: true } },
    },
  },
  StudentAcademicLevel: {
    orderBy: [
      { year: "desc" as const },
      { term: "desc" as const },
      { createdAt: "desc" as const },
    ],
    take: 1,
    include: {
      academicLevel: true,
      classRoom: true,
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

// --- GET /api/students ---
async function handleGET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const cacheKey = getCacheKey(companyId);

  // 1. Check Cache
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (error) {
    console.error("Cache fetch failure:", error);
  }

  // 2. Database Fetch
  const students = await prisma.student.findMany({
    where: companyId ? { companyId } : {},
    include: studentIncludeConfig,
  });

  const responseData = students.map(formatStudentResponse);

  // 3. Write Cache Async
  try {
    await cacheSet(cacheKey, responseData, 60);
  } catch (error) {
    console.error("Cache write failure:", error);
  }

  return formatResponse(
    true,
    responseData,
    "Students fetched successfully",
    200,
  );
}

// --- POST /api/students ---
async function handlePOST(request: Request) {
  const body = await request.json();
  const {
    email,
    companyId,
    firstName,
    lastName,
    academicLevelId,
    classRoomId,
    levelStatus,
    year,
    term,
    phone,
  } = body;

  // Early Validation
  if (!email || !firstName || !lastName) {
    return formatResponse(
      false,
      null,
      "Email, FirstName, and LastName are required.",
      400,
    );
  }

  // Atomic pipeline transaction
  const finalizedStudentData = await prisma.$transaction(async (tx) => {
    // 1. Upsert User base account
    const user = await tx.user.upsert({
      where: { email },
      update: { role: ROLES.STUDENT },
      create: { email, name: `${firstName} ${lastName}`, role: ROLES.STUDENT },
    });

    // 2. Safely resolve system codes using transactional context
    const loginCode = await generateUniqueLoginCode(tx);
    const admissionNumber = await generateUniqueAdmissionNumber(tx);

    // 3. Save Student profile
    const newStudent = await tx.student.create({
      data: {
        userId: user.id,
        loginCode,
        admissionNumber,
        companyId,
        firstName,
        lastName,
        phone,
        levelStatus: levelStatus as StudentLevelStatus,
      },
    });

    // 4. Save Academic track record if provided
    if (academicLevelId) {
      await tx.studentAcademicLevel.create({
        data: {
          studentId: newStudent.id,
          academicLevelId,
          classRoomId,
          year,
          term,
          levelStatus: levelStatus as StudentLevelStatus,
        },
      });
    }

    // 5. Query fully populated model matching the structure expected by GET
    return await tx.student.findUnique({
      where: { id: newStudent.id },
      include: studentIncludeConfig,
    });
  });

  // Invalidate global list view cache cleanly
  try {
    await cacheDel(getCacheKey(companyId));
  } catch (error) {
    console.error("Cache invalidation failure:", error);
  }

  return formatResponse(
    true,
    formatStudentResponse(finalizedStudentData),
    "Student created successfully",
    201,
  );
}

export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
