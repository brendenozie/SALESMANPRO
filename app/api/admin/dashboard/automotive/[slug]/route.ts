import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
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
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));

      
    const cacheKey = buildTenantCacheKey(companyId, "automotive", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const [
        totalVehicles,
        vehiclesSold,
        activeListings,
        revenueData,
        serviceBookingsToday,
        tasks,
        inventoryBreakdown
      ] = await prisma.$transaction([
        // 1. Total Inventory (Products)
        prisma.product.count({ where: { companyId } }),

        // 2. Units Sold This Month
        prisma.customerOrder.count({
          where: {
            companyId,
            createdAt: { gte: monthStart },
            status: { in: ['COMPLETED', 'SHIPPED'] },
          },
        }),

        // 3. Active Listings
        prisma.marketplaceListings.count({
          where: { companyId, status: 'ACTIVE' },
        }),

        // 4. Gross Revenue This Month
        prisma.customerOrder.aggregate({
          _sum: { totalFinalPrice: true },
          where: {
            companyId,
            createdAt: { gte: monthStart },
            paymentStatus: 'COMPLETED',
          },
        }),

        // 5. Service Bookings Today (using Appointment model)
        prisma.appointment.count({
          where: {
            companyId,
            date: { gte: todayStart, lte: todayEnd },
            // Assuming a service description implies it's a service booking
            service: { not: null },
          },
        }),
        
        // 6. Today's Tasks
        prisma.task.findMany({
            where: {
                assignedToId: userId,
                companyId: companyId,
                status: 'PENDING',
                dueDate: { gte: todayStart, lte: todayEnd }
            },
            take: 3,
            orderBy: { dueTime: 'asc' },
            select: { id: true, taskName: true, dueDate: true, dueTime: true }
        }),
        
        // 7. Inventory Breakdown by Type
        prisma.product.groupBy({
            by: ['type'],
            where: { companyId, type: { not: null } },
            _count: { _all: true },
            orderBy: { _count: { id: 'desc' } },
            take: 4
        })
      ]);

      const revenueThisMonth = revenueData._sum.totalFinalPrice || 0;
      
      const responseData = {
        metrics: {
          totalVehicles,
          vehiclesSold,
          activeListings,
          revenueThisMonth,
          serviceBookingsToday,
        },
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.taskName,
          dueDate: 'Today',
          dueTime: task.dueTime || 'Any time',
        })),
        charts: {
            inventoryBreakdown: inventoryBreakdown.map(item => {
              const count = (typeof item._count === 'object' && item._count !== null)
                ? (item._count._all ?? 0)
                : (typeof item._count === 'number' ? item._count : 0);
              return { type: item.type ?? 'Other', count };
            }),
            // Sales trend would require a more complex historical query; stubbed for now.
            salesTrend: [12, 18, 15, 22, vehiclesSold]
        }
      };

      try {
          await cacheSet(cacheKey, responseData, 60);
      } catch (e) {}

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching automotive dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true }
);