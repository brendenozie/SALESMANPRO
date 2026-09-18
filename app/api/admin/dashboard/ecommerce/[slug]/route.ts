import { buildTenantCacheKey, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Helper: start of day
const getStartOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const GET = withApiHandler(
  async (_request, { params }) => {
    const companyId = params?.slug as string;

    try {
      const cacheKey = buildTenantCacheKey(companyId, "ecommerce", {});

      try {
        const cached = await cacheGet(cacheKey);
        if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
      } catch (e) {}

      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true, currency: true, name: true },
      });

      if (!company) {
        return formatResponse(false, { message: "Company not found" }, "Not found", 404);
      }

      const currency = company.currency || "KES";
      const companyName = company.name || "Your Company";
      const monthlyTarget = 50000;

      const now = new Date();
      const todayStart = getStartOfDay(now);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // --- Parallelized Counts and Simple KPIs ---
      const [
        newClients,
        totalClients,
        lowStock,
        communicationsToday,
        pendingOrders,
        pendingRequests,
        openTasksCount,
        overdueTasksCount,
        pendingTasksListRaw,
        recentOrdersRaw,
        activePromotionsRaw,
        customerOrderTodayAgg,
        completedOrdersToday,
        commissionAgg,
        monthlyAggOrders,
        agentSalesGroup,
      ] = await Promise.all([
        prisma.consumer.count({
          where: { createdAt: { gte: todayStart }, companyId },
        }),
        prisma.consumer.count({
          where: { companyId },
        }),
        prisma.inventoryItem.count({
          where: { quantity: { lte: 5 }, companyId },
        }),
        prisma.conversation.count({
          where: { createdAt: { gte: todayStart }, companyId },
        }),
        prisma.customerOrder.count({
          where: { status: "PENDING", companyId },
        }),
        prisma.request.count({
          where: { status: "PENDING", companyId },
        }),
        prisma.task.count({
          where: { status: "PENDING", companyId },
        }),
        prisma.task.count({
          where: {
            companyId,
            dueDate: { lt: todayStart },
            NOT: { status: "COMPLETED" },
          },
        }),
        prisma.task.findMany({
          where: { companyId, status: "PENDING" },
          orderBy: { dueDate: "asc" },
          take: 5,
          select: { id: true, taskName: true, dueDate: true },
        }),
        prisma.customerOrder.findMany({
          where: { companyId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            status: true,
            totalFinalPrice: true,
            createdAt: true,
          },
        }),
        prisma.promotion.findMany({
          where: { companyId, endsAt: { gte: now } },
          orderBy: { endsAt: "asc" },
          take: 5,
          select: { id: true, title: true, description: true, badgeText: true },
        }),
        prisma.customerOrder.aggregate({
          where: {
            createdAt: { gte: todayStart },
            companyId,
            status: { notIn: ["CANCELLED", "FAILED"] },
          },
          _sum: { totalFinalPrice: true },
          _count: { id: true },
        }),
        prisma.customerOrder.count({
          where: {
            status: "COMPLETED",
            createdAt: { gte: todayStart },
            companyId,
          },
        }),
        prisma.commission.aggregate({
          where: { createdAt: { gte: todayStart }, companyId },
          _sum: { commissionEarned: true },
        }),
        prisma.customerOrder.aggregate({
          where: {
            createdAt: { gte: monthStart },
            companyId,
            status: { notIn: ["CANCELLED", "FAILED"] },
          },
          _sum: { totalFinalPrice: true },
        }),
        prisma.clientInventoryLog.groupBy({
          by: ["salesAgentId"],
          where: {
            createdAt: { gte: monthStart },
            salesAgent: { companyId },
          },
          _sum: { totalPrice: true },
          orderBy: { _sum: { totalPrice: "desc" } },
          take: 1,
        }),
      ]);

      const todaySales = customerOrderTodayAgg._sum.totalFinalPrice || 0;
      const totalOrdersToday = customerOrderTodayAgg._count.id || 0;
      const averageOrderValueToday = totalOrdersToday > 0 ? todaySales / totalOrdersToday : 0;
      const commissionEarned = commissionAgg._sum.commissionEarned || 0;
      const totalRevenueMonth = monthlyAggOrders._sum.totalFinalPrice || 0;
      const monthlyTargetProgress = monthlyTarget > 0 ? Math.min(100, (totalRevenueMonth / monthlyTarget) * 100) : 0;

      const activityBreakdown = {
        pendingOrders: pendingOrders || 0,
        pendingRequests: pendingRequests || 0,
        openTasks: openTasksCount || 0,
      };

      const pendingTasksList = pendingTasksListRaw.map((t) => ({
        id: t.id,
        taskName: t.taskName ?? "Task",
        dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
      }));

      const recentOrders = recentOrdersRaw.map((o) => ({
        id: o.id,
        name: o.name ?? "N/A",
        status: o.status ?? "UNKNOWN",
        totalPrice: typeof o.totalFinalPrice === "number" ? o.totalFinalPrice : 0,
        createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : undefined,
      }));

      const activePromotions = activePromotionsRaw.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description ?? null,
        badgeText: p.badgeText ?? null,
      }));

      let topAgent = { name: "N/A", totalSales: 0 };
      if (agentSalesGroup.length > 0) {
        const topAgentId = agentSalesGroup[0].salesAgentId;
        const totalSales = agentSalesGroup[0]._sum.totalPrice || 0;
        const agentUser = await prisma.salesAgent.findUnique({
          where: { id: topAgentId },
          select: { user: { select: { name: true } } },
        });
        topAgent = {
          name: agentUser?.user?.name || "Unknown Agent",
          totalSales: totalSales,
        };
      }

      // 7-day sales trend with status filter excluding cancelled/failed orders
      const salesLast7DaysArr = await Promise.all(
        Array.from({ length: 7 }).map(async (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStart = getStartOfDay(date);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);

          const orderDay = await prisma.customerOrder.aggregate({
            where: {
              createdAt: { gte: dayStart, lte: dayEnd },
              companyId,
              status: { notIn: ["CANCELLED", "FAILED"] },
            },
            _sum: { totalFinalPrice: true },
          });

          return {
            name: date.toLocaleDateString("en-US", { weekday: "short" }),
            total: orderDay._sum.totalFinalPrice || 0,
          };
        }),
      ).then((data) => data.reverse());

      const response = {
        slug: companyId,
        companyName,
        currency,
        todaySales: Math.round(todaySales * 100) / 100,
        completedOrdersToday,
        averageOrderValueToday: Math.round(averageOrderValueToday * 100) / 100,
        totalRevenueMonth: Math.round(totalRevenueMonth * 100) / 100,
        monthlyTarget,
        monthlyTargetProgress: Math.round(monthlyTargetProgress),
        newClients,
        totalClients,
        topAgent: {
          name: topAgent.name,
          totalSales: Math.round(topAgent.totalSales * 100) / 100,
        },
        lowStock,
        overdueTasksCount,
        activityBreakdown,
        commissionEarned: Math.round(commissionEarned * 100) / 100,
        communicationsToday,
        pendingTasksList,
        recentOrders,
        activePromotions,
        salesLast7Days: salesLast7DaysArr,
      };

      try {
        await cacheSet(cacheKey, response, 60);
      } catch (e) {
        console.error("Failed to cache ecommerce dashboard data:", e);
      }

      return formatResponse(true, response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, {
        message: "Failed to fetch dashboard data",
        error: errorMessage,
      }, errorMessage, 500);
    }
  },
  { requireAuth: true },
);
