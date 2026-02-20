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
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));

      // Use a transaction for parallel queries
      
    const cacheKey = `admin:finance-legal:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const [
        totalClients,
        activeContracts,
        pendingInvoices,
        revenueData,
        scheduledMeetings,
        tasks,
        caseDistribution
      ] = await prisma.$transaction([
        // 1. Total Clients
        prisma.client.count({ where: { companyId } }),

        // 2. Active Contracts
        prisma.offerContract.count({ where: { companyId, status: { in: ['Pending', 'Accepted'] } } }),

        // 3. Pending Invoices
        prisma.invoice.count({ where: { companyId, status: { in: ['PENDING', 'OVERDUE'] } } }),

        // 4. Revenue This Month
        prisma.billingTransaction.aggregate({
          _sum: { amount: true },
          where: { companyId, status: 'COMPLETED', transactionDate: { gte: monthStart } },
        }),

        // 5. Scheduled Meetings for Today
        prisma.financeAppointment.count({
          where: { companyId, status: 'SCHEDULED', date: { gte: todayStart, lte: todayEnd } },
        }),
        
        // 6. Critical Tasks
        prisma.task.findMany({
            where: {
                assignedToId: userId,
                companyId: companyId,
                status: 'PENDING',
                dueDate: { gte: todayStart, lte: new Date(todayStart.getTime() + 2 * 24 * 60 * 60 * 1000) } // Today & Tomorrow
            },
            take: 3,
            orderBy: { dueDate: 'asc' },
            select: { id: true, taskName: true, dueDate: true, dueTime: true }
        }),
        
        // 7. Case Distribution Data
        prisma.case.groupBy({
            by: ['caseType'],
            where: { companyId },
            _count: { _all: true },
            orderBy: { caseType: 'asc' }
        })
      ]);

      const revenueThisMonth = revenueData._sum.amount || 0;

      const responseData = {
        metrics: {
          totalClients,
          activeContracts,
          pendingInvoices,
          revenueThisMonth,
          scheduledMeetings,
        },
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.taskName,
          dueDate: task.dueDate?.toLocaleDateString('en-US', { weekday: 'short' }) || 'Today',
          dueTime: task.dueTime || 'Any time',
        })),
        charts: {
            caseDistribution: caseDistribution.map(item => ({ type: item.caseType, count: (item._count as any)?._all ?? 0 })),
            // Revenue growth would require a more complex historical query, stubbed for now
            revenueGrowth: [15000, 22000, 18000, 29000, revenueThisMonth]
        }
      };

      try {
        await cacheSet(cacheKey, responseData, 60);
      } catch (e) {
        console.error("Failed to cache finance/legal dashboard data:", e);
      }

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching finance/legal dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true }
);