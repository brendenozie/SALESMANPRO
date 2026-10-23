import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// GET /api/analytics/revenue?companyId=&period=7|30|90|365
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  const period = parseInt(req.nextUrl.searchParams.get("period") ?? "30");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const since = new Date(Date.now() - period * 86_400_000);

  try {
    // Parallel data fetch
    const [orders, topProducts, hourlyOrders, prevOrders] = await Promise.all([
      // All orders in period
      prisma.customerOrder.findMany({
        where: {
          companyId,
          createdAt: { gte: since },
          paymentStatus: "PAID",
        },
        select: {
          totalFinalPrice: true,
          totalDiscount: true,
          paymentMethod: true,
          createdAt: true,
          channel: true,
          orderSource: true,
          items: { select: { quantity: true, price: true, productId: true, title: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      // Top SKUs by revenue
      prisma.orderItem.groupBy({
        by: ["productId", "title"],
        where: {
          order: { companyId, createdAt: { gte: since }, paymentStatus: "PAID" },
        },
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { price: "desc" } },
        take: 10,
      }),
      // Hourly traffic breakdown
      prisma.customerOrder.findMany({
        where: { companyId, createdAt: { gte: since }, paymentStatus: "PAID" },
        select: { createdAt: true, totalFinalPrice: true },
      }),
      // Previous period for comparison
      prisma.customerOrder.aggregate({
        where: {
          companyId,
          createdAt: { gte: new Date(Date.now() - period * 2 * 86_400_000), lt: since },
          paymentStatus: "PAID",
        },
        _sum: { totalFinalPrice: true },
        _count: true,
      }),
    ]);

    // Build daily revenue series
    const dailyMap: Record<string, { revenue: number; orders: number; discount: number }> = {};
    for (const o of orders) {
      const day = o.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { revenue: 0, orders: 0, discount: 0 };
      dailyMap[day].revenue += o.totalFinalPrice ?? 0;
      dailyMap[day].orders += 1;
      dailyMap[day].discount += o.totalDiscount ?? 0;
    }

    // Fill missing days
    const dailySeries: { date: string; revenue: number; orders: number; discount: number }[] = [];
    for (let i = 0; i < period; i++) {
      const d = new Date(since.getTime() + i * 86_400_000).toISOString().slice(0, 10);
      dailySeries.push({ date: d, ...(dailyMap[d] ?? { revenue: 0, orders: 0, discount: 0 }) });
    }

    // Hourly traffic (0–23)
    const hourlyMap: Record<number, number> = {};
    for (const o of hourlyOrders) {
      const h = o.createdAt.getHours();
      hourlyMap[h] = (hourlyMap[h] ?? 0) + 1;
    }
    const hourlySeries = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: hourlyMap[h] ?? 0 }));

    // Payment method breakdown
    const paymentMap: Record<string, number> = {};
    for (const o of orders) {
      const pm = o.paymentMethod ?? "UNKNOWN";
      paymentMap[pm] = (paymentMap[pm] ?? 0) + (o.totalFinalPrice ?? 0);
    }

    // Totals
    const totalRevenue = orders.reduce((s, o) => s + (o.totalFinalPrice ?? 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalDiscount = orders.reduce((s, o) => s + (o.totalDiscount ?? 0), 0);

    const prevRevenue = prevOrders._sum.totalFinalPrice ?? 0;
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : null;

    return NextResponse.json({
      summary: { totalRevenue, totalOrders, avgOrderValue, totalDiscount, revenueGrowth },
      dailySeries,
      hourlySeries,
      topProducts,
      paymentBreakdown: Object.entries(paymentMap).map(([method, revenue]) => ({ method, revenue })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
