/**
 * app/api/admin/ghuba/analytics/route.ts
 *
 * Platform-wide Ghuba Marketplace Analytics API.
 * Accessible to platform administrators to monitor network-wide product interactions,
 * conversion funnels, channels, and trending listings.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      user.role === "ADMIN" ||
      user.role === "SUPER_ADMIN" ||
      user.role === "admin" ||
      user.email === process.env.ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Ghuba Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const daysParam = parseInt(searchParams.get("days") || "30", 10);
    const channelParam = searchParams.get("channel");

    const days = Math.min(90, Math.max(1, isNaN(daysParam) ? 30 : daysParam));

    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    const metricWhere: any = {
      date: { gte: startDateStr },
    };

    if (channelParam && channelParam !== "ALL") {
      metricWhere.channel = channelParam;
    }

    // 1. Fetch Ghuba Daily Metrics
    const ghubaMetrics = await prisma.ghubaDailyMetric.findMany({
      where: metricWhere,
      orderBy: { date: "asc" },
    });

    let totalImpressions = 0;
    let totalViews = 0;
    let totalClicks = 0;
    let totalLikes = 0;
    let totalWishlists = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalCartAdds = 0;
    let totalCheckoutStarts = 0;
    let totalOrders = 0;
    let totalPaidOrders = 0;
    let totalRevenue = 0;

    const dailyMap: Record<
      string,
      {
        date: string;
        impressions: number;
        views: number;
        clicks: number;
        cartAdds: number;
        orders: number;
        revenue: number;
      }
    > = {};

    const channelMap: Record<
      string,
      { impressions: number; views: number; clicks: number; orders: number; revenue: number }
    > = {};

    for (const m of ghubaMetrics) {
      totalImpressions += m.impressions;
      totalViews += m.views;
      totalClicks += m.cardClicks;
      totalLikes += m.likes;
      totalWishlists += m.wishlistAdds;
      totalComments += m.comments;
      totalShares += m.shares;
      totalCartAdds += m.addToCarts;
      totalCheckoutStarts += m.checkoutStarts;
      totalOrders += m.orders;
      totalPaidOrders += m.paidOrders;
      totalRevenue += m.revenue;

      if (!dailyMap[m.date]) {
        dailyMap[m.date] = {
          date: m.date,
          impressions: 0,
          views: 0,
          clicks: 0,
          cartAdds: 0,
          orders: 0,
          revenue: 0,
        };
      }
      dailyMap[m.date].impressions += m.impressions;
      dailyMap[m.date].views += m.views;
      dailyMap[m.date].clicks += m.cardClicks;
      dailyMap[m.date].cartAdds += m.addToCarts;
      dailyMap[m.date].orders += m.paidOrders;
      dailyMap[m.date].revenue += m.revenue;

      const ch = m.channel || "GHUBA";
      if (!channelMap[ch]) {
        channelMap[ch] = { impressions: 0, views: 0, clicks: 0, orders: 0, revenue: 0 };
      }
      channelMap[ch].impressions += m.impressions;
      channelMap[ch].views += m.views;
      channelMap[ch].clicks += m.cardClicks;
      channelMap[ch].orders += m.paidOrders;
      channelMap[ch].revenue += m.revenue;
    }

    const timeline = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // 2. Fetch Top Performing Marketplace Listings across Ghuba
    const topListingDaily = await prisma.listingDailyMetric.groupBy({
      by: ["marketplaceListingId"],
      where: {
        date: { gte: startDateStr },
        channel: "GHUBA",
      },
      _sum: {
        impressions: true,
        views: true,
        cardClicks: true,
        wishlistAdds: true,
        addToCarts: true,
        paidOrders: true,
        revenue: true,
      },
      orderBy: {
        _sum: {
          views: "desc",
        },
      },
      take: 10,
    });

    const listingIds = topListingDaily.map((item) => item.marketplaceListingId);
    const listings = listingIds.length > 0
      ? await prisma.marketplaceListings.findMany({
          where: { id: { in: listingIds } },
          select: {
            id: true,
            title: true,
            slug: true,
            prices: true,
            images: true,
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        })
      : [];

    const listingMap = new Map(listings.map((l) => [l.id, l]));

    const topListings = topListingDaily.map((item) => {
      const rec = listingMap.get(item.marketplaceListingId);
      const views = item._sum.views || 0;
      const clicks = item._sum.cardClicks || 0;
      const impressions = item._sum.impressions || 0;
      const orders = item._sum.paidOrders || 0;
      const revenue = item._sum.revenue || 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const conversionRate = views > 0 ? (orders / views) * 100 : 0;

      return {
        listingId: item.marketplaceListingId,
        title: rec?.title || "Marketplace Item",
        storeName: rec?.company?.name || "Merchant",
        price: rec?.prices?.[0] || 0,
        image: rec?.images?.[0] || "/images/placeholder.png",
        impressions,
        clicks,
        views,
        orders,
        revenue,
        ctr: Number(ctr.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(2)),
      };
    });

    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const orderConversionRate = totalViews > 0 ? (totalPaidOrders / totalViews) * 100 : 0;

    const funnel = [
      { stage: "Marketplace Impressions", count: totalImpressions, rate: 100 },
      {
        stage: "Product Clicks",
        count: totalClicks,
        rate: totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(1)) : 0,
      },
      {
        stage: "Detail Views",
        count: totalViews,
        rate: totalClicks > 0 ? Number(((totalViews / totalClicks) * 100).toFixed(1)) : 0,
      },
      {
        stage: "Added to Cart",
        count: totalCartAdds,
        rate: totalViews > 0 ? Number(((totalCartAdds / totalViews) * 100).toFixed(1)) : 0,
      },
      {
        stage: "Paid Orders",
        count: totalPaidOrders,
        rate: totalViews > 0 ? Number(((totalPaidOrders / totalViews) * 100).toFixed(1)) : 0,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalImpressions,
          totalViews,
          totalClicks,
          totalLikes,
          totalWishlists,
          totalComments,
          totalShares,
          totalCartAdds,
          totalCheckoutStarts,
          totalOrders,
          totalPaidOrders,
          totalRevenue,
          ctr: Number(ctr.toFixed(2)),
          orderConversionRate: Number(orderConversionRate.toFixed(2)),
        },
        funnel,
        timeline,
        channels: channelMap,
        topListings,
      },
    });
  } catch (error: any) {
    console.error("[Ghuba Admin Analytics API Error]:", error);
    return NextResponse.json(
      { error: "Internal server error fetching marketplace analytics" },
      { status: 500 }
    );
  }
}
