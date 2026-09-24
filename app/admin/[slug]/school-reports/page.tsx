// app/admin/[slug]/school-reports/page.tsx
import React from "react";
import AdminReportsPageClient, {
  OverallStats,
  StudentPerformanceData,
  StaffReportsData,
  AcademicReportsData,
  UpcomingEventsSummaryItem
} from "./AdminReportsPageClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";
import { scoreToLetterGrade, getAttendanceSummary } from "@/lib/school/schoolService";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminReportsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // Retrieve the memoized company data
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  // 1. Overall Metrics
  const [totalStudents, totalTeachers, totalClasses, attendanceSummary] = await Promise.all([
    prisma.student.count({ where: { companyId } }).catch(() => 0),
    prisma.educator.count({ where: { companyId } }).catch(() => 0),
    prisma.course.count({ where: { companyId } }).catch(() => 0),
    getAttendanceSummary(companyId).catch(() => ({ rate: 100 })),
  ]);

  const avgAttendanceNum = attendanceSummary?.rate ?? 100;

  const overallStats: OverallStats = {
    totalStudents: totalStudents.toLocaleString(),
    totalTeachers: totalTeachers.toLocaleString(),
    totalClasses: totalClasses.toLocaleString(),
    averageAttendance: `${avgAttendanceNum.toFixed(1)}%`,
  };

  // 2. Student Performance
  const allGrades = await prisma.grade.findMany({
    where: { companyId },
    select: {
      score: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          currentClass: true,
          user: { select: { name: true } },
        },
      },
    },
  }).catch(() => []);

  const distMap: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  const studentScores: Record<string, { name: string; grade: string; scores: number[] }> = {};
  const levelScores: Record<string, number[]> = {};

  for (const g of allGrades) {
    const letter = scoreToLetterGrade(g.score);
    distMap[letter] = (distMap[letter] ?? 0) + 1;

    if (g.student) {
      const sId = g.student.id;
      const sName = g.student.user?.name || `${g.student.firstName} ${g.student.lastName}`.trim() || "Student";
      const cName = g.student.currentClass || "General";
      if (!studentScores[sId]) {
        studentScores[sId] = { name: sName, grade: cName, scores: [] };
      }
      studentScores[sId].scores.push(g.score);

      const lvlName = g.student.currentClass || "Grade Level";
      if (!levelScores[lvlName]) levelScores[lvlName] = [];
      levelScores[lvlName].push(g.score);
    }
  }

  const gradeDistribution = Object.entries(distMap).map(([label, value]) => ({
    label,
    value,
  }));

  const topPerformingGrades = Object.entries(levelScores)
    .map(([grade, scores]) => ({
      grade,
      avgGPA: Number(((scores.reduce((a, b) => a + b, 0) / scores.length / 100) * 4).toFixed(1)),
    }))
    .sort((a, b) => b.avgGPA - a.avgGPA)
    .slice(0, 3);

  const lowPerformingStudents = Object.values(studentScores)
    .map((s) => {
      const avg = s.scores.reduce((a, b) => a + b, 0) / s.scores.length;
      return {
        name: s.name,
        grade: s.grade,
        gpa: Number(((avg / 100) * 4).toFixed(1)),
        avg,
      };
    })
    .filter((s) => s.avg < 60)
    .slice(0, 5)
    .map(({ name, grade, gpa }) => ({ name, grade, gpa }));

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const trendLabels: string[] = [];
  const trendData: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    trendLabels.push(monthNames[d.getMonth()]);
    trendData.push(Math.round(avgAttendanceNum));
  }

  const studentPerformanceData: StudentPerformanceData = {
    gradeDistribution,
    attendanceTrend: {
      labels: trendLabels,
      data: trendData,
    },
    topPerformingGrades,
    lowPerformingStudents,
  };

  // 3. Staff Reports
  const educators = await prisma.educator.findMany({
    where: { companyId },
    select: { specialty: true },
  }).catch(() => []);

  const deptMap: Record<string, number> = {};
  for (const edu of educators) {
    const dept = edu.specialty?.trim() || "General Academics";
    deptMap[dept] = (deptMap[dept] ?? 0) + 1;
  }

  const teachersByDepartment = Object.entries(deptMap).map(([department, count]) => ({
    department,
    count,
  }));

  const [assignmentsCreated, attendanceMarked] = await Promise.all([
    prisma.courseAssignment.count({ where: { course: { companyId } } }).catch(() => 0),
    prisma.attendanceRecord.count({ where: { companyId } }).catch(() => 0),
  ]);

  const staffReportsData: StaffReportsData = {
    teachersByDepartment,
    teacherActivity: {
      labels: ["Assignments", "Attendance Logs", "Grading Logs", "Classes Active"],
      data: [assignmentsCreated, attendanceMarked, allGrades.length, totalClasses],
    },
  };

  // 4. Academic Reports
  const courses = await prisma.course.findMany({
    where: { companyId },
    select: {
      title: true,
      _count: { select: { enrollments: true } },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const coursePopularity = courses
    .map((c) => ({ course: c.title, enrollments: c._count?.enrollments ?? 0 }))
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 5);

  const sizeBuckets = { "1-15": 0, "16-25": 0, "26-35": 0, "36+": 0 };
  for (const c of courses) {
    const count = c._count?.enrollments ?? 0;
    if (count <= 15) sizeBuckets["1-15"]++;
    else if (count <= 25) sizeBuckets["16-25"]++;
    else if (count <= 35) sizeBuckets["26-35"]++;
    else sizeBuckets["36+"]++;
  }

  const classEnrollmentDistribution = Object.entries(sizeBuckets).map(([size, count]) => ({
    size,
    count,
  }));

  const academicReportsData: AcademicReportsData = {
    classEnrollmentDistribution,
    coursePopularity,
  };

  // 5. Upcoming Events Summary
  const upcomingEventsSummary: UpcomingEventsSummaryItem[] = [];

  try {
    const events = await prisma.event.findMany({
      where: {
        companyId,
        eventStatus: "SCHEDULED",
        startDateTime: { gte: now },
      },
      orderBy: { startDateTime: "asc" },
      select: { eventType: true, startDateTime: true },
      take: 10,
    });

    const eventTypeCounts: Record<string, { count: number; nextDate: Date | null }> = {};

    events.forEach((event) => {
      if (!eventTypeCounts[event.eventType]) eventTypeCounts[event.eventType] = { count: 0, nextDate: null };
      eventTypeCounts[event.eventType].count++;
      if (!eventTypeCounts[event.eventType].nextDate || event.startDateTime < eventTypeCounts[event.eventType].nextDate!) {
        eventTypeCounts[event.eventType].nextDate = event.startDateTime;
      }
    });

    for (const type in eventTypeCounts) {
      upcomingEventsSummary.push({
        type,
        count: eventTypeCounts[type].count,
        nextDate: eventTypeCounts[type].nextDate ? new Date(eventTypeCounts[type].nextDate!).toLocaleDateString() : "Scheduled",
      });
    }
  } catch {}

  return (
    <AdminReportsPageClient
      overallStats={JSON.parse(JSON.stringify(overallStats))}
      studentPerformanceData={JSON.parse(JSON.stringify(studentPerformanceData))}
      staffReportsData={JSON.parse(JSON.stringify(staffReportsData))}
      academicReportsData={JSON.parse(JSON.stringify(academicReportsData))}
      upcomingEventsSummary={JSON.parse(JSON.stringify(upcomingEventsSummary))}
    />
  );
}
