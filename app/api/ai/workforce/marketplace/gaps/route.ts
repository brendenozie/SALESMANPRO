/**
 * app/api/ai/workforce/marketplace/gaps/route.ts
 *
 * Super Admin & Ghuba Marketplace Supply/Demand Gap Intelligence.
 * Monitors unmet buyer search volume, low-liquidity categories, and seller recruitment targets.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Super Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const urgency = searchParams.get("urgency");
    const status = searchParams.get("status");

    const where: any = {};
    if (category) where.category = { contains: category, mode: "insensitive" };
    if (urgency) where.urgencyLevel = urgency;
    if (status) where.status = status;

    const [gaps, totalGaps, activeListings] = await Promise.all([
      prisma.marketplaceSupplyGap.findMany({
        where,
        orderBy: [{ unmetSearchVolume: "desc" }, { updatedAt: "desc" }],
        take: 50,
      }),
      prisma.marketplaceSupplyGap.count({ where }),
      prisma.marketplaceListings.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    ]);

    return NextResponse.json({
      success: true,
      gaps,
      totalGaps,
      activeMarketplaceListings: activeListings,
    });
  } catch (error: any) {
    console.error("[WORKFORCE_MARKETPLACE_GAPS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query marketplace gaps" },
      { status: error.statusCode || 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Super Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      category,
      location,
      unmetSearchVolume = 10,
      activeListingCount = 0,
      averagePriceKES,
      urgencyLevel = "MEDIUM",
      recommendedSellersCount = 5,
    } = body;

    if (!category || !location) {
      return NextResponse.json({ success: false, error: "Category and location are required." }, { status: 400 });
    }

    const gap = await prisma.marketplaceSupplyGap.create({
      data: {
        category,
        location,
        unmetSearchVolume,
        activeListingCount,
        averagePriceKES: averagePriceKES ? Number(averagePriceKES) : undefined,
        urgencyLevel,
        recommendedSellersCount,
      },
    });

    return NextResponse.json({ success: true, gap });
  } catch (error: any) {
    console.error("[WORKFORCE_MARKETPLACE_GAPS_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record marketplace gap" },
      { status: error.statusCode || 500 },
    );
  }
}
