"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEcommerceDashboardData = exports.isEcommerceRetailCategory = exports.ECOMMERCE_RETAIL_CATEGORIES = void 0;
const cache_1 = require("@/lib/cache");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const financeService = __importStar(require("@/lib/finance/financeService"));
// Helper: start of day
const getStartOfDay = (date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
};
exports.ECOMMERCE_RETAIL_CATEGORIES = new Set([
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
function isEcommerceRetailCategory(categoryKey) {
    return exports.ECOMMERCE_RETAIL_CATEGORIES.has(categoryKey?.toLowerCase()?.trim());
}
exports.isEcommerceRetailCategory = isEcommerceRetailCategory;
/**
 * Directly queries Prisma to fetch aggregated dashboard data for ecommerce and retail stores.
 * Avoids relative HTTP fetch overhead and network latency inside Server Components.
 */
async function getEcommerceDashboardData(companyId, cachedCompany) {
    const fallbackResponse = {
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
    if (!companyId)
        return fallbackResponse;
    const cacheKey = (0, cache_1.buildTenantCacheKey)(companyId, "ecommerce-dashboard", {});
    try {
        const cached = await (0, cache_1.cacheGet)(cacheKey);
        if (cached)
            return cached;
    }
    catch { }
    try {
        let companyName = cachedCompany?.name;
        let currency = cachedCompany?.currency;
        if (!companyName || !currency) {
            const company = await prismadb_1.default.company.findUnique({
                where: { id: companyId },
                select: { id: true, currency: true, name: true },
            });
            if (company) {
                companyName = company.name || "Your Store";
                currency = company.currency || "KES";
            }
            else {
                companyName = "Your Store";
                currency = "KES";
            }
        }
        const monthlyTarget = 50000;
        const todayStart = getStartOfDay(new Date());
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        // Parallelize independent KPI counts and aggregations
        const [newClients, totalClients, lowStock, communicationsToday, pendingOrders, pendingRequests, openTasksCount, overdueTasksCount, pendingTasksListRaw, recentOrdersRaw, activePromotionsRaw, customerOrderTodayAgg, completedOrdersToday, commissionAgg, monthlyAggOrders, agentSalesGroup, salesLast7DaysArr, pnlData, arData, apData,] = await Promise.all([
            prismadb_1.default.consumer.count({ where: { createdAt: { gte: todayStart }, companyId } }).catch(() => 0),
            prismadb_1.default.consumer.count({ where: { companyId } }).catch(() => 0),
            prismadb_1.default.inventoryItem.count({ where: { quantity: { lte: 5 }, companyId } }).catch(() => 0),
            prismadb_1.default.conversation.count({ where: { createdAt: { gte: todayStart }, companyId } }).catch(() => 0),
            prismadb_1.default.customerOrder.count({ where: { status: "PENDING", companyId } }).catch(() => 0),
            prismadb_1.default.request.count({ where: { status: "PENDING", companyId } }).catch(() => 0),
            prismadb_1.default.task.count({ where: { status: "PENDING", companyId } }).catch(() => 0),
            prismadb_1.default.task.count({
                where: { companyId, dueDate: { lt: todayStart }, NOT: { status: "COMPLETED" } },
            }).catch(() => 0),
            prismadb_1.default.task.findMany({
                where: { companyId, status: "PENDING" },
                orderBy: { dueDate: "asc" },
                take: 5,
                select: { id: true, taskName: true, dueDate: true },
            }).catch(() => []),
            prismadb_1.default.customerOrder.findMany({
                where: { companyId },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { id: true, name: true, status: true, totalFinalPrice: true, createdAt: true },
            }).catch(() => []),
            prismadb_1.default.promotion.findMany({
                where: { companyId, endsAt: { gte: now } },
                orderBy: { endsAt: "asc" },
                take: 5,
                select: { id: true, title: true, description: true, badgeText: true },
            }).catch(() => []),
            prismadb_1.default.customerOrder.aggregate({
                where: { createdAt: { gte: todayStart }, companyId, status: { notIn: ["CANCELLED", "FAILED"] } },
                _sum: { totalFinalPrice: true },
                _count: { id: true },
            }).catch(() => ({ _sum: { totalFinalPrice: 0 }, _count: { id: 0 } })),
            prismadb_1.default.customerOrder.count({
                where: { status: "COMPLETED", createdAt: { gte: todayStart }, companyId },
            }).catch(() => 0),
            prismadb_1.default.commission.aggregate({
                where: { createdAt: { gte: todayStart }, companyId },
                _sum: { commissionEarned: true },
            }).catch(() => ({ _sum: { commissionEarned: 0 } })),
            prismadb_1.default.customerOrder.aggregate({
                where: { createdAt: { gte: monthStart }, companyId, status: { notIn: ["CANCELLED", "FAILED"] } },
                _sum: { totalFinalPrice: true },
            }).catch(() => ({ _sum: { totalFinalPrice: 0 } })),
            prismadb_1.default.clientInventoryLog.groupBy({
                by: ["salesAgentId"],
                where: { createdAt: { gte: monthStart }, salesAgent: { companyId } },
                _sum: { totalPrice: true },
                orderBy: { _sum: { totalPrice: "desc" } },
                take: 1,
            }).catch(() => []),
            Promise.all(Array.from({ length: 7 }).map(async (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayStart = getStartOfDay(date);
                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);
                const orderDay = await prismadb_1.default.customerOrder.aggregate({
                    where: { createdAt: { gte: dayStart, lte: dayEnd }, companyId, status: { notIn: ["CANCELLED", "FAILED"] } },
                    _sum: { totalFinalPrice: true },
                }).catch(() => ({ _sum: { totalFinalPrice: 0 } }));
                return {
                    name: date.toLocaleDateString("en-US", { weekday: "short" }),
                    total: orderDay._sum.totalFinalPrice || 0,
                };
            })).then((data) => data.reverse()),
            financeService.getIncomeStatement(companyId, { startDate: monthStart, endDate: now }).catch(() => null),
            financeService.getAccountsReceivable(companyId).catch(() => null),
            financeService.getAccountsPayable(companyId).catch(() => null),
        ]);
        const todaySales = customerOrderTodayAgg._sum.totalFinalPrice || 0;
        const totalOrdersToday = customerOrderTodayAgg._count.id || 0;
        const averageOrderValueToday = totalOrdersToday > 0 ? todaySales / totalOrdersToday : 0;
        const commissionEarned = commissionAgg._sum.commissionEarned || 0;
        const totalRevenueMonth = monthlyAggOrders._sum.totalFinalPrice || 0;
        const monthlyTargetProgress = monthlyTarget > 0 ? Math.min(100, (totalRevenueMonth / monthlyTarget) * 100) : 0;
        let topAgent = { name: "N/A", totalSales: 0 };
        if (agentSalesGroup.length > 0) {
            const topAgentId = agentSalesGroup[0].salesAgentId;
            const totalSales = agentSalesGroup[0]._sum.totalPrice || 0;
            const agentUser = await prismadb_1.default.salesAgent.findUnique({
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
        const response = {
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
            await (0, cache_1.cacheSet)(cacheKey, response, 60);
        }
        catch { }
        return response;
    }
    catch (error) {
        console.error("[getEcommerceDashboardData Error]", error);
        return fallbackResponse;
    }
}
exports.getEcommerceDashboardData = getEcommerceDashboardData;
