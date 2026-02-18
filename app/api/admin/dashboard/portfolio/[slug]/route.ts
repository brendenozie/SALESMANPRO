import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Helper: start of a given day
const getStartOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const GET = withApiHandler(
  async (_request, { params, user }) => {
    const companyId = params?.slug as string;
    const userId = user?.id;

    if (!userId) {
      return formatResponse(false, { message: "User not authenticated" });
    }

    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const todayStart = getStartOfDay(now);
      const weekEnd = new Date(todayStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // --- METRIC CALCULATIONS ---

      // 1. Total Projects: Count projects where the user is a member
      
    const cacheKey = `admin:portfolio:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const totalProjects = await prisma.project.count({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      });

  try {
    if (totalProjects) {
      await cacheSet(cacheKey, totalProjects, 60);
    }
  } catch (e) {}

      // 2. Core Skills: Count expertise fields from the Expert profile
      const expertProfile = await prisma.expert.findUnique({
        where: { userId },
        select: { expertise: true },
      });
      const totalSkills = expertProfile?.expertise?.length || 0;

      // 3. Client Testimonials: Count approved testimonials linked to the user
      const testimonials = await prisma.testimonial.count({
        where: {
          authorId: userId,
          status: 'APPROVED',
        },
      });

      // 4. Inquiries this Month: Count new inquiries in the current month
      // This assumes inquiries are assigned to the user via the Expert profile
      const inquiriesThisMonth = await prisma.inquiry.count({
        where: {
          receivedAt: { gte: monthStart },
          // Assuming inquiries are assigned to the user as an expert
          assignedToAgentId: userId
        },
      });

      // 5. Upcoming Meetings: Count appointments scheduled for the next 7 days
      const upcomingMeetings = await prisma.appointment.count({
        where: {
          userId: userId,
          status: 'SCHEDULED',
          date: {
            gte: todayStart,
            lte: weekEnd,
          },
        },
      });

      // --- URGENT TASKS ---
      const tasks = await prisma.task.findMany({
        where: {
          assignedToId: userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: {
            gte: todayStart,
            lte: weekEnd, // Tasks due in the next 7 days
          },
        },
        take: 3,
        orderBy: {
          dueDate: 'asc',
        },
        select: {
          id: true,
          taskName: true,
          dueDate: true,
          dueTime: true,
        },
      });

      // --- CHART DATA (PLACEHOLDERS) ---
      // In a real implementation, you would run queries similar to the metrics queries
      // but grouped by day or month.
      const monthlyProjectViews = [ { month: 'Jan', views: 120 }, { month: 'Feb', views: 200 } ];
      const inquiriesTrend = [ { month: 'Jan', count: 25 }, { month: 'Feb', count: 42 } ];


      // --- FINAL RESPONSE ---
      const responseData = {
        metrics: {
          totalProjects,
          totalSkills,
          testimonials,
          inquiriesThisMonth,
          upcomingMeetings,
        },
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.taskName,
          dueDate: task.dueDate?.toISOString().split('T')[0] || '',
          dueTime: task.dueTime || 'Any time',
        })),
        charts: {
            monthlyProjectViews,
            inquiriesTrend
        }
      };

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching portfolio dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true } // This middleware ensures the session exists
);