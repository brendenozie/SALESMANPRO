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

      // 1. Total Posts: All blogs written by the user
      
    const cacheKey = `admin:blog:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const totalPosts = await prisma.blog.count({
        where: { authorId: userId, companyId: companyId },
      });

  try {
    if (totalPosts) {
      await cacheSet(cacheKey, totalPosts, 60);
    }
  } catch (e) {}

      // 2. Total Categories: All product categories for the company
      const totalCategories = await prisma.productCategory.count({
        where: { companyId: companyId },
      });

      // 3. Subscribers: Total active clients for the company
      const subscribers = await prisma.client.count({
        where: { companyId: companyId, membershipStatus: 'ACTIVE' },
      });

      // 4. Monthly Views: Sum of views on blogs published this month.
      const blogsThisMonth = await prisma.blog.findMany({
        where: {
          authorId: userId,
          companyId: companyId,
          publishedAt: { gte: monthStart },
          status: 'PUBLISHED',
        },
        select: { views: true }
      });
      const monthlyViews = blogsThisMonth.reduce((sum, post) => sum + post.views, 0);

      // 5. Scheduled Posts: Blogs with a future publish date
      const scheduledPosts = await prisma.blog.count({
        where: {
          authorId: userId,
          companyId: companyId,
          status: 'DRAFT', // Assuming scheduled posts are drafts
          publishedAt: { gte: now },
        },
      });

      // --- EDITORIAL TASKS ---
      const tasks = await prisma.task.findMany({
        where: {
          assignedToId: userId,
          companyId: companyId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { gte: todayStart, lte: weekEnd },
        },
        take: 3,
        orderBy: { dueDate: 'asc' },
        select: {
          id: true,
          taskName: true,
          dueDate: true,
          dueTime: true,
        },
      });
      
      // --- CHART DATA (Example Queries) ---
      // This would be replaced with real aggregation queries for charts
      const trafficOverview = [{ day: 'Mon', views: 150 }, { day: 'Tue', views: 220 }];
      const engagementMetrics = [{ type: 'Likes', value: 500 }, { type: 'Comments', value: 120 }];

      // --- FINAL RESPONSE ---
      const responseData = {
        metrics: {
          totalPosts,
          totalCategories,
          subscribers,
          monthlyViews,
          scheduledPosts,
        },
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.taskName,
          dueDate: task.dueDate?.toISOString().split('T')[0] || 'N/A',
          dueTime: task.dueTime || 'Any time',
        })),
        charts: {
            trafficOverview,
            engagementMetrics
        }
      };

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching blog dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true } // Middleware to ensure user is authenticated
);