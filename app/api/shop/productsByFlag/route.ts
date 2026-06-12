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
    const flag = searchParams.get("flag");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "25", 10));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order =
      searchParams.get("order")?.toLowerCase() === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    // Optimized Cache Key including sorting
    const cacheKey = `mkt:list:a:${agentId ?? "all"}:f:${flag ?? "none"}:p:${page}:l:${limit}:s:${sortBy}:${order}`;

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
    if (flag) whereFilter[flag] = true;
    if (agentId) whereFilter.companyId = agentId;

    // 1. Specific Select to avoid over-fetching large fields
    // 2. Transaction for single round-trip execution
    const [total, listings] = await prisma.$transaction([
      prisma.marketplaceListings.count({ where: whereFilter }),
      prisma.marketplaceListings.findMany({
        where: whereFilter,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
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

    const totalPages = Math.ceil(total / limit);
    const responseData = {
      data: listings,
      meta: {
        total,
        perPage: limit,
        currentPage: page,
        totalPages,
        sortBy,
        order,
      },
    };

    // Increase TTL to 5 minutes - listings don't need real-time precision
    cacheSet(cacheKey, responseData, 300).catch(() => {});

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...JSON_HEADER,
        // Browser/CDN cache: Fresh for 30s, background update for 10m
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
