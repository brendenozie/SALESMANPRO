import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { unstable_cache } from "next/cache";
import { cacheGet, cacheSet } from "@/lib/cache";

/* ---------------------------------------------
   CORS
---------------------------------------------- */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(
  json: any,
  status = 200,
  extraHeaders: Record<string, string> = {}
) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/* ---------------------------------------------
   Flags Mapping
---------------------------------------------- */
const flagMap: Record<string, any> = {
  isFeatured: { isFeatured: true },
  isOnOffer: { isOnOffer: true },
  isFlashDeal: { isFlashDeal: true },
  isNewArrival: { isNewArrival: true },
  isDiscounted: { isDiscounted: true },
  trending: { providerRating: { gte: 4.5 } },
};

/* ---------------------------------------------
   Cached Query (PURE FUNCTION)
---------------------------------------------- */
const getProductsByFlag = unstable_cache(
  async ({
    companyId,
    flag,
    limit,
    page,
    searchParams,
  }: {
    companyId: string;
    flag: string;
    limit: number;
    page: number;
    searchParams: URLSearchParams;
  }) => {
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
      status: "ACTIVE",
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ...(flagMap[flag] || {}),
    };

    /* ---------- Filters ---------- */
    // const transactionType = searchParams.get("transactionType");
    // if (transactionType && ["SALE", "RENT"].includes(transactionType)) {
    //   where.listingTransactionType = transactionType;
    // }

    const fuelType = searchParams.get("fuelType");
    if (fuelType) where.fuelType = fuelType;

    const transmission = searchParams.get("transmission");
    if (transmission) where.transmission = transmission;

    const minPrice = Number(searchParams.get("minPrice"));
    const maxPrice = Number(searchParams.get("maxPrice"));

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      where.finalPrice = {};
      if (!isNaN(minPrice)) where.finalPrice.gte = minPrice;
      if (!isNaN(maxPrice)) where.finalPrice.lte = maxPrice;
    }

    const keywords = searchParams.get("keywords");
    if (keywords) {
      where.OR = [
        { name: { contains: keywords, mode: "insensitive" } },
        { brand: { contains: keywords, mode: "insensitive" } },
        { make: { contains: keywords, mode: "insensitive" } },
      ];
    }

    /* ---------- Query ---------- */
    const [items, total] = await Promise.all([
      prisma.marketplaceListings.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          sellingPrice: true,
          finalPrice: true,
          brand: true,
          images: true,
          isFeatured: true,
          isOnOffer: true,
          isDiscounted: true,
          isFlashDeal: true,
          isNewArrival: true,
          providerRating: true,
          option: true,
        },
      }),
      prisma.marketplaceListings.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  [],
  {
    revalidate: 60,
    tags: ["products-by-flag"],
  }
);

/* ---------------------------------------------
   GET Handler
---------------------------------------------- */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get("companyId");
    if (!companyId) {
      return withCors({ error: "Missing companyId" }, 400);
    }

    const flag = searchParams.get("flag") || "isFeatured";
    const limit = Math.min(Number(searchParams.get("limit") || 8), 50);
    const page = Math.max(Number(searchParams.get("page") || 1), 1);

    /* ---------- External Cache ---------- */
    const cacheKey = `shop:products:${companyId}:${flag}:${page}:${limit}:${searchParams.toString()}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return withCors(cached);

    const result = await getProductsByFlag({
      companyId,
      flag,
      limit,
      page,
      searchParams,
    });

    await cacheSet(cacheKey, result, 300);

    return withCors(result, 200, {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
    });
  } catch (error: any) {
    console.error("Products fetch error:", error);
    return withCors(
      { error: "Failed to load products", detail: error.message },
      500
    );
  }
}