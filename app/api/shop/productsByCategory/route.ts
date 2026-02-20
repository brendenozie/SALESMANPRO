import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import {cacheGet, cacheSet} from "@/lib/cache";
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


// GET /api/marketplace-by-category?agentId=&categoryId=&page=&limit=
export async function GET(req: Request) {
  try {
  
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const categoryId = searchParams.get("categoryId");

    // Pagination params
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "6", 10);
    if (isNaN(pageParam) || pageParam < 1 || isNaN(limitParam) || limitParam < 1) {
      return withCors(
        { error: "Invalid pagination parameters." },
        400
      );
    }
    const skip = (pageParam - 1) * limitParam;
    const take = limitParam;

    // Build where filter
    const whereFilter: any = {};
    if (agentId) whereFilter.companyId = agentId;
    if (categoryId) whereFilter.product = { productCategoryId: categoryId };

    const cacheKey = `shop:productsByCategory:agent:${agentId || 'all'}:category:${categoryId || 'all'}:page:${pageParam}:limit:${limitParam}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return withCors(cached, 200);
    } catch (e) {}

    // Fetch listings and total count
    const [total, listings] = await Promise.all([
      prisma.marketplaceListings.count({ where: whereFilter }),
      prisma.marketplaceListings.findMany({
        where: whereFilter,
        skip,
        take,
        include: { product: true },
        orderBy: { createdAt: 'desc' }
      }),
    ]);

    const totalPages = Math.ceil(total / take);

    const response = {
      data: listings,
      meta: { total, perPage: take, currentPage: pageParam, totalPages }
    };

    try {
      await cacheSet(cacheKey, response, 60); // Cache for 1 minute
    } catch (e) {
      console.error("Failed to cache marketplace listings by category data:", e);
    }

    return withCors(response, 200);
  } catch (error: any) {
    console.error("Error fetching marketplace listings by category:", error);
    return withCors(
      { error: "Failed to fetch listings", detail: error.message }, 500
    );  
  }
}
