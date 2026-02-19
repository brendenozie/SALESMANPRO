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
      const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
      const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

      
    const cacheKey = `admin:real-estate:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const [
        totalProperties,
        totalAgents,
        totalClients,
        revenueData,
        appointmentsToday,
        tasks
      ] = await prisma.$transaction([
        // 1. Total Properties
        prisma.marketplaceListings.count({ where: { companyId: companyId, } }), // status: 'AVAILABLE'
        
        // 2. Total Agents status: 'ACTIVE'
        prisma.salesAgent.count({ where: { companyId: companyId,  } }),

        // 3. Total Clients
        prisma.client.count({ where: { companyId: companyId } }),

        // 4. Revenue This Month (from paid invoices)
        (() => {
          const invoiceWhere: any = { companyId: companyId, status: 'PAID', 
            // invoiceDate: { gte: monthStart } 
          };

  
          return prisma.invoice.aggregate({
            _sum: { amount: true },
            where: invoiceWhere,
          });
        })(),

        // 5. Appointments Today
        prisma.appointment.count({
          where: { companyId: companyId, date: { gte: todayStart, lte: todayEnd } },
        }),
        
        // 6. Today's Tasks for the user
        prisma.task.findMany({
            where: {
                assignedToId: userId,
                companyId: companyId,
                status: 'PENDING',
                dueDate: { gte: todayStart, lte: todayEnd }
            },
            take: 3,
            orderBy: { dueTime: 'asc' },
            select: { id: true, taskName: true, dueTime: true }
        })
      ]);

      const revenueThisMonth = revenueData._sum.amount || 0;
      
      const responseData = {
        metrics: {
          totalProperties,
          totalAgents,
          totalClients,
          revenueThisMonth,
          appointmentsToday,
        },
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.taskName,
          dueDate: 'Today',
          dueTime: task.dueTime || 'Any time',
        })),
      };

      try {
        await cacheSet(cacheKey, responseData, 60); // Cache for 60 seconds
      } catch (e) {
        console.error("Cache Set Error:", e);
      }

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching real estate dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true }
);