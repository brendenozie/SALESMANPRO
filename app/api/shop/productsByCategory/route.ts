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
    const agentId = searchParams.get("agentId");
    const categoryId = searchParams.get("categoryId");
    const pageParam = Math.max(
      1,
      parseInt(searchParams.get("page") || "1", 10),
    );
    const limitParam = Math.max(
      1,
      parseInt(searchParams.get("limit") || "6", 10),
    );

    const skip = (pageParam - 1) * limitParam;
    const cacheKey = `mkt:list:a:${agentId ?? "all"}:c:${categoryId ?? "all"}:p:${pageParam}:l:${limitParam}`;

    // 1. Internal Cache Check
    try {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return new NextResponse(JSON.stringify(cached), {
          status: 200,
          headers: JSON_HEADER,
        });
      }
    } catch (e) {}

    const whereFilter: any = {};
    if (agentId) whereFilter.companyId = agentId;
    if (categoryId) whereFilter.productCategoryId = categoryId;

    // 2. Parallel Database Operations with specific field selection
    const [total, listings] = await prisma.$transaction([
      prisma.marketplaceListings.count({ where: whereFilter }),
      prisma.marketplaceListings.findMany({
        where: whereFilter,
        skip,
        take: limitParam,
        orderBy: { createdAt: "desc" },
        // OPTIMIZATION: Only select what the UI needs to reduce data transfer
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
        },
      }),
    ]);

    const response = {
      data: listings,
      meta: {
        total,
        perPage: limitParam,
        currentPage: pageParam,
        totalPages: Math.ceil(total / limitParam),
      },
    };

    // 3. Background Cache & CDN headers
    cacheSet(cacheKey, response, 300).catch(() => {}); // Cache internally for 5 mins

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        ...JSON_HEADER,
        // CDN Cache: Fresh for 30s, background refresh for 10 mins
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: "Internal Error" }), {
      status: 500,
      headers: JSON_HEADER,
    });
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
