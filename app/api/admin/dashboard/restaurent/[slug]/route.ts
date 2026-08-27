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
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));
      
      // --- METRIC CALCULATIONS FOR TODAY ---

      // 1. Total Orders Today
      
    const cacheKey = `admin:restaurent:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const totalOrders = await prisma.customerOrder.count({
        where: { 
          companyId: companyId,
          createdAt: { gte: todayStart, lte: todayEnd }
        },
      });

      // 2. Active Deliveries
      const activeDeliveries = await prisma.delivery.count({
        where: {
          companyId: companyId,
          status: { in: ['Pending', 'InProgress'] },
        },
      });
      
      // 3. Total Menu Items (Products)
      const menuItems = await prisma.product.count({
        where: { companyId: companyId },
      });

      // 4. Revenue Today
      const revenueAggregate = await prisma.customerOrder.aggregate({
        _sum: { totalFinalPrice: true },
        where: {
          companyId: companyId,
          paymentStatus: 'COMPLETED',
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      });
      const revenueToday = revenueAggregate._sum.totalFinalPrice || 0;

      // --- RUSH TASKS ---
      const tasks = await prisma.task.findMany({
        where: {
          assignedToId: userId,
          companyId: companyId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { gte: todayStart, lte: todayEnd },
        },
        take: 3,
        orderBy: { dueTime: 'asc' }, // Order by time for today's tasks
        select: {
          id: true,
          taskName: true,
          dueDate: true,
          dueTime: true,
        },
      });

      // --- CHART DATA (Example Stubs) ---
      const dailyOrdersVolume = [{ hour: '11AM', orders: 15 }, { hour: '12PM', orders: 45 }];
      const revenueTrends = [{ day: 'Mon', revenue: 15000 }, { day: 'Tue', revenue: 18200 }];

      // --- FINAL RESPONSE ---
      const responseData = {
        metrics: {
          totalOrders,
          activeDeliveries,
          menuItems,
          revenueToday,
        },
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.taskName,
          dueDate: task.dueTime || 'N/A', // Using dueTime for today's tasks
          dueTime: task.dueTime || 'Any time',
        })),
        charts: {
            dailyOrdersVolume,
            revenueTrends
        }
      };

      // --- CACHE THE RESPONSE ---
      try {
        await cacheSet(cacheKey, responseData, 60); // Cache for 60 seconds
      } catch (e) {
        console.error("Cache Set Error:", e);
      }

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching restaurant dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true }
);