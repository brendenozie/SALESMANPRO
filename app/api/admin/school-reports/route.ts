// app/api/reports/route.ts
import prisma from "@/server/db/prismadb";

import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Helper: start of current month
const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Helper: end of current month
const getEndOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
};

// GET /api/reports
async function getReports(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    if (!companyId) return formatResponse(false, null, "Company ID is required to fetch reports", 400);

    // --- Overall metrics ---
    let totalStudents = 0;
    let totalTeachers = 0;
    let totalClasses = 0;
    let averageAttendance = "N/A";

    try {
      totalStudents = await prisma.student.count({ where: { companyId } });
      totalTeachers = await prisma.educator.count({ where: { companyId } });
      totalClasses = await prisma.course.count({ where: { companyId } });
    } catch (dbError: any) {
      console.warn("DB fetch failed, using mock data:", dbError.message);
      totalStudents = 1245;
      totalTeachers = 86;
      totalClasses = 55;
      averageAttendance = "92.5%";
    }

    const overallStats = {
      totalStudents: totalStudents.toLocaleString(),
      totalTeachers: totalTeachers.toLocaleString(),
      totalClasses: totalClasses.toLocaleString(),
      averageAttendance,
    };

    // --- Student Performance (mock) ---
    const studentPerformanceData = {
      gradeDistribution: [
        { label: "A", value: 300 },
        { label: "B", value: 500 },
        { label: "C", value: 350 },
        { label: "D", value: 70 },
        { label: "F", value: 25 },
      ],
      attendanceTrend: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        data: [90, 91, 92, 93, 92, 94, 93],
      },
      topPerformingGrades: [
        { grade: "Grade 8", avgGPA: 3.9 },
        { grade: "Grade 10", avgGPA: 3.7 },
        { grade: "Grade 7", avgGPA: 3.6 },
      ],
      lowPerformingStudents: [
        { name: "Student A", grade: "9", gpa: 1.8 },
        { name: "Student B", grade: "7", gpa: 2.1 },
      ],
    };

    // --- Staff Reports (mock) ---
    const staffReportsData = {
      teachersByDepartment: [
        { department: "Math", count: 15 },
        { department: "English", count: 12 },
        { department: "Science", count: 18 },
        { department: "Social Studies", count: 10 },
        { department: "Arts", count: 8 },
      ],
      teacherActivity: {
        labels: ["Reports", "Meetings", "Grading", "Planning"],
        data: [30, 20, 45, 35],
      },
    };

    // --- Academic Reports (mock) ---
    const academicReportsData = {
      classEnrollmentDistribution: [
        { size: "1-15", count: 10 },
        { size: "16-25", count: 30 },
        { size: "26-35", count: 15 },
      ],
      coursePopularity: [
        { course: "Algebra I", enrollments: 120 },
        { course: "Literary Analysis", enrollments: 105 },
        { course: "Biology", enrollments: 130 },
        { course: "Introduction to Programming", enrollments: 80 },
      ],
    };

    // --- Upcoming Events Summary ---
    const now = new Date();
    const startOfCurrentMonth = getStartOfMonth();
    const endOfCurrentMonth = getEndOfMonth();

    const upcomingEventsSummary: { type: string; count: number; nextDate: string | null }[] = [];

    try {
      const events = await prisma.event.findMany({
        where: {
          companyId,
          eventStatus: "SCHEDULED",
          startDateTime: { gte: now },
          OR: [
            { startDateTime: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } },
            { endDateTime: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } },
            { startDateTime: { lte: startOfCurrentMonth }, endDateTime: { gte: endOfCurrentMonth } },
          ],
        },
        orderBy: { startDateTime: "asc" },
        select: { eventType: true, startDateTime: true },
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
          nextDate: eventTypeCounts[type].nextDate?.toLocaleDateString() || null,
        });
      }

      upcomingEventsSummary.sort((a, b) => {
        if (a.nextDate === null) return 1;
        if (b.nextDate === null) return -1;
        return new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime();
      });
    } catch (dbError: any) {
      console.warn("Could not fetch events, using mock:", dbError.message);
      upcomingEventsSummary.push(
        { type: "ACADEMIC", count: 3, nextDate: "July 15" },
        { type: "HOLIDAY", count: 1, nextDate: "Aug 1" },
        { type: "MEETING", count: 5, nextDate: "July 28" }
      );
    }

    return formatResponse(true, { overallStats, studentPerformanceData, staffReportsData, academicReportsData, upcomingEventsSummary }, "Reports fetched successfully", 200);

  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return formatResponse(false, null, "Failed to fetch reports", 500);
  }
}

// ✅ Export wrapped with withApiHandler
export const GET = withApiHandler(getReports);
