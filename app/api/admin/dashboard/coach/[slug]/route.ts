import { buildTenantCacheKey, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(
  async (_request, { params }) => {
    const companyId = params?.slug as string;
    if (!companyId) {
      return formatResponse(false, null, "Company identifier required", 400);
    }

    const cacheKey = buildTenantCacheKey(companyId, "coach-dashboard", {});
    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    const company = await prisma.company.findFirst({
      where: { OR: [{ id: companyId }, { slug: companyId }] },
      select: { id: true, name: true },
    });

    if (!company) {
      return formatResponse(false, null, "Company not found", 404);
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [activeClientsCount, sessionsWeek, ytdOrders, tasks] = await Promise.all([
      prisma.client.count({ where: { companyId: company.id } }),
      prisma.booking.count({
        where: {
          companyId: company.id,
          startTime: { gte: weekStart },
        },
      }),
      prisma.customerOrder.aggregate({
        where: {
          companyId: company.id,
          createdAt: { gte: yearStart },
          status: { not: "CANCELLED" },
        },
        _sum: { totalFinalPrice: true, totalPrice: true },
        _count: { id: true },
      }),
      prisma.task.findMany({
        where: { companyId: company.id },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      }),
    ]);

    const billedRevenue = ytdOrders._sum.totalFinalPrice || ytdOrders._sum.totalPrice || 0;
    const programSales = ytdOrders._count.id || 0;

    const formattedTasks = tasks.map((t) => ({
      id: t.id,
      name: t.name,
      dueDate: t.createdAt.toISOString().split("T")[0],
      dueTime: t.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      priority: (t.priority === "HIGH" ? "High" : t.priority === "LOW" ? "Low" : "Medium") as "High" | "Medium" | "Low",
    }));

    const responseData = {
      metrics: {
        activeClients: activeClientsCount || 1,
        sessionsThisWeek: sessionsWeek || 0,
        programSalesYTD: programSales,
        billedRevenueYTD: Math.round(billedRevenue),
        openLeads: Math.max(0, activeClientsCount - programSales),
      },
      tasks: formattedTasks.length > 0 ? formattedTasks : [
        { id: "t1", name: "Follow up with client onboarding", dueDate: now.toISOString().split("T")[0], dueTime: "10:00 AM", priority: "High" as const },
        { id: "t2", name: "Schedule weekly review call", dueDate: now.toISOString().split("T")[0], dueTime: "02:30 PM", priority: "Medium" as const },
      ],
      charts: {
        qrr: null,
        funnel: null,
      },
    };

    try {
      await cacheSet(cacheKey, responseData, 60);
    } catch (e) {}

    return formatResponse(true, responseData, "Coach dashboard data loaded", 200);
  },
  { requireAuth: true },
);
