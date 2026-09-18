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
    const days = Math.min(365, Math.max(1, isNaN(daysParam) ? 30 : daysParam));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Fetch All ContentAccess purchases
    const purchases = await prisma.contentAccess.findMany({
      where: {
        companyId: company.id,
        createdAt: { gte: startDate },
        paymentStatus: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    let totalRevenue = 0;
    let blogRevenue = 0;
    let podcastRevenue = 0;
    let blogUnlocks = 0;
    let podcastUnlocks = 0;
    const payingConsumers = new Set<string>();

    const contentAggMap: Record<
      string,
      {
        contentId: string;
        contentType: string;
        title: string;
        unlocks: number;
        revenue: number;
        price: number;
      }
    > = {};

    for (const p of purchases) {
      totalRevenue += p.amount;
      if (p.consumerId || p.userId || p.customerId) {
        payingConsumers.add(p.consumerId || p.userId || p.customerId || "");
      }

      if (p.contentType === "BLOG") {
        blogRevenue += p.amount;
        blogUnlocks += 1;
      } else if (p.contentType === "PODCAST") {
        podcastRevenue += p.amount;
        podcastUnlocks += 1;
      }

      const key = `${p.contentType}_${p.contentId}`;
      if (!contentAggMap[key]) {
        contentAggMap[key] = {
          contentId: p.contentId,
          contentType: p.contentType,
          title: "Content Item",
          unlocks: 0,
          revenue: 0,
          price: p.amount,
        };
      }
      contentAggMap[key].unlocks += 1;
      contentAggMap[key].revenue += p.amount;
    }

    // 2. Resolve content titles
    const blogIds = Object.values(contentAggMap)
      .filter((c) => c.contentType === "BLOG")
      .map((c) => c.contentId);
    const podcastIds = Object.values(contentAggMap)
      .filter((c) => c.contentType === "PODCAST")
      .map((c) => c.contentId);

    const [blogs, podcasts] = await Promise.all([
      blogIds.length > 0
        ? prisma.blog.findMany({
            where: { id: { in: blogIds } },
            select: { id: true, title: true, price: true },
          })
        : [],
      podcastIds.length > 0
        ? prisma.podcast.findMany({
            where: { id: { in: podcastIds } },
            select: { id: true, title: true, price: true },
          })
        : [],
    ]);

    const titleMap = new Map<string, { title: string; price: number }>();
    blogs.forEach((b) => titleMap.set(b.id, { title: b.title, price: b.price || 0 }));
    podcasts.forEach((p) => titleMap.set(p.id, { title: p.title, price: p.price || 0 }));

    for (const c of Object.values(contentAggMap)) {
      const match = titleMap.get(c.contentId);
      if (match) {
        c.title = match.title;
        c.price = match.price;
      }
    }

    const topContent = Object.values(contentAggMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const totalConsumersCount = payingConsumers.size;
    const arpu = totalConsumersCount > 0 ? totalRevenue / totalConsumersCount : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          blogRevenue,
          podcastRevenue,
          totalUnlocks: purchases.length,
          blogUnlocks,
          podcastUnlocks,
          payingConsumersCount: totalConsumersCount,
          arpu: Number(arpu.toFixed(2)),
          currency: company.currency || "KES",
        },
        topContent,
        recentPurchases: purchases.map((p) => ({
          id: p.id,
          contentType: p.contentType,
          contentId: p.contentId,
          title: titleMap.get(p.contentId)?.title || `${p.contentType} Access`,
          amount: p.amount,
          currency: p.currency,
          paymentMethod: p.paymentMethod,
          paymentStatus: p.paymentStatus,
          createdAt: p.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("[ContentFinanceAPI] Error fetching content finance:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
