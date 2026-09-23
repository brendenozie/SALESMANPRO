import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const type = searchParams.get("type"); // "student" | "staff"
  const dateStr = searchParams.get("date"); // YYYY-MM-DD
  const classroomId = searchParams.get("classroomId");
  const academicLevelId = searchParams.get("academicLevelId");

  if (!companyId) return formatResponse(false, null, "Company ID is required", 400);

  // If explicitly requested staff attendance
  if (type === "staff") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cacheKey = buildTenantCacheKey(companyId, "staff-attendance", { date: today.toISOString() });
    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    const [logs, totalUsers] = await Promise.all([
      prisma.staffAttendanceRecord.findMany({
        where: { date: today, companyId },
        select: {
          id: true,
          checkInTime: true,
          checkOutTime: true,
          status: true,
          user: { select: { name: true, image: true, email: true } },
        },
        orderBy: { checkInTime: "desc" },
      }),
      prisma.user.count({ where: { companyId, role: "STAFF" } }),
    ]);

    let presentCount = 0;
    let lateCount = 0;
    for (const log of logs) {
      if (log.checkInTime) presentCount++;
      if (log.status === "LATE") lateCount++;
    }

    const stats = {
      total: totalUsers,
      present: presentCount,
      late: lateCount,
      absent: Math.max(0, totalUsers - presentCount),
    };

    try {
      await cacheSet(cacheKey, { logs, stats }, 30);
    } catch (e) {}

    return NextResponse.json({ logs, stats });
  }

  // --- STUDENT ATTENDANCE (Default) ---
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const [classrooms, students, records] = await Promise.all([
      prisma.classroom.findMany({
        where: { companyId },
        select: { id: true, name: true, academicLevelId: true },
        orderBy: { name: "asc" },
      }),
      prisma.student.findMany({
        where: {
          companyId,
          ...(classroomId && classroomId !== "All"
            ? {
                OR: [
                  { currentClass: classroomId },
                  { id: classroomId },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          loginCode: true,
          admissionNumber: true,
          currentClass: true,
          academicLevel: true,
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { firstName: "asc" },
      }),
      prisma.attendanceRecord.findMany({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          student: { companyId },
        },
        select: {
          id: true,
          studentId: true,
          status: true,
          reason: true,
          date: true,
          classroomId: true,
          recordedById: true,
          updatedAt: true,
        },
      }),
    ]);

    // Build unique class list
    const classList = [...classrooms];
    const existingNames = new Set(classList.map((c) => c.name));
    for (const st of students) {
      if (st.currentClass && !existingNames.has(st.currentClass)) {
        classList.push({ id: st.currentClass, name: st.currentClass, academicLevelId: null });
        existingNames.add(st.currentClass);
      }
    }

    const recordsByStudent = new Map<string, any>(records.map((r) => [r.studentId, r]));

    let present = 0;
    let absent = 0;
    let tardy = 0;
    let excused = 0;
    let unmarked = 0;

    const studentRoster = students.map((s) => {
      const rec = recordsByStudent.get(s.id);
      const studentName =
        `${s.firstName || ""} ${s.lastName || ""}`.trim() ||
        s.user?.name ||
        "Student";
      const status = rec?.status || "UNMARKED";

      if (status === "PRESENT") present++;
      else if (status === "ABSENT") absent++;
      else if (status === "TARDY") tardy++;
      else if (status === "EXCUSED") excused++;
      else unmarked++;

      return {
        id: s.id,
        name: studentName,
        admissionNumber: s.admissionNumber || s.loginCode || s.id.slice(-6).toUpperCase(),
        classroomId: s.currentClass || null,
        classroomName: s.currentClass || "Unassigned",
        academicLevelName: s.academicLevel || "Standard",
        avatar: s.user?.image || null,
        attendanceRecordId: rec?.id || null,
        status,
        reason: rec?.reason || "",
        updatedAt: rec?.updatedAt || null,
      };
    });

    const totalStudents = students.length;
    const markedStudents = present + absent + tardy + excused;
    const attendanceRate =
      markedStudents > 0
        ? Math.round(((present + tardy) / markedStudents) * 100)
        : 0;

    const stats = {
      total: totalStudents,
      present,
      absent,
      tardy,
      excused,
      unmarked,
      rate: attendanceRate,
    };

    return formatResponse(
      true,
      {
        date: startOfDay.toISOString().split("T")[0],
        stats,
        classrooms: classList,
        students: studentRoster,
      },
      "Student attendance fetched",
      200,
    );
  } catch (error: any) {
    console.error("[ATTENDANCE_GET_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to fetch attendance", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const body = await req.json();
    const { companyId, date, records } = body;

    if (!companyId) {
      return formatResponse(false, null, "Company ID is required", 400);
    }
    if (!Array.isArray(records) || records.length === 0) {
      return formatResponse(false, null, "Records array is required", 400);
    }

    const recordedDate = date ? new Date(date) : new Date();
    recordedDate.setHours(12, 0, 0, 0); // midday timestamp for consistent daily date
    const startOfDay = new Date(recordedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(recordedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Resolve recorder user id
    let recordedById = (session?.user as any)?.id;
    if (!recordedById) {
      const companyUser = await prisma.user.findFirst({
        where: { companyId },
        select: { id: true },
      });
      recordedById = companyUser?.id || "000000000000000000000000";
    }

    // Process each attendance record
    const updates = records.map(
      async (item: {
        studentId: string;
        status: "PRESENT" | "ABSENT" | "TARDY" | "EXCUSED";
        reason?: string;
        classroomId?: string;
        academicLevelId?: string;
      }) => {
        const existing = await prisma.attendanceRecord.findFirst({
          where: {
            studentId: item.studentId,
            date: { gte: startOfDay, lte: endOfDay },
          },
        });

        if (existing) {
          return prisma.attendanceRecord.update({
            where: { id: existing.id },
            data: {
              status: item.status,
              reason: item.reason || null,
              ...(item.classroomId ? { classroomId: item.classroomId } : {}),
              ...(item.academicLevelId ? { academicLevelId: item.academicLevelId } : {}),
              recordedById,
            },
          });
        } else {
          return prisma.attendanceRecord.create({
            data: {
              studentId: item.studentId,
              date: recordedDate,
              status: item.status,
              reason: item.reason || null,
              classroomId: item.classroomId || null,
              academicLevelId: item.academicLevelId || null,
              recordedById,
            },
          });
        }
      },
    );

    await Promise.all(updates);

    try {
      await cacheDel(buildTenantCacheKey(companyId, "attendance", {}));
    } catch (e) {}

    return formatResponse(
      true,
      { updatedCount: records.length },
      "Attendance updated successfully",
      200,
    );
  } catch (error: any) {
    console.error("[ATTENDANCE_POST_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to update attendance", 500);
  }
}