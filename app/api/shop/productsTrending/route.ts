import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

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


// GET /api/trending?agentId=&limit=&days=&weightViews=&weightPurchases=&weightFavorites=
export async function GET(req: Request) {
  try {
        
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const weightViews = parseFloat(searchParams.get("weightViews") || "1");
    const weightPurchases = parseFloat(searchParams.get("weightPurchases") || "2");
    const weightFavorites = parseFloat(searchParams.get("weightFavorites") || "1.5");

    if (isNaN(limit) || limit < 1 || isNaN(days) || days < 1) {
      return withCors({ error: "Invalid query parameters." }, 400);
    }

    // Optional filter by agent/company
    const whereFilter: any = {};
    if (agentId) whereFilter.companyId = agentId;

    // Fetch metrics (optionally could filter by recent metrics if timestamped)
    const metrics = await prisma.productMetrics.findMany({
      where: whereFilter,
      include: { product: true },
    });

    // Calculate trending score
    const trending = metrics.map((m: any) => {
      const views = m.views ?? 0;
      const purchases = m.purchases ?? 0;
      const favorites = m.favorites ?? 0;
      const score = views * weightViews + purchases * weightPurchases + favorites * weightFavorites;
      return {
        product: m.product,
        views,
        purchases,
        favorites,
        score,
      };
    });

    // Sort descending by score
    trending.sort((a, b) => b.score - a.score);

    // Return top N
    const top = trending.slice(0, limit);

    return withCors(
      { data: top, meta: { limit, weights: { views: weightViews, purchases: weightPurchases, favorites: weightFavorites } } },
      200
    );
  } catch (err: any) {
    console.error("Error fetching trending products:", err);
    return withCors({ error: "Internal Server Error", detail: err.message }, 500);
  }
}