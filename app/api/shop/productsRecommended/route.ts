import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { cacheGet, cacheSet } from "@/lib/cache";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, cache-control",
};

const JSON_HEADER = { "Content-Type": "application/json", ...CORS_HEADERS };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const agentId = searchParams.get("agentId");
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "5", 10));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

    if (!userId) return new NextResponse(JSON.stringify({ error: "Missing userId" }), { status: 400, headers: JSON_HEADER });

    const cacheKey = `rec:u:${userId}:a:${agentId ?? 'all'}:l:${limit}:o:${offset}`;

    // 1. Instant Cache Return
    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return new NextResponse(JSON.stringify(cached), { status: 200, headers: JSON_HEADER });
    } catch (e) {}

    // 2. Optimized History Fetch
    // We only need specific fields to build the next query. Don't fetch the whole listing object.
    const recentActivity = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10, // Hard limit history scan for speed
      select: {
        marketplaceListingId: true,
        marketplaceListings: {
          select: {
            id: true,
            sellingPrice: true,
            finalPrice: true,
            createdAt: true,
            // If you need flags:
            isFeatured: true,
            name: true,
            images: true,
            isNewArrival: true,
            isAvailable: true,
            isOnOffer: true,
            isFlashDeal: true,
            isDiscounted: true,
            category: true,
            subCategoryName: true,
            brand: true,
            productCategoryId: true,
            option: true,
            // Nested selection instead of full 'include'
            product: {
              select: {
                id: true,
                // name: true,
                // image: true,
                // slug: true,
              },
            },
            tags: true,
          },
        },
      },
    });

    // 3. Extract IDs, Categories, and Tags efficiently
    const interactedIds = new Set<string>();
    const categories = new Set<string>();
    const tags = new Set<string>();

    recentActivity.forEach(activity => {
      if (activity.marketplaceListingId) interactedIds.add(activity.marketplaceListingId);
      if (activity.marketplaceListings?.productCategoryId) categories.add(activity.marketplaceListings.productCategoryId);
      activity.marketplaceListings?.tags?.forEach(tag => tags.add(tag));
    });

    // 4. Recommendation Query
    // Optimization: If no history, just return featured/latest to avoid empty state or heavy OR logic
    const recommendations = await prisma.marketplaceListings.findMany({
      where: {
        ...(agentId && { companyId: agentId }),
        id: { notIn: Array.from(interactedIds) },
        OR: [
          { productCategoryId: { in: Array.from(categories) } },
          { tags: { hasSome: Array.from(tags) } }
        ],
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        sellingPrice: true,
        finalPrice: true,
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            slug: true,
          }
        }
      }
    });

    const responseData = {
      data: recommendations,
      meta: { count: recommendations.length }
    };

    // 5. Background Cache & CDN Headers
    // Recommendations can be slightly "stale" (5-10 mins) without hurting UX
    cacheSet(cacheKey, responseData, 600).catch(() => {});

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...JSON_HEADER,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=1200",
      },
    });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: "Internal Error" }), { status: 500, headers: JSON_HEADER });
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}