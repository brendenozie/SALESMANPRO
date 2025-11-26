import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic';

// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// ---------------------------
// OPTIONS (PRE-FLIGHT)
// ---------------------------
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// ---------------------------
// FLAG MAP
// ---------------------------
const flagMap: Record<string, Record<string, any>> = {
  isFeatured: { isFeatured: true },
  isOnOffer: { isOnOffer: true },
  isFlashDeal: { isFlashDeal: true },
  isNewArrival: { isNewArrival: true },
  isDiscounted: { isDiscounted: true },
  trending: { providerRating: { gte: 4.5 } },
};

export const revalidate = 60;

// ---------------------------
// CACHED DB QUERY
// ---------------------------
const getProductsByFlag = unstable_cache(
  async (companyId: string, flag: string, limit: number, page: number) => {
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
      ...(flagMap[flag] || {}),
    };

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
  ["products-by-flag"],
  { revalidate: 60 }
);

// ---------------------------
// GET HANDLER
// ---------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get("companyId");
    const flag = searchParams.get("flag") || "isFeatured";
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    if (!companyId) {
      return withCors({ error: "Missing companyId" }, 400);
    }

    const result = await getProductsByFlag(companyId, flag, limit, page);

    return withCors(result, 200, {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=600",
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    return withCors({ error: "Failed to load products" }, 500);
  }
}
