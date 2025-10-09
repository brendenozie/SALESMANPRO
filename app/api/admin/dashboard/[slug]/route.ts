import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Helper function to get the start of a specific day
const getStartOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const GET = withApiHandler(
  async (_request, { params }) => {
    const { slug } = params;

    try {
      // --- Get Company Info for currency ---
      const company = await prisma.company.findUnique({
        where: { slug },
        select: { currency: true, name: true },
      });
      const currency = company?.currency || 'KES';
      const companyName = company?.name || 'Your Company';

      const todayStart = getStartOfDay(new Date());

      // --- Dashboard KPIs ---
      const newClients = await prisma.client.count({
        where: { createdAt: { gte: todayStart }, companyId: slug },
      });

      const lowStock = await prisma.inventoryItem.count({
        where: { quantity: { lte: 5 }, companyId: slug },
      });

      const communicationsToday = await prisma.conversation.count({
        where: { createdAt: { gte: todayStart }, companyId: slug },
      });

      const pendingOrders = await prisma.customerOrder.count({
        where: { status: "PENDING", companyId: slug },
      });

      const pendingRequests = await prisma.request.count({
        where: { status: "PENDING", companyId: slug },
      });
      
      const pendingActions = pendingOrders + pendingRequests;

      // --- Top Agent by Sales ---
      const agents = await prisma.salesAgent.findMany({
        where: { companyId: slug },
        include: { user: true, AgentInventory: { include: { AgentInventoryLog: true } } },
      });
      const agentSalesData = agents.map((agent) => {
        const totalSales = agent.AgentInventory.reduce((sum, inv) => 
            sum + inv.AgentInventoryLog.reduce((logSum, log) => logSum + log.totalPrice, 0), 0);
        return { name: agent.user.name, totalSales };
      }).sort((a, b) => b.totalSales - a.totalSales);
      
      const topAgentData = agentSalesData[0] || { name: "N/A", totalSales: 0 };

      // --- Sales + Commission Today ---
      const todaySales = await prisma.agentInventoryLog.aggregate({
        where: { createdAt: { gte: todayStart } },
        _sum: { totalPrice: true },
      });

      const commissionEarned = await prisma.commission.aggregate({
        where: { createdAt: { gte: todayStart } },
        _sum: { commissionEarned: true },
      });

      // --- Monthly Target Progress ---
      const monthlyTarget = 50000; // This could be fetched dynamically from a Target model
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const monthlySales = await prisma.agentInventoryLog.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { totalPrice: true },
      });
      const monthlyTargetProgress = ((monthlySales._sum.totalPrice || 0) / monthlyTarget) * 100;

      // --- Data for UI Lists ---
      const pendingTasks = await prisma.task.findMany({
        where: { status: "PENDING", companyId: slug },
        orderBy: { dueDate: "asc" },
        take: 3,
      });

      const recentOrders = await prisma.customerOrder.findMany({
        where: { companyId: slug },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, name: true, status: true, totalPrice: true },
      });

      const activePromotions = await prisma.promotion.findMany({
        where: { 
          companyId: slug,
          endsAt: { gte: new Date() }
        },
        orderBy: { endsAt: 'asc' },
        take: 3,
        select: { id: true, title: true, description: true, badgeText: true }
      });
      
      // --- Data for Sales Chart (Last 7 Days) ---
      const salesLast7Days = await Promise.all(
        Array.from({ length: 7 }).map(async (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStart = getStartOfDay(date);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);

          const dailySale = await prisma.agentInventoryLog.aggregate({
            where: { createdAt: { gte: dayStart, lte: dayEnd } },
            _sum: { totalPrice: true },
          });

          return {
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            total: dailySale._sum.totalPrice || 0,
          };
        })
      ).then(data => data.reverse());


      // --- Final Response ---
      return formatResponse(true, {
        companyName,
        currency,
        newClients,
        lowStock,
        topAgent: topAgentData,
        communicationsToday,
        pendingOrders,
        pendingRequests,
        pendingActions,
        todaySales: todaySales._sum.totalPrice || 0,
        commissionEarned: commissionEarned._sum.commissionEarned || 0,
        monthlySales: monthlySales._sum.totalPrice || 0,
        monthlyTarget,
        monthlyTargetProgress,
        pendingTasks,
        recentOrders,
        activePromotions,
        salesLast7Days,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  },
  { requireAuth: true }
);