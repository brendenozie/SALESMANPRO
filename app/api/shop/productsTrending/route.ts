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
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "10", 10)), 50);
    
    // Weights
    const wViews = parseFloat(searchParams.get("weightViews") || "1");
    const wPurchases = parseFloat(searchParams.get("weightPurchases") || "2");
    const wFavorites = parseFloat(searchParams.get("weightFavorites") || "1.5");

    const cacheKey = `trending:a:${agentId ?? 'all'}:l:${limit}:w:${wViews}-${wPurchases}-${wFavorites}`;

    // 1. Check Cache First
    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return new NextResponse(JSON.stringify(cached), { status: 200, headers: JSON_HEADER });
    } catch (e) {}

    // 2. Optimized Database Query
    // We let the DB handle the sorting if possible, or at least limit the memory footprint
    const metrics = await prisma.productMetrics.findMany({
      where: agentId ? { companyId: agentId } : {},
      take: agentId ? 100 : 200, // Limit the pool we sort in JS to the top 'X' raw performers
      orderBy: [
        { purchases: 'desc' }, // Primary sort at DB level to reduce result set
        { views: 'desc' }
      ],
      select: {
        views: true,
        purchases: true,
        favorites: true,
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            slug: true,
            sellingPrice: true,
            finalPrice: true,
          }
        }
      }
    });

    // 3. Calculate Scores on a limited set
    const topTrending = metrics
      .map((m) => ({
        product: m.product,
        score: (m.views ?? 0) * wViews + (m.purchases ?? 0) * wPurchases + (m.favorites ?? 0) * wFavorites,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const responseData = { 
      data: topTrending, 
      meta: { limit, weights: { views: wViews, purchases: wPurchases, favorites: wFavorites } } 
    };

    // 4. Background Cache (Trending data is perfect for longer cache)
    // It doesn't need to be real-time. 15 minutes is usually fine.
    cacheSet(cacheKey, responseData, 900).catch(() => {});

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...JSON_HEADER,
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: "Internal Error" }), { status: 500, headers: JSON_HEADER });
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { cacheGet, cacheSet } from "@/lib/cache";

// // ---------------------------
// // GLOBAL CORS HEADERS
// // ---------------------------
// const CORS_HEADERS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers":
//     "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
// };

// function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
//   return new NextResponse(JSON.stringify(json), {
//     status,
//     headers: {
//       "Content-Type": "application/json",
//       ...CORS_HEADERS,
//       ...extraHeaders,
//     },
//   });
// }

// // ---------------------------
// // OPTIONS (PRE-FLIGHT)
// // ---------------------------
// export function OPTIONS() {
//   return new NextResponse(null, {
//     status: 204,
//     headers: CORS_HEADERS,
//   });
// }


// // GET /api/trending?agentId=&limit=&days=&weightViews=&weightPurchases=&weightFavorites=
// export async function GET(req: Request) {
//   try {
        
//     const { searchParams } = new URL(req.url);
//     const agentId = searchParams.get("agentId");
//     const limit = parseInt(searchParams.get("limit") || "10", 10);
//     const days = parseInt(searchParams.get("days") || "30", 10);
//     const weightViews = parseFloat(searchParams.get("weightViews") || "1");
//     const weightPurchases = parseFloat(searchParams.get("weightPurchases") || "2");
//     const weightFavorites = parseFloat(searchParams.get("weightFavorites") || "1.5");

//     if (isNaN(limit) || limit < 1 || isNaN(days) || days < 1) {
//       return withCors({ error: "Invalid query parameters." }, 400);
//     }

//     // Optional filter by agent/company
//     const whereFilter: any = {};
//     if (agentId) whereFilter.companyId = agentId;

//       const cacheKey = `shop:trending:agent:${agentId || 'all'}:limit:${limit}:days:${days}:weights:${weightViews}-${weightPurchases}-${weightFavorites}`;

//     try {
//       const cached = await cacheGet(cacheKey);
//       if (cached) return withCors(cached, 200);
//     } catch (e) {}

//     // Fetch metrics (optionally could filter by recent metrics if timestamped)
//     const metrics = await prisma.productMetrics.findMany({
//       where: whereFilter,
//       include: { product: true },
//     });

//     // Calculate trending score
//     const trending = metrics.map((m: any) => {
//       const views = m.views ?? 0;
//       const purchases = m.purchases ?? 0;
//       const favorites = m.favorites ?? 0;
//       const score = views * weightViews + purchases * weightPurchases + favorites * weightFavorites;
//       return {
//         product: m.product,
//         views,
//         purchases,
//         favorites,
//         score,
//       };
//     });

//     // Sort descending by score
//     trending.sort((a, b) => b.score - a.score);

//     // Return top N
//     const top = trending.slice(0, limit);

//     try {
//       await cacheSet(cacheKey, { data: top, meta: { limit, weights: { views: weightViews, purchases: weightPurchases, favorites: weightFavorites } } }, 300); // Cache for 5 minutes
//     } catch (e) {
//       console.error("Failed to cache trending products data:", e);
//     }

//     return withCors(
//       { data: top, meta: { limit, weights: { views: weightViews, purchases: weightPurchases, favorites: weightFavorites } } },
//       200
//     );
//   } catch (err: any) {
//     console.error("Error fetching trending products:", err);
//     return withCors({ error: "Internal Server Error", detail: err.message }, 500);
//   }
// }