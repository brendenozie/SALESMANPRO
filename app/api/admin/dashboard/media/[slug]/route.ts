import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(
  async (_request, { params, user }) => {
    const companyId = params?.slug as string;
    const userId = user?.id;

    if (!userId || !companyId) {
      return formatResponse(false, { message: "User or Company not identified in session" });
    }

    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekEnd = new Date(new Date().setDate(todayStart.getDate() + 7));

      // --- METRIC CALCULATIONS ---
      
    const cacheKey = `admin:media:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const [
        totalVideos,
        totalArticles,
        activeSubscribers,
        revenueData,
        premieresScheduled,
        tasks
      ] = await prisma.$transaction([
        // 1. Total Videos
        prisma.video.count({ where: { companyId } }),
        
        // 2. Total Articles (Blogs)
        prisma.blog.count({ where: { companyId } }),

        // 3. Active Subscribers
        prisma.subscription.count({ where: { companyId, status: 'ACTIVE' } }),

        // 4. Revenue This Month
        prisma.billingTransaction.aggregate({
          _sum: { amount: true },
          where: { companyId, transactionDate: { gte: monthStart }, status: 'COMPLETED' },
        }),

        // 5. Scheduled Premieres (using Content model)
        prisma.content.count({
            where: { companyId, status: 'Scheduled', publishDate: { gte: now } }
        }),

        // 6. Editorial Tasks
        prisma.task.findMany({
            where: {
                assignedToId: userId,
                companyId: companyId,
                status: { in: ['PENDING', 'IN_PROGRESS'] },
                dueDate: { gte: todayStart, lte: weekEnd }
            },
            take: 3,
            orderBy: { dueDate: 'asc' },
            select: { id: true, taskName: true, dueDate: true, dueTime: true },
        })
      ]);

      const revenueThisMonth = revenueData._sum.amount || 0;

      // --- FINAL RESPONSE ---
      const responseData = {
        metrics: {
          totalVideos,
          totalArticles,
          activeSubscribers,
          revenueThisMonth,
          premieresScheduled,
        },
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.taskName,
          dueDate: task.dueDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'Today',
          dueTime: task.dueTime || 'Any time',
        })),
      };

      try {
        await cacheSet(cacheKey, responseData, 60); // Cache for 60 seconds
      } catch (e) {
        console.error("Failed to cache media dashboard data:", e);
      }
      
      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching media dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true }
);