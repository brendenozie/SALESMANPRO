// app/api/academic-levels/[academicLevelId]/attendance/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Define types for API request/response
export type AttendanceStatus = "PRESENT" | "ABSENT" | "TARDY" | "EXCUSED";

export type StudentForAttendance = {
  id: string;
  userId: string;
  name: string;
  profilePicture: string | null;
  currentStatus: AttendanceStatus;
};

interface AcademicLevelInfo {
  id: string;
  name: string;
  description: string | null;
  studentsCount: number;
}

interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
}

export interface TakeAttendancePageData {
  academicLevelInfo: AcademicLevelInfo;
  students: StudentForAttendance[];
  themeSettings: ThemeSettings;
}

interface StudentAttendanceRecordPayload {
  status: AttendanceStatus;
  reason?: string | null;
}

// ======================== GET ========================
// Fetch students and their attendance status
async function getAttendance(req: Request, { params }: { params: { academicLevelId: string } }) {
  const { academicLevelId } = params;
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const educatorUserId = searchParams.get("educatorId");

  if (!dateStr || !educatorUserId) {
    return formatResponse(false, null, "Date and educatorId are required", 400);
  }

  const attendanceDate = new Date(dateStr);
  attendanceDate.setUTCHours(0, 0, 0, 0);

  const recordingEducator = await prisma.educator.findUnique({
    where: { userId: educatorUserId },
    select: { id: true, companyId: true },
  });

  if (!recordingEducator) {
    return formatResponse(false, null, "Educator not found or not authorized", 403);
  }

  const academicLevel = await prisma.academicLevel.findUnique({
    where: { id: academicLevelId },
    include: {
      _count: {
        select: { StudentAcademicLevel: true },
      },
    },
  });

  if (!academicLevel) {
    return formatResponse(false, null, "Academic Level not found", 404);
  }

  const assignment = await prisma.educatorAcademicLevelAssignment.findFirst({
    where: { educatorId: recordingEducator.id, academicLevelId },
  });
  if (!assignment) {
    return formatResponse(
      false,
      null,
      "Educator is not assigned to this academic level and cannot view/record attendance.",
      403
    );
  }

  const studentAcademicLevels = await prisma.studentAcademicLevel.findMany({
    where: { academicLevelId },
    include: {
      student: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          AttendanceRecord: {
            where: { date: attendanceDate, academicLevelId, classScheduleId: null },
            select: { status: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { student: { user: { name: "asc" } } },
  });

  const studentsForAttendance: StudentForAttendance[] = studentAcademicLevels.map((sal) => ({
    id: sal.student.id,
    userId: sal.student.userId,
    name: sal.student.user?.name || "N/A",
    profilePicture: sal.student.profilePicture || sal.student.user?.image || null,
    currentStatus: (sal.student.AttendanceRecord[0]?.status ?? "ABSENT") as AttendanceStatus,
  }));

  const responseData: TakeAttendancePageData = {
    academicLevelInfo: {
      id: academicLevel.id,
      name: academicLevel.name,
      description: academicLevel.description,
      studentsCount: academicLevel._count.StudentAcademicLevel,
    },
    students: studentsForAttendance,
    themeSettings: {
      primaryColor: "#fd2121",
      accentColor: "#FFC107",
    },
  };

  return formatResponse(true, responseData, "Attendance data fetched", 200);
}

// ======================== POST ========================
// Save or update attendance records
async function postAttendance(req: Request, { params }: { params: { academicLevelId: string } }) {
  const { academicLevelId } = params;
  const { date: dateStr, educatorId, attendanceRecords } = (await req.json()) as {
    date: string;
    educatorId: string;
    attendanceRecords: Record<string, StudentAttendanceRecordPayload>;
  };

  const attendanceDate = new Date(dateStr);
  attendanceDate.setUTCHours(0, 0, 0, 0);

  const educator = await prisma.educator.findUnique({
    where: { userId: educatorId },
    select: { id: true, companyId: true },
  });
  if (!educator) {
    return formatResponse(false, null, "Educator not found or not authorized", 403);
  }

  const academicLevelDetails = await prisma.academicLevel.findUnique({
    where: { id: academicLevelId },
    select: { companyId: true },
  });
  if (!academicLevelDetails) {
    return formatResponse(false, null, "Academic Level not found", 404);
  }

  const assignment = await prisma.educatorAcademicLevelAssignment.findFirst({
    where: { educatorId: educator.id, academicLevelId },
  });
  if (!assignment) {
    return formatResponse(
      false,
      null,
      "Educator is not assigned to this academic level and cannot record attendance.",
      403
    );
  }

  const companyIdToSet = academicLevelDetails.companyId;

  const results = await prisma.$transaction(async (tx) => {
    const ops: any[] = [];

    for (const [studentId, recordData] of Object.entries(attendanceRecords)) {
      const existing = await tx.attendanceRecord.findFirst({
        where: { studentId, date: attendanceDate, classScheduleId: null, academicLevelId, companyId: companyIdToSet },
      });

      if (existing) {
        ops.push(
          tx.attendanceRecord.update({
            where: { id: existing.id },
            data: {
              status: recordData.status,
              reason: recordData.reason,
              recordedById: educator.id,
              academicLevelId,
              companyId: companyIdToSet,
            },
          })
        );
      } else {
        ops.push(
          tx.attendanceRecord.create({
            data: {
              studentId,
              date: attendanceDate,
              status: recordData.status,
              classScheduleId: null,
              academicLevelId,
              recordedById: educator.id,
              reason: recordData.reason,
              companyId: companyIdToSet,
            },
          })
        );
      }
    }

    return Promise.all(ops);
  });

  return formatResponse(true, { recordsProcessed: results.length }, "Attendance saved successfully", 200);
}

// ======================== HANDLERS ========================
export const GET = withApiHandler(getAttendance, { requireAuth: true });
export const POST = withApiHandler(postAttendance, { requireAuth: true });
