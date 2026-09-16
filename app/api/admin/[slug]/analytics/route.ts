/**
 * app/api/admin/[slug]/analytics/route.ts
 *
 * Tenant-scoped product interaction analytics & performance dashboard API.
 * Enforces strict tenant isolation. Aggregates data from StoreDailyMetric,
 * ListingDailyMetric, and marketplaceListings.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";
import { findCompanyCached } from "@/lib/company-fetcher";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    const { slug } = await params;
    const company = await findCompanyCached(slug, "api");
    if (!company) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const authRes = await resolveAuthorizedCompany(user, company.id);
    if (!authRes.authorized) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const { searchParams } = new URL(request.url);
    const daysParam = parseInt(searchParams.get("days") || "30", 10);
    const channelParam = searchParams.get("channel"); // optional InteractionChannel

    const days = Math.min(90, Math.max(1, isNaN(daysParam) ? 30 : daysParam));

    // Calculate start date string YYYY-MM-DD
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Build store query condition
    const storeMetricWhere: any = {
      companyId: company.id,
      date: { gte: startDateStr },
    };

    if (channelParam && channelParam !== "ALL") {
      storeMetricWhere.channel = channelParam;
    }

    // 1. Fetch Store Daily Metrics
    const storeMetrics = await prisma.storeDailyMetric.findMany({
      where: storeMetricWhere,
      orderBy: { date: "asc" },
    });

    // Compute totals
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

    // Daily breakdown dictionary
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

    // Channel attribution dictionary
    const channelMap: Record<string, { impressions: number; views: number; clicks: number; orders: number; revenue: number }> = {};

    for (const m of storeMetrics) {
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

      // Group daily
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

      // Group channel
      const ch = m.channel || "STORE";
      if (!channelMap[ch]) {
        channelMap[ch] = { impressions: 0, views: 0, clicks: 0, orders: 0, revenue: 0 };
      }
      channelMap[ch].impressions += m.impressions;
      channelMap[ch].views += m.views;
      channelMap[ch].clicks += m.cardClicks;
      channelMap[ch].orders += m.paidOrders;
      channelMap[ch].revenue += m.revenue;
    }

    // Sort timeline
    const timeline = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // 2. Fetch Listing Daily Metrics for Top Products
    const listingMetricWhere: any = {
      companyId: company.id,
      date: { gte: startDateStr },
    };

    const listingMetrics = await prisma.listingDailyMetric.findMany({
      where: listingMetricWhere,
    });

    // Group by listingId
    const listingAgg: Record<
      string,
      {
        listingId: string;
        impressions: number;
        views: number;
        clicks: number;
        wishlists: number;
        cartAdds: number;
        orders: number;
        revenue: number;
      }
    > = {};

    for (const lm of listingMetrics) {
      if (!listingAgg[lm.marketplaceListingId]) {
        listingAgg[lm.marketplaceListingId] = {
          listingId: lm.marketplaceListingId,
          impressions: 0,
          views: 0,
          clicks: 0,
          wishlists: 0,
          cartAdds: 0,
          orders: 0,
          revenue: 0,
        };
      }
      listingAgg[lm.marketplaceListingId].impressions += lm.impressions;
      listingAgg[lm.marketplaceListingId].views += lm.views;
      listingAgg[lm.marketplaceListingId].clicks += lm.cardClicks;
      listingAgg[lm.marketplaceListingId].wishlists += lm.wishlistAdds;
      listingAgg[lm.marketplaceListingId].cartAdds += lm.addToCarts;
      listingAgg[lm.marketplaceListingId].orders += lm.paidOrders;
      listingAgg[lm.marketplaceListingId].revenue += lm.revenue;
    }

    // Top 10 listings by views or revenue
    const topListingIds = Object.values(listingAgg)
      .sort((a, b) => b.views - a.views || b.revenue - a.revenue)
      .slice(0, 10)
      .map((item) => item.listingId);

    // Fetch listing details for top listings
    const topListingRecords = topListingIds.length > 0
      ? await prisma.marketplaceListings.findMany({
          where: { id: { in: topListingIds } },
          select: {
            id: true,
            title: true,
            slug: true,
            prices: true,
            images: true,
            listingType: true,
            product: {
              select: {
                id: true,
                title: true,
                sellingPrice: true,
                images: true,
              },
            },
          },
        })
      : [];

    const listingMap = new Map(topListingRecords.map((r) => [r.id, r]));

    const topProducts = topListingIds.map((lid) => {
      const stats = listingAgg[lid];
      const record = listingMap.get(lid);
      const title = record?.title || record?.product?.title || "Untitled Listing";
      const image =
        record?.images?.[0] || record?.product?.images?.[0] || "/images/placeholder.png";
      const price =
        record?.prices?.[0] || record?.product?.sellingPrice || 0;

      const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
      const convRate = stats.views > 0 ? (stats.orders / stats.views) * 100 : 0;

      return {
        listingId: lid,
        title,
        image,
        price,
        impressions: stats.impressions,
        views: stats.views,
        clicks: stats.clicks,
        wishlists: stats.wishlists,
        cartAdds: stats.cartAdds,
        orders: stats.orders,
        revenue: stats.revenue,
        ctr: Number(ctr.toFixed(2)),
        conversionRate: Number(convRate.toFixed(2)),
      };
    });

    // Conversion Funnel Calculations
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const viewRate = totalClicks > 0 ? (totalViews / totalClicks) * 100 : 0;
    const cartRate = totalViews > 0 ? (totalCartAdds / totalViews) * 100 : 0;
    const orderConversionRate = totalViews > 0 ? (totalPaidOrders / totalViews) * 100 : 0;

    const funnel = [
      { stage: "Impressions", count: totalImpressions, rate: 100 },
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
        topProducts,
      },
    });
  } catch (error: any) {
    console.error("[Store Analytics API Error]:", error);
    return NextResponse.json(
      { error: "Internal server error fetching store analytics" },
      { status: 500 }
    );
  }
}
