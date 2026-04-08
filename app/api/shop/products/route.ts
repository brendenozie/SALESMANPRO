import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import type { Prisma } from "@prisma/client";
import { cacheGet, cacheSet } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";
import { request } from "http";

// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
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

// ---------------------------
// OPTIONS (PRE-FLIGHT)
// ---------------------------
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// GET /api/marketplace-listings?agentId=&search=&brand=&category=&subCategory=&minPrice=&maxPrice=&availability=&sort=&page=&limit=
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const search = searchParams.get("search") || undefined;
    const brand = searchParams.getAll("brand");
    const category = searchParams.getAll("category");
    const subCategory = searchParams.getAll("subCategory");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const availabilityParam = searchParams.get("availability");
    const sortParam = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return withCors({ error: "Invalid pagination parameters." }, 400);
    }
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.marketplaceListingsWhereInput = {
      ...(agentId && { companyId: agentId }),
      ...(search && { title: { contains: search, mode: "insensitive" } }),
      ...((minPrice || maxPrice) && {
        sellingPrice: {
          ...(minPrice &&
            !isNaN(Number(minPrice)) && { gte: Number(minPrice) }),
          ...(maxPrice &&
            !isNaN(Number(maxPrice)) && { lte: Number(maxPrice) }),
        },
      }),
      ...(availabilityParam === "true"
        ? { isAvailable: true }
        : availabilityParam === "false"
          ? { isAvailable: false }
          : {}),
      ...(brand.length > 0 && { brand: { in: brand } }),
      ...(category.length > 0 && { category: { in: category } }),
      // If subCategory is a JSON field, use 'hasSome' for array matching
      // ...(subCategory.length > 0 && { subCategory: { hasSome: subCategory } }),
    };

    // Sorting
    // Default sort by createdAt desc, or allow sorting by price or createdAt
    let orderBy: Prisma.marketplaceListingsOrderByWithRelationInput = {
      createdAt: "desc",
    };
    if (sortParam) {
      const [field, direction] = sortParam.split(":");
      if (
        (field === "createdAt" || field === "sellingPrice") &&
        (direction === "asc" || direction === "desc")
      ) {
        orderBy = { [field]: direction };
      }
    }

    const cacheKey = `shop:products:agent:${agentId || "all"}:search:${search || "all"}:brand:${brand.join(",") || "all"}:category:${category.join(",") || "all"}:subCategory:${subCategory.join(",") || "all"}:minPrice:${minPrice || "0"}:maxPrice:${maxPrice || "999999999"}:availability:${availabilityParam || "all"}:sort:${sortParam || "createdAt:desc"}:page:${page}:limit:${limit}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return withCors(cached, 200);
    } catch (e) {}

    const [listings, total] = await Promise.all([
      prisma.marketplaceListings.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.marketplaceListings.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    try {
      await cacheSet(
        cacheKey,
        {
          data: listings,
          meta: { total, perPage: limit, page, totalPages, orderBy },
        },
        60,
      ); // Cache for 1 minute
    } catch (e) {
      console.error("Failed to cache marketplace listings data:", e);
    }

    return withCors(
      {
        data: listings,
        meta: { total, perPage: limit, page, totalPages, orderBy },
      },
      200,
    );
  } catch (err: any) {
    console.error("Error fetching listings:", err);
    return withCors(
      { error: "Failed to fetch listings", detail: err.message },
      500,
    );
  }
}
