import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyAuth } from "@/lib/verifyAuth";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

// --- Helper: Cache Key Builder ---
const getCacheKey = (companyId: string | null) =>
  `admin:educators:${companyId || "global"}:all`;

// --- Helper: Safe Unique Login Code Generator ---
async function generateUniqueLoginCode(tx: any): Promise<string> {
  const maxAttempts = 5;
  for (let i = 0; i < maxAttempts; i++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const exists = await tx.educator.findUnique({
      where: { loginCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error(
    "Failed to generate a unique login code after maximum attempts.",
  );
}

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
    totalStudents: 0, // Calculated dynamically downstream if necessary
    totalCoursesTaught: educator._count?.CourseEducatorAssignment ?? 0,
    totalClassesScheduled: educator._count?.classesScheduled ?? 0,
    totalExamsCreated: educator._count?.Exam ?? 0,
    totalAttendanceRecords: educator._count?.AttendanceRecord ?? 0,
    totalDiscussionTopics: educator._count?.createdDiscussionTopics ?? 0,
    totalAssignmentSubmissions: educator._count?.assignmentSubmission ?? 0,
    totalExamSubmissions: educator._count?.examSubmission ?? 0,
    totalGradesRecorded: educator._count?.Grade ?? 0,
    createdAt: educator.createdAt,
    updatedAt: educator.updatedAt,
  };
};

// --- GET /api/admin/educators ---
async function getEducators(request: Request) {
  await verifyAuth(request);

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const cacheKey = getCacheKey(companyId);

  // 1. Check Runtime Cache
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (error) {
    console.error("Educators cache read exception:", error);
  }

  // 2. Query Primary Database Node
  const educators = await prisma.educator.findMany({
    where: companyId ? { companyId } : {},
    include: educatorIncludeConfig,
    orderBy: { user: { name: "asc" } },
  });

  const responseData = educators.map(formatEducatorResponse);

  // 3. Write Back to Cache Layers Async
  try {
    await cacheSet(cacheKey, responseData, 60);
  } catch (error) {
    console.error("Educators cache write exception:", error);
  }

  return formatResponse(
    true,
    responseData,
    "Educators fetched successfully",
    200,
  );
}

// --- POST /api/admin/educators ---
async function createEducator(request: Request) {
  await verifyAuth(request);

  const body = await request.json();
  const {
    email,
    name,
    companyId,
    phone,
    bio,
    address,
    profilePicture,
    departmentId,
    assignments = [], // Form: Array<{ academicLevelId: string, classRoomId: string | null }>
  } = body;

  // Structural Validation Guard
  if (!email || !name || !companyId) {
    return formatResponse(
      false,
      null,
      "Email, Name, and Company ID are required.",
      400,
    );
  }

  // Execute isolated transactions pipeline
  const finalizedEducatorData = await prisma
    .$transaction(async (tx) => {
      // 1. Handle Core User Account Resolve
      let user = await tx.user.findUnique({ where: { email } });

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            name,
            image: profilePicture,
            role: "EDUCATOR",
            companyId,
            staffProfile: {
              create: {
                companyId,
                jobTitle: "Educator",
                department: "Education",
              },
            },
          },
        });
      } else {
        const profileExists = await tx.educator.findUnique({
          where: { userId: user.id },
        });
        if (profileExists) {
          throw new Error("ERR_PROFILE_EXISTS");
        }
      }

      // 2. Resolve Unique Login String Identifiers natively within tx context
      const loginCode = await generateUniqueLoginCode(tx);

      // 3. Persist Educator Node
      const newEducator = await tx.educator.create({
        data: {
          userId: user.id,
          loginCode,
          companyId,
          phone,
          bio,
          address,
          profilePicture,
          departmentId: departmentId || null,
        },
      });

      // 4. Batch Process Associated Academic Mappings cleanly
      if (assignments.length > 0) {
        await tx.educatorAcademicLevelAssignment.createMany({
          data: assignments.map((asn: any) => ({
            educatorId: newEducator.id,
            academicLevelId: asn.academicLevelId,
            classRoomId: asn.classRoomId || null,
          })),
        });
      }

      // 5. Build full matching payload structure within safety bounds of transaction
      return await tx.educator.findUnique({
        where: { id: newEducator.id },
        include: educatorIncludeConfig,
      });
    })
    .catch((error) => {
      // Intercept caught strings inside transaction block
      if (error.message === "ERR_PROFILE_EXISTS") {
        return "PROFILE_EXISTS";
      }
      throw error;
    });

  if (finalizedEducatorData === "PROFILE_EXISTS") {
    return formatResponse(
      false,
      null,
      "An educator profile already exists for this user account.",
      409,
    );
  }

  // Purge outdated dataset collections
  try {
    await cacheDel(getCacheKey(companyId));
  } catch (error) {
    console.error("Educators cache cleanup exception:", error);
  }

  return formatResponse(
    true,
    formatEducatorResponse(finalizedEducatorData),
    "Educator profile created successfully",
    201,
  );
}

export const GET = withApiHandler(getEducators);
export const POST = withApiHandler(createEducator);
