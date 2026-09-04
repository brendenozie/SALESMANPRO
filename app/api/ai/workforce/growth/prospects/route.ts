/**
 * app/api/ai/workforce/growth/prospects/route.ts
 *
 * Super Admin SaaS Growth Acquisition Pipeline.
 * Manages businesses discovered, digital maturity scores, and outreach tracking.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { ProspectStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Super Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status") as ProspectStatus | null;
    const minScore = searchParams.get("minScore");
    const limit = Math.min(Number(searchParams.get("limit") || 25), 100);
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.category = { contains: category, mode: "insensitive" };
    if (status) where.status = status;
    if (minScore) where.overallLeadScore = { gte: Number(minScore) };

    const [prospects, total] = await Promise.all([
      prisma.growthProspect.findMany({
        where,
        orderBy: [{ overallLeadScore: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip,
      }),
      prisma.growthProspect.count({ where }),
    ]);

    // Aggregate summary counts by status
    const statusAggregates = await prisma.growthProspect.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const statusCounts: Record<string, number> = {};
    statusAggregates.forEach((item) => {
      statusCounts[item.status] = item._count.id;
    });

    return NextResponse.json({
      success: true,
      prospects,
      statusCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("[WORKFORCE_PROSPECTS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query prospects" },
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
      businessName,
      category,
      location,
      country = "Kenya",
      phone,
      email,
      website,
      socialChannels,
      sourceUrl,
      evidence,
      digitalMaturityScore = 30,
      ecommerceOpportunityScore = 50,
      notes,
    } = body;

    if (!businessName || !category || !location) {
      return NextResponse.json(
        { success: false, error: "Business name, category, and location are required." },
        { status: 400 },
      );
    }

    // Calculate composite lead score (0-100)
    const overallLeadScore = Math.round(
      (100 - digitalMaturityScore) * 0.4 + ecommerceOpportunityScore * 0.6,
    );

    const prospect = await prisma.growthProspect.create({
      data: {
        businessName,
        category,
        location,
        country,
        phone,
        email,
        website,
        socialChannels,
        sourceUrl,
        evidence,
        digitalMaturityScore,
        ecommerceOpportunityScore,
        overallLeadScore,
        notes,
        createdById: auth.userId,
      },
    });

    return NextResponse.json({ success: true, prospect });
  } catch (error: any) {
    console.error("[WORKFORCE_PROSPECTS_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create prospect" },
      { status: error.statusCode || 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Super Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, notes, recommendedPlan, optedOut } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Prospect id is required." }, { status: 400 });
    }

    const updated = await prisma.growthProspect.update({
      where: { id },
      data: {
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
        recommendedPlan: recommendedPlan !== undefined ? recommendedPlan : undefined,
        optedOut: optedOut !== undefined ? Boolean(optedOut) : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, prospect: updated });
  } catch (error: any) {
    console.error("[WORKFORCE_PROSPECTS_PATCH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update prospect" },
      { status: error.statusCode || 500 },
    );
  }
}
