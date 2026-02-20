import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
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
      // --- Get Company ID from Slug ---
      // IMPORTANT: All queries must use the company's ObjectId, not its slug.
      
    const cacheKey = `admin:ecommerce:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const company = await prisma.company.findUnique({
        where: { id : companyId },
        select: { id: true, currency: true, name: true },
      });

      if (!company) {
        return formatResponse(false, { message: "Company not found" });
      }
      // const companyId = company.id; // Use this ID in all subsequent queries

      const currency = company.currency || "KES";
      const companyName = company.name || "Your Company";
      const monthlyTarget = 50000; // Hardcoded target as it's not in the schema

      const todayStart = getStartOfDay(new Date());
      const now = new Date();

      // --- Counts / Simple KPIs ---
      const newClients = await prisma.client.count({
        where: { createdAt: { gte: todayStart }, companyId }, // FIXED: Use companyId
      });

      const totalClients = await prisma.client.count({
        where: { companyId }, // FIXED: Use companyId
      });

      const lowStock = await prisma.inventoryItem.count({
        where: { quantity: { lte: 5 }, companyId }, // FIXED: Use companyId
      });

      const communicationsToday = await prisma.conversation.count({
        where: { createdAt: { gte: todayStart }, companyId }, // FIXED: Use companyId
      });

      const pendingOrders = await prisma.customerOrder.count({
        where: { status: "PENDING", companyId }, // FIXED: Use companyId
      });

      const pendingRequests = await prisma.request.count({
        where: { status: "PENDING", companyId }, // FIXED: Use companyId
      });

      // --- Tasks ---
      const openTasksCount = await prisma.task.count({
        where: { status: "PENDING", companyId }, // FIXED: Use companyId
      });

      // FIXED: Overdue logic now checks dueDate against today and ensures task is not completed.
      const overdueTasksCount = await prisma.task.count({
        where: {
          companyId,
          dueDate: { lt: todayStart },
          NOT: { status: "COMPLETED" },
        },
      });

      // PENDING TASKS: Fetch tasks that are pending
      const pendingTasksListRaw = await prisma.task.findMany({
        where: {
          companyId,
          status: "PENDING",
        },
        orderBy: { dueDate: "asc" },
        take: 5,
        // CHANGED: Task model has `taskName`, not `title`.
        select: { id: true, taskName: true, dueDate: true },
      });

      const pendingTasksList = pendingTasksListRaw.map((t) => ({
        id: t.id,
        taskName: t.taskName ?? "Task", // FIXED: Use taskName
        dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
      }));

      // --- Recent Orders (last 5) ---
      const recentOrdersRaw = await prisma.customerOrder.findMany({
        where: { companyId }, // FIXED: Use companyId
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, status: true, totalFinalPrice: true, createdAt: true },
      });

      const recentOrders = recentOrdersRaw.map((o) => ({
        id: o.id,
        name: o.name ?? "N/A",
        status: o.status ?? "UNKNOWN",
        // CHANGED: Using totalFinalPrice as it is more accurate than totalPrice.
        totalPrice: typeof o.totalFinalPrice === "number" ? o.totalFinalPrice : 0,
        createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : undefined,
      }));

      // --- Active Promotions ---
      const activePromotionsRaw = await prisma.promotion.findMany({
        where: {
          companyId, // FIXED: Use companyId
          endsAt: { gte: now },
        },
        orderBy: { endsAt: "asc" },
        take: 5,
        select: { id: true, title: true, description: true, badgeText: true },
      });

      const activePromotions = activePromotionsRaw.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description ?? null,
        badgeText: p.badgeText ?? null,
      }));

      // --- Sales, Completed Orders & Average Order Value for Today ---
      // REVISED: Using CustomerOrder for sales calculation is more direct and reliable.
      const customerOrderTodayAgg = await prisma.customerOrder.aggregate({
        where: { createdAt: { gte: todayStart }, companyId }, // FIXED: Use companyId
        _sum: { totalFinalPrice: true },
        _count: { id: true },
      });

      const todaySales = customerOrderTodayAgg._sum.totalFinalPrice || 0;
      const completedOrdersToday = await prisma.customerOrder.count({
        where: { status: "COMPLETED", createdAt: { gte: todayStart }, companyId },
      });
      const totalOrdersToday = customerOrderTodayAgg._count.id || 0;

      const averageOrderValueToday =
        totalOrdersToday > 0 ? todaySales / totalOrdersToday : 0;

      // --- Commission Earned Today ---
      const commissionAgg = await prisma.commission.aggregate({
        where: { createdAt: { gte: todayStart }, companyId }, // FIXED: Use companyId
        _sum: { commissionEarned: true },
      });
      const commissionEarned = commissionAgg._sum.commissionEarned || 0;

      // --- Monthly Sales & Target Progress ---
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const monthlyAggOrders = await prisma.customerOrder.aggregate({
        where: { createdAt: { gte: monthStart }, companyId }, // FIXED: Use companyId
        _sum: { totalFinalPrice: true },
      });

      const totalRevenueMonth = monthlyAggOrders._sum.totalFinalPrice || 0;
      const monthlyTargetProgress =
        monthlyTarget > 0 ? Math.min(100, (totalRevenueMonth / monthlyTarget) * 100) : 0;

      // --- Activity Breakdown ---
      const activityBreakdown = {
        pendingOrders: pendingOrders || 0,
        pendingRequests: pendingRequests || 0,
        openTasks: openTasksCount || 0,
      };

      // --- Top Agent by Sales (This Month) ---
      // REVISED: Using ClientInventoryLog which has a clearer sales structure and better relationship for querying.
      let topAgent = { name: "N/A", totalSales: 0 };
      const agentSalesGroup = await prisma.clientInventoryLog.groupBy({
        by: ["salesAgentId"],
        where: {
          createdAt: { gte: monthStart },
          salesAgent: { companyId }, // Filter by company through the agent
        },
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 1,
      });

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

      // --- Sales Last 7 Days Chart ---
      const salesLast7DaysArr = await Promise.all(
        Array.from({ length: 7 }).map(async (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStart = getStartOfDay(date);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);

          const orderDay = await prisma.customerOrder.aggregate({
            where: { createdAt: { gte: dayStart, lte: dayEnd }, companyId }, // FIXED: Use companyId
            _sum: { totalFinalPrice: true },
          });

          return {
            name: date.toLocaleDateString("en-US", { weekday: "short" }),
            total: orderDay._sum.totalFinalPrice || 0,
          };
        })
      ).then((data) => data.reverse());

      // --- Final shaped response matching DashboardData ---
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

      try {        await cacheSet(cacheKey, response, 60); // Cache for 60 seconds
      } catch (e) {
        console.error("Failed to cache ecommerce dashboard data:", e);
      }

      return formatResponse(true, response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true }
);

// export default GET;