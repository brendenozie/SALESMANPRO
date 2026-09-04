/**
 * app/api/ads/campaigns/route.ts
 *
 * Unified Advertising Campaigns Endpoint.
 * Multi-tenant safe: Store tenants are strictly bound to their companyId.
 * Super Admins can manage platform and marketplace-level campaigns.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { AdCampaignStatus, AdvertiserType, AdBiddingStrategy, AdObjective } from "@/lib/ads/types";
import { AdBudgetService } from "@/lib/ads/adBudgetService";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const level = searchParams.get("level");
    const queryCompanyId = searchParams.get("companyId");

    // Tenant Isolation Enforcement
    let effectiveCompanyId = auth.companyId;
    if (auth.role === "SUPER_ADMIN") {
      effectiveCompanyId = queryCompanyId || undefined;
    }

    const where: any = {};
    if (effectiveCompanyId) {
      where.companyId = effectiveCompanyId;
    } else if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Store tenant context required." }, { status: 403 });
    }

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (level) {
      where.level = level;
    }

    const campaigns = await prisma.adCampaign.findMany({
      where,
      include: {
        creatives: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      campaigns,
      count: campaigns.length,
    });
  } catch (error: any) {
    console.error("[ADS_CAMPAIGNS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch ad campaigns" },
      { status: error.statusCode || 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();
    const {
      name,
      advertiserType = AdvertiserType.STORE_ADVERTISER,
      level = "STORE",
      objective = AdObjective.PRODUCT_SALES,
      totalBudgetKES,
      dailyBudgetKES,
      biddingStrategy = AdBiddingStrategy.CPM,
      bidAmountKES = 50,
      startDate,
      endDate,
      targetAudience,
      targetingRules,
      listingId,
      productId,
      creatives = [],
    } = body;

    if (!name || !totalBudgetKES || totalBudgetKES <= 0) {
      return NextResponse.json(
        { success: false, error: "Campaign name and valid total budget in KES are required." },
        { status: 400 },
      );
    }

    // Tenant verification
    let targetCompanyId = auth.companyId;
    if (auth.role === "SUPER_ADMIN" && body.companyId) {
      targetCompanyId = body.companyId;
    }

    // Check available ad wallet budget
    const budgetCheck = await AdBudgetService.canFundCampaign(targetCompanyId, totalBudgetKES);
    if (!budgetCheck.canFund && auth.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient Ad Wallet balance. Available: KES ${budgetCheck.availableBalanceKES.toLocaleString()}, Required: KES ${totalBudgetKES.toLocaleString()}. Please top up your wallet.`,
          availableBalanceKES: budgetCheck.availableBalanceKES,
          missingAmountKES: budgetCheck.missingAmountKES,
        },
        { status: 402 },
      );
    }

    const calculatedDaily = dailyBudgetKES || Math.round(totalBudgetKES / 7);

    const campaign = await prisma.adCampaign.create({
      data: {
        companyId: targetCompanyId || null,
        advertiserType,
        level: level as any,
        name,
        status: AdCampaignStatus.ACTIVE, // Launched with funded budget
        objective,
        currency: "KES",
        totalBudgetKES,
        dailyBudgetKES: calculatedDaily,
        spentAmountKES: 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        biddingStrategy,
        bidAmountKES,
        targetAudience: targetAudience || null,
        targetingRules: targetingRules || {},
        automationMode: "MANUAL",
        approvalStatus: "APPROVED",
        reviewedBy: auth.userId,
        listingId: listingId || null,
        productId: productId || null,
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spendKES: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
          attributedRevenueKES: 0,
          roas: 0,
        },
        creatives: {
          create: creatives.map((c: any, index: number) => ({
            type: c.type || "IMAGE",
            title: c.title || `${name} - Creative ${index + 1}`,
            headline: c.headline || name,
            body: c.body || null,
            ctaText: c.ctaText || "Shop Now",
            ctaUrl: c.ctaUrl || "/",
            mediaUrl: c.mediaUrl || null,
            aspectRatio: c.aspectRatio || "1:1",
            variantTag: c.variantTag || String.fromCharCode(65 + index),
            status: "ACTIVE",
          })),
        },
      },
      include: {
        creatives: true,
      },
    });

    return NextResponse.json({
      success: true,
      campaign,
      message: `Ad campaign '${campaign.name}' created and activated with budget KES ${totalBudgetKES.toLocaleString()}.`,
    });
  } catch (error: any) {
    console.error("[ADS_CAMPAIGNS_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create ad campaign" },
      { status: error.statusCode || 500 },
    );
  }
}
