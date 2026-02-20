import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { cacheGet, cacheSet } from "@/lib/cache";

import { formatResponse } from "@/lib/formatResponse";

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


// GET /api/recommendations?userId=&agentId=&limit=&offset=
export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!userId) {
      return withCors({ error: "Missing userId" }, 400);
    }
    if (isNaN(limit) || limit < 1 || isNaN(offset) || offset < 0) {
      return withCors({ error: "Invalid pagination parameters." }, 400);
    }

    const cacheKey = `shop:recommendations:user:${userId}:agent:${agentId || 'all'}:limit:${limit}:offset:${offset}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return withCors(cached, 200);
    } catch (e) {}

    // Fetch recent interactions
    const recent = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: { marketplaceListings: true },
    });

    const interactedProductIds = recent.map(i => i.marketplaceListingId).filter((id): id is string => typeof id === 'string');
    const categories = recent.map(i => i.marketplaceListings?.productCategoryId).filter(Boolean) as string[];
    const tags = recent.flatMap(i => i.marketplaceListings?.tags || []);

    // Recommendations
    const recommendations = await prisma.marketplaceListings.findMany({
      where: {
        ...(agentId && { companyId: agentId }),
        OR: [
          ...(categories.length ? [{ productCategoryId: { in: categories } }] : []),
          ...(tags.length ? [{ tags: { hasSome: tags } }] : []),
        ],
        NOT: { id: { in: interactedProductIds } },
      },
      take: limit,
      skip: 0,
    });

    try {
      await cacheSet(cacheKey, { data: recommendations, meta: { interactedCount: recent.length, recommendationCount: recommendations.length } }, 300); // Cache for 5 minutes
    } catch (e) {
      console.error("Failed to cache recommendations:", e);
    }

    return withCors(
      { data: recommendations, meta: { interactedCount: recent.length, recommendationCount: recommendations.length } },
      200
    );
  } catch (err: any) {
    console.error("Error fetching recommendations:", err);
    return withCors({ error: "Failed to fetch recommendations", detail: err.message }, 500);
  }
}
