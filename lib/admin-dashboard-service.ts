import { buildTenantCacheKey, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import * as financeService from "@/lib/finance/financeService";

// Helper: start of day
const getStartOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export interface DashboardMetricData {
  slug: string;
  companyName: string;
  currency: string;
  todaySales: number;
  completedOrdersToday: number;
  averageOrderValueToday: number;
  totalRevenueMonth: number;
  netRevenueMonth?: number;
  cogsMonth?: number;
  grossProfitMonth?: number;
  operatingExpensesMonth?: number;
  netProfitMonth?: number;
  accountsReceivableTotal?: number;
  accountsPayableTotal?: number;
  overdueInvoicesCount?: number;
  pendingSupplierBillsCount?: number;
  monthlyTarget: number;
  monthlyTargetProgress: number;
  newClients: number;
  totalClients: number;
  topAgent: { name: string; totalSales: number };
  lowStock: number;
  overdueTasksCount: number;
  activityBreakdown: {
    pendingOrders: number;
    pendingRequests: number;
    openTasks: number;
  };
  commissionEarned: number;
  communicationsToday: number;
  pendingTasksList: { id: string; taskName: string; dueDate: string | null }[];
  recentOrders: { id: string; name: string; status: string; totalPrice: number; createdAt?: string }[];
  activePromotions: { id: string; title: string; description: string | null; badgeText: string | null }[];
  salesLast7Days: { name: string; total: number }[];
}

export const ECOMMERCE_RETAIL_CATEGORIES = new Set([
  "ecommerce",
  "e-commerce",
  "agrovet",
  "baby store",
  "bike store",
  "book store",
  "cake store",
  "earphones store",
  "fashion shop",
  "flowers store",
  "furniture shop",
  "gaming store",
  "glasses store",
  "groceries store",
  "hardware store",
  "honey store",
  "meat store",
  "motorcycle store",
  "peanuts store",
  "pets store",
  "shoes store",
  "watch store",
  "directory & listings",
  "marketplace",
]);

export function isEcommerceRetailCategory(categoryKey: string): boolean {
  return ECOMMERCE_RETAIL_CATEGORIES.has(categoryKey?.toLowerCase()?.trim());
}

/**
 * Directly queries Prisma to fetch aggregated dashboard data for ecommerce and retail stores.
 * Avoids relative HTTP fetch overhead and network latency inside Server Components.
 */
export async function getEcommerceDashboardData(
  companyId: string,
  cachedCompany?: { id: string; name?: string | null; currency?: string | null } | null
): Promise<DashboardMetricData> {
  const fallbackResponse: DashboardMetricData = {
    slug: companyId,
    companyName: cachedCompany?.name || "Your Store",
    currency: cachedCompany?.currency || "KES",
    todaySales: 0,
    completedOrdersToday: 0,
    averageOrderValueToday: 0,
    totalRevenueMonth: 0,
    monthlyTarget: 50000,
    monthlyTargetProgress: 0,
    newClients: 0,
    totalClients: 0,
    topAgent: { name: "N/A", totalSales: 0 },
    lowStock: 0,
    overdueTasksCount: 0,
    activityBreakdown: { pendingOrders: 0, pendingRequests: 0, openTasks: 0 },
    commissionEarned: 0,
    communicationsToday: 0,
    pendingTasksList: [],
    recentOrders: [],
    activePromotions: [],
    salesLast7Days: [],
  };

  if (!companyId) return fallbackResponse;

  const cacheKey = buildTenantCacheKey(companyId, "ecommerce-dashboard", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return cached as DashboardMetricData;
  } catch {}

  try {
    let companyName = cachedCompany?.name;
    let currency = cachedCompany?.currency;

    if (!companyName || !currency) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true, currency: true, name: true },
      });
      if (company) {
        companyName = company.name || "Your Store";
        currency = company.currency || "KES";
      } else {
        companyName = "Your Store";
        currency = "KES";
      }
    }

    const monthlyTarget = 50000;
    const todayStart = getStartOfDay(new Date());
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallelize independent KPI counts and aggregations
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
      salesLast7DaysArr,
      pnlData,
      arData,
      apData,
    ] = await Promise.all([
      prisma.consumer.count({ where: { createdAt: { gte: todayStart }, companyId } }).catch(() => 0),
      prisma.consumer.count({ where: { companyId } }).catch(() => 0),
      prisma.inventoryItem.count({ where: { quantity: { lte: 5 }, companyId } }).catch(() => 0),
      prisma.conversation.count({ where: { createdAt: { gte: todayStart }, companyId } }).catch(() => 0),
      prisma.customerOrder.count({ where: { status: "PENDING", companyId } }).catch(() => 0),
      prisma.request.count({ where: { status: "PENDING", companyId } }).catch(() => 0),
      prisma.task.count({ where: { status: "PENDING", companyId } }).catch(() => 0),
      prisma.task.count({
        where: { companyId, dueDate: { lt: todayStart }, NOT: { status: "COMPLETED" } },
      }).catch(() => 0),
      prisma.task.findMany({
        where: { companyId, status: "PENDING" },
        orderBy: { dueDate: "asc" },
        take: 5,
        select: { id: true, taskName: true, dueDate: true },
      }).catch(() => []),
      prisma.customerOrder.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, status: true, totalFinalPrice: true, createdAt: true },
      }).catch(() => []),
      prisma.promotion.findMany({
        where: { companyId, endsAt: { gte: now } },
        orderBy: { endsAt: "asc" },
        take: 5,
        select: { id: true, title: true, description: true, badgeText: true },
      }).catch(() => []),
      prisma.customerOrder.aggregate({
        where: { createdAt: { gte: todayStart }, companyId, status: { notIn: ["CANCELLED", "FAILED"] } },
        _sum: { totalFinalPrice: true },
        _count: { id: true },
      }).catch(() => ({ _sum: { totalFinalPrice: 0 }, _count: { id: 0 } })),
      prisma.customerOrder.count({
        where: { status: "COMPLETED", createdAt: { gte: todayStart }, companyId },
      }).catch(() => 0),
      prisma.commission.aggregate({
        where: { createdAt: { gte: todayStart }, companyId },
        _sum: { commissionEarned: true },
      }).catch(() => ({ _sum: { commissionEarned: 0 } })),
      prisma.customerOrder.aggregate({
        where: { createdAt: { gte: monthStart }, companyId, status: { notIn: ["CANCELLED", "FAILED"] } },
        _sum: { totalFinalPrice: true },
      }).catch(() => ({ _sum: { totalFinalPrice: 0 } })),
      prisma.clientInventoryLog.groupBy({
        by: ["salesAgentId"],
        where: { createdAt: { gte: monthStart }, salesAgent: { companyId } },
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 1,
      }).catch(() => []),
      Promise.all(
        Array.from({ length: 7 }).map(async (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStart = getStartOfDay(date);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);

          const orderDay = await prisma.customerOrder.aggregate({
            where: { createdAt: { gte: dayStart, lte: dayEnd }, companyId, status: { notIn: ["CANCELLED", "FAILED"] } },
            _sum: { totalFinalPrice: true },
          }).catch(() => ({ _sum: { totalFinalPrice: 0 } }));

          return {
            name: date.toLocaleDateString("en-US", { weekday: "short" }),
            total: orderDay._sum.totalFinalPrice || 0,
          };
        })
      ).then((data) => data.reverse()),
      financeService.getIncomeStatement(companyId, { startDate: monthStart, endDate: now }).catch(() => null),
      financeService.getAccountsReceivable(companyId).catch(() => null),
      financeService.getAccountsPayable(companyId).catch(() => null),
    ]);

    const todaySales = customerOrderTodayAgg._sum.totalFinalPrice || 0;
    const totalOrdersToday = customerOrderTodayAgg._count.id || 0;
    const averageOrderValueToday = totalOrdersToday > 0 ? todaySales / totalOrdersToday : 0;
    const commissionEarned = commissionAgg._sum.commissionEarned || 0;
    const totalRevenueMonth = monthlyAggOrders._sum.totalFinalPrice || 0;
    const monthlyTargetProgress =
      monthlyTarget > 0 ? Math.min(100, (totalRevenueMonth / monthlyTarget) * 100) : 0;

    let topAgent = { name: "N/A", totalSales: 0 };
    if (agentSalesGroup.length > 0) {
      const topAgentId = agentSalesGroup[0].salesAgentId;
      const totalSales = agentSalesGroup[0]._sum.totalPrice || 0;
      const agentUser = await prisma.salesAgent.findUnique({
        where: { id: topAgentId },
        select: { user: { select: { name: true } } },
      }).catch(() => null);
      topAgent = {
        name: agentUser?.user?.name || "Agent",
        totalSales: totalSales,
      };
    }

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

    const response: DashboardMetricData = {
      slug: companyId,
      companyName: companyName || "Your Store",
      currency: currency || "KES",
      todaySales: Math.round(todaySales * 100) / 100,
      completedOrdersToday,
      averageOrderValueToday: Math.round(averageOrderValueToday * 100) / 100,
      totalRevenueMonth: Math.round(totalRevenueMonth * 100) / 100,
      netRevenueMonth: pnlData?.revenue?.netRevenue ? Math.round(pnlData.revenue.netRevenue * 100) / 100 : Math.round(totalRevenueMonth * 100) / 100,
      cogsMonth: pnlData?.cogs?.totalCOGS ? Math.round(pnlData.cogs.totalCOGS * 100) / 100 : 0,
      grossProfitMonth: pnlData?.profitability?.grossProfit ? Math.round(pnlData.profitability.grossProfit * 100) / 100 : 0,
      operatingExpensesMonth: pnlData?.profitability?.totalOperatingExpenses ? Math.round(pnlData.profitability.totalOperatingExpenses * 100) / 100 : 0,
      netProfitMonth: pnlData?.profitability?.netProfit ? Math.round(pnlData.profitability.netProfit * 100) / 100 : 0,
      accountsReceivableTotal: arData?.totalReceivables ? Math.round(arData.totalReceivables * 100) / 100 : 0,
      accountsPayableTotal: apData?.totalPayables ? Math.round(apData.totalPayables * 100) / 100 : 0,
      overdueInvoicesCount: arData?.unpaidInvoicesCount || 0,
      pendingSupplierBillsCount: apData?.unpaidBillsCount || 0,
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
      activityBreakdown: {
        pendingOrders: pendingOrders || 0,
        pendingRequests: pendingRequests || 0,
        openTasks: openTasksCount || 0,
      },
      commissionEarned: Math.round(commissionEarned * 100) / 100,
      communicationsToday,
      pendingTasksList,
      recentOrders,
      activePromotions,
      salesLast7Days: salesLast7DaysArr,
    };

    try {
      await cacheSet(cacheKey, response, 60);
    } catch {}

    return response;
  } catch (error) {
    console.error("[getEcommerceDashboardData Error]", error);
    return fallbackResponse;
  }
}
