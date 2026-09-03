import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { unstable_cache } from "next/cache";
import { cacheGet, cacheSet, fetchWithCache, buildTenantCacheKey } from "@/lib/cache";

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
  extraHeaders: Record<string, string> = {},
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
   Cached Query (FIXED: Uses serialized string instead of URLSearchParams object)
---------------------------------------------- */
const getProductsByFlag = unstable_cache(
  async ({
    companyId,
    flag,
    limit,
    page,
    queryString,
  }: {
    companyId: string;
    flag: string;
    limit: number;
    page: number;
    queryString: string;
  }) => {
    const skip = (page - 1) * limit;
    const searchParams = new URLSearchParams(queryString);

    // Core base filters
    const buildWhereClause = (includeTransactionType = true) => {
      const where: any = {
        companyId,
        // status: "ACTIVE",
        // showOnGhuba: true,
        // ghubaStatus: "APPROVED",
        ...(flagMap[flag] || {}),
      };

      /* ---------- Transaction Type Filter with Fallback capability ---------- */
      const transactionType = searchParams.get("transactionType");
      if (
        includeTransactionType &&
        transactionType &&
        ["SALE", "RENT"].includes(transactionType)
      ) {
        where.listingTransactionType = transactionType;
      }

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

      return where;
    };

    // const selectFields = {
    //   id: true,
    //   name: true,
    //   description: true,
    //   sellingPrice: true,
    //   finalPrice: true,
    //   brand: true,
    //   images: true,
    //   isFeatured: true,
    //   isOnOffer: true,
    //   isDiscounted: true,
    //   isFlashDeal: true,
    //   isNewArrival: true,
    //   providerRating: true,
    //   option: true,
    // };
    
    const selectFields = {
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

      // --- Automotive Specific Additions ---
      listingTransactionType: true, // Crucial for frontend verification
      make: true,
      year: true,
      mileage: true,
      transmission: true,
      fuelType: true,
      locationName: true, // Or location { select: { name: true } } if using relations
    };

    // 1st Attempt: Search with the transactionType status
    let where = buildWhereClause(true);
    let [items, total] = await Promise.all([
      prisma.marketplaceListings.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        select: selectFields,
      }),
      prisma.marketplaceListings.count({ where }),
    ]);

    // 2nd Attempt Fallback: If no strict buy/rent status items match, show whatever is available
    if (items.length === 0) {
      where = buildWhereClause(false); // builds where clause ignoring transactionType
      [items, total] = await Promise.all([
        prisma.marketplaceListings.findMany({
          where,
          take: limit,
          skip,
          orderBy: { createdAt: "desc" },
          select: selectFields,
        }),
        prisma.marketplaceListings.count({ where }),
      ]);
    }

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
  ["products-by-flag-base"],
  {
    revalidate: 60,
    tags: ["products-by-flag"],
  },
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

    const queryString = searchParams.toString();
    const cacheKey = buildTenantCacheKey(companyId, "productsByFlag", {
      flag,
      page,
      limit,
      query: queryString,
    });

    const result = await fetchWithCache(
      cacheKey,
      () =>
        getProductsByFlag({
          companyId,
          flag,
          limit,
          page,
          queryString,
        }),
      180
    );

    return withCors(result, 200, {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
    });
  } catch (error: any) {
    console.error("Products fetch error:", error);
    return withCors(
      { error: "Failed to load products", detail: error.message },
      500,
    );
  }
}

