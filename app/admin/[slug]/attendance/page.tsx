import React from "react";
import AdminAttendanceViewPage from "./AdminAttendanceViewPage";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import prisma from "@/server/db/prismadb";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminAttendancePage({ params }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || (session?.user as any)?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        School organization not found.
      </div>
    );
  }

  const companyId = company.id;

  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  let classrooms: Array<{ id: string; name: string }> = [];
  let studentRoster: Array<any> = [];
  let stats = {
    total: 0,
    present: 0,
    absent: 0,
    tardy: 0,
    excused: 0,
    unmarked: 0,
    rate: 0,
  };

  try {
    const [fetchedClassrooms, students, records] = await Promise.all([
      prisma.classroom.findMany({
        where: { companyId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.student.findMany({
        where: { companyId },
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
          classroomId: true,
          updatedAt: true,
        },
      }),
    ]);

    classrooms = fetchedClassrooms;
    // Also include any class names found on student records if not in classroom table
    const existingClassNames = new Set(classrooms.map((c) => c.name));
    for (const st of students) {
      if (st.currentClass && !existingClassNames.has(st.currentClass)) {
        classrooms.push({ id: st.currentClass, name: st.currentClass });
        existingClassNames.add(st.currentClass);
      }
    }

    const recordsMap = new Map<string, any>(records.map((r) => [r.studentId, r]));

    let present = 0;
    let absent = 0;
    let tardy = 0;
    let excused = 0;
    let unmarked = 0;

    studentRoster = students.map((s) => {
      const rec = recordsMap.get(s.id);
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
        updatedAt: rec?.updatedAt ? rec.updatedAt.toISOString() : null,
      };
    });

    const marked = present + absent + tardy + excused;
    stats = {
      total: students.length,
      present,
      absent,
      tardy,
      excused,
      unmarked,
      rate: marked > 0 ? Math.round(((present + tardy) / marked) * 100) : 0,
    };
  } catch (error) {
    console.error("[AttendancePage_Error]", error);
  }

  return (
    <AdminAttendanceViewPage
      companyId={companyId}
      initialDate={startOfDay.toISOString().split("T")[0]}
      initialClassrooms={classrooms}
      initialStudents={studentRoster}
      initialStats={stats}
    />
  );
}
