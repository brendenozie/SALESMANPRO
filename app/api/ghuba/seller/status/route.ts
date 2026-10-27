import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import prisma from "@/server/db/prismadb";
import { enforceMarketplaceItemLimit } from "@/lib/subscriptions/enforce-limits";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success || !auth.user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const userId = auth.user.id;

    // Find company owned by this user or linked via companyId
    let company = await prisma.company.findFirst({
      where: {
        OR: [
          { userId },
          ...(auth.user.companyId ? [{ id: auth.user.companyId }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        category: true,
        variant: true,
        logoUrl: true,
        bannerUrl: true,
        contactEmail: true,
        contactPhone: true,
        description: true,
        address: true,
        storeOrigin: true,
        showOnGhuba: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!company) {
      return NextResponse.json({
        authenticated: true,
        hasStore: false,
        user: {
          id: auth.user.id,
          name: auth.user.name,
          email: auth.user.email,
        },
      });
    }

    // Count active marketplace listings
    const activeListingCount = await prisma.marketplaceListings.count({
      where: {
        companyId: company.id,
        status: "ACTIVE",
      },
    });

    // Run authoritative limits check
    const enforcement = await enforceMarketplaceItemLimit(company.id, 0);

    const isGhubaOrigin = company.storeOrigin === "GHUBA" || company.showOnGhuba === true;
    const limit = enforcement.limit ?? 10;
    const isGrandfathered = activeListingCount > limit;
    const remainingSlots = Math.max(0, limit - activeListingCount);

    let thresholdState: "normal" | "warning_8" | "warning_9" | "limit_reached" = "normal";
    if (activeListingCount >= limit) {
      thresholdState = "limit_reached";
    } else if (activeListingCount === 9) {
      thresholdState = "warning_9";
    } else if (activeListingCount === 8) {
      thresholdState = "warning_8";
    }

    return NextResponse.json({
      authenticated: true,
      hasStore: true,
      store: company,
      user: {
        id: auth.user.id,
        name: auth.user.name,
        email: auth.user.email,
      },
      activeListingCount,
      limit,
      remainingSlots,
      isGrandfathered,
      thresholdState,
      isGhubaOrigin,
      enforcement,
    });
  } catch (error) {
    console.error("Error in GET /api/ghuba/seller/status:", error);
    return NextResponse.json(
      { error: "Internal Server Error fetching seller status" },
      { status: 500 }
    );
  }
}
