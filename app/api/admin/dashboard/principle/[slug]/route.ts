import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// --- Constants & Scoring Logic ---
const RATING_TO_SCORE: Record<string, number> = {
  EXCELLENT: 100, VERY_GOOD: 80, GOOD: 60, AVERAGE: 40, POOR: 20
};

const ATTN_TO_SCORE: Record<string, number> = {
  PRESENT: 100, LATE: 50, ABSENT: 0, ON_LEAVE: 100
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const currentUserId = searchParams.get("userId");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const startOfWeek = new Date(new Date().setDate(now.getDate() - now.getDay()));
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // --- 1. Basic Stats ---
  
    const cacheKey = `admin:principle:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const [studentCount, teacherCount, classCount, upcomingEvents] = await Promise.all([
    prisma.student.count({ where: { companyId } }),
    prisma.educator.count({ where: { companyId } }),
    prisma.classroom.count({ where: { companyId } }),
    prisma.event.count({ 
      where: { companyId, startDateTime: { gte: now }, eventStatus: "SCHEDULED" } 
    }),
  ]);

  // --- 2. Spotlight: Student & Teacher of the Week ---
  const [topWeeklyGrade, topWeeklyReview] = await Promise.all([
    prisma.grade.findFirst({
      where: { companyId, createdAt: { gte: startOfWeek } },
      orderBy: { score: 'desc' },
      include: { student: { select: { firstName: true, lastName: true } } }
    }),
    prisma.staffPerformanceReview.findFirst({
      where: { employee: { companyId }, createdAt: { gte: startOfWeek } },
      orderBy: { rating: 'desc' },
      include: { employee: { select: { name: true } } }
    })
  ]);

  // --- 3. Academic & Effectiveness Trend (Last 6 Months) ---
  const [allGrades, teacherReviews, staffAttendance] = await Promise.all([
    prisma.grade.findMany({ where: { companyId, createdAt: { gte: sixMonthsAgo } } }),
    prisma.staffPerformanceReview.findMany({ where: { employee: { companyId }, createdAt: { gte: sixMonthsAgo } } }),
    prisma.staffAttendanceRecord.findMany({ where: { companyId, date: { gte: sixMonthsAgo } } })
  ]);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return { name: MONTHS[d.getMonth()], monthIdx: d.getMonth() };
  }).reverse();

  const trendSeries = {
    academic: last6Months.map(m => {
      const monthGrades = allGrades.filter(g => g.createdAt?.getMonth() === m.monthIdx);
      return monthGrades.length ? Math.round(monthGrades.reduce((s, g) => s + g.score, 0) / monthGrades.length) : 0;
    }),
    teacher: last6Months.map(m => {
      const mReviews = teacherReviews.filter(r => r.createdAt.getMonth() === m.monthIdx);
      const mAttn = staffAttendance.filter(a => a.date.getMonth() === m.monthIdx);
      const perf = mReviews.length ? mReviews.reduce((s, r) => s + (RATING_TO_SCORE[r.rating] || 0), 0) / mReviews.length : 75;
      const attn = mAttn.length ? mAttn.reduce((s, a) => s + (ATTN_TO_SCORE[a.status] || 0), 0) / mAttn.length : 90;
      return Math.round((perf * 0.7) + (attn * 0.3));
    })
  };

  // --- 4. Drill-down: Academic Volatility ---
  const [currentGrades, prevGrades] = await Promise.all([
    prisma.grade.findMany({
      where: { companyId, createdAt: { gte: startOfCurrentMonth } },
      include: { course: { select: { title: true } }, exam: { select: { title: true } } }
    }),
    prisma.grade.findMany({
      where: { companyId, createdAt: { gte: startOfPrevMonth, lt: startOfCurrentMonth } },
      include: { course: { select: { title: true } } }
    })
  ]);

  const impactMap: any = {};
  currentGrades.forEach(g => {
    if (!impactMap[g.courseId]) impactMap[g.courseId] = { title: g.course.title, scores: [], keyExam: g.exam?.title };
    impactMap[g.courseId].scores.push(g.score);
  });

  const impactReport = Object.keys(impactMap).map(id => {
    const currAvg = impactMap[id].scores.reduce((a:any, b:any) => a+b, 0) / impactMap[id].scores.length;
    const pGrades = prevGrades.filter(pg => pg.courseId === id);
    const prevAvg = pGrades.length ? pGrades.reduce((a, b) => a + b.score, 0) / pGrades.length : currAvg;
    return {
      courseName: impactMap[id].title,
      change: parseFloat((currAvg - prevAvg).toFixed(1)),
      currentAvg: Math.round(currAvg),
      keyExam: impactMap[id].keyExam || "Unit Assessment"
    };
  }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 4);

  
  try {
    if (studentCount) {
      await cacheSet(cacheKey, {
    principalStats: [
      { title: "Total Students", value: studentCount.toLocaleString(), description: "Active Enrollment", color: "text-blue-600" },
      { title: "Total Teachers", value: teacherCount.toLocaleString(), description: "Staff Reliability: 94%", color: "text-emerald-600" },
      { title: "Total Classes", value: classCount.toLocaleString(), description: "Active Sessions", color: "text-violet-600" },
      { title: "Upcoming Events", value: upcomingEvents.toString(), description: "Scheduled this week", color: "text-amber-600" },
    ],
    spotlight: {
      student: topWeeklyGrade ? `${topWeeklyGrade.student.firstName} ${topWeeklyGrade.student.lastName}` : "TBD",
      teacher: topWeeklyReview?.employee.name || "TBD"
    },
    trendData: {
      series: [
        { name: "Academic Excellence (Avg %)", data: trendSeries.academic },
        { name: "Teacher Effectiveness (Weighted %)", data: trendSeries.teacher }
      ],
      categories: last6Months.map(m => m.name)
    },
    impactReport
  }, 60);
    }
  } catch (e) {}

  return formatResponse(true, {
    principalStats: [
      { title: "Total Students", value: studentCount.toLocaleString(), description: "Active Enrollment", color: "text-blue-600" },
      { title: "Total Teachers", value: teacherCount.toLocaleString(), description: "Staff Reliability: 94%", color: "text-emerald-600" },
      { title: "Total Classes", value: classCount.toLocaleString(), description: "Active Sessions", color: "text-violet-600" },
      { title: "Upcoming Events", value: upcomingEvents.toString(), description: "Scheduled this week", color: "text-amber-600" },
    ],
    spotlight: {
      student: topWeeklyGrade ? `${topWeeklyGrade.student.firstName} ${topWeeklyGrade.student.lastName}` : "TBD",
      teacher: topWeeklyReview?.employee.name || "TBD"
    },
    trendData: {
      series: [
        { name: "Academic Excellence (Avg %)", data: trendSeries.academic },
        { name: "Teacher Effectiveness (Weighted %)", data: trendSeries.teacher }
      ],
      categories: last6Months.map(m => m.name)
    },
    impactReport
  });
});