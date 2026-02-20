import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { unstable_cache } from 'next/cache';
import { cacheGet, cacheSet } from "@/lib/cache";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
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

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------
// CACHED DATA FETCHING
// ---------------------------
const getListingsByCategory = (agentId: string | null, categoryId: string | null, page: number, limit: number) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * limit;
      
      const whereFilter: any = {};
      if (agentId) whereFilter.companyId = agentId;
      if (categoryId) whereFilter.product = { productCategoryId: categoryId };

      const [total, listings] = await Promise.all([
        prisma.marketplaceListings.count({ where: whereFilter }),
        prisma.marketplaceListings.findMany({
          where: whereFilter,
          skip,
          take: limit,
          // Using 'select' instead of 'include' is often faster if you don't need the whole product object
          include: { product: true }, 
          orderBy: { createdAt: 'desc' }
        }),
      ]);

      return {
        data: listings,
        meta: { 
          total, 
          perPage: limit, 
          currentPage: page, 
          totalPages: Math.ceil(total / limit) 
        }
      };
    },
    [`cat-listings-${agentId}-${categoryId}-${page}-${limit}`],
    {
      revalidate: 60,
      tags: ['marketplace-listings', `agent-${agentId}`, `cat-${categoryId}`]
    }
  )();

// ---------------------------
// GET HANDLER
// ---------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const categoryId = searchParams.get("categoryId");

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10), 50);

    const cacheKey = `shop:productsByCategory:agent:${agentId || 'all'}:category:${categoryId || 'all'}:page:${page}:limit:${limit}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return withCors(cached, 200);
    } catch (e) {}

    // Fetch from cache
    const result = await getListingsByCategory(agentId, categoryId, page, limit);
    

    try {
      await cacheSet(cacheKey, result, 300); // Cache for 5 minutes
    } catch (e) {
      console.error("Failed to cache products by category:", e);
    }

    return withCors(result, 200, {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    });

  } catch (error: any) {
    console.error("Error fetching marketplace listings by category:", error);
    return withCors({ error: "Failed to fetch listings" }, 500);
  }
}
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";

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


// // GET /api/marketplace-by-category?agentId=&categoryId=&page=&limit=
// export async function GET(req: Request) {
//   try {
  
//     const { searchParams } = new URL(req.url);
//     const agentId = searchParams.get("agentId");
//     const categoryId = searchParams.get("categoryId");

//     // Pagination params
//     const pageParam = parseInt(searchParams.get("page") || "1", 10);
//     const limitParam = parseInt(searchParams.get("limit") || "6", 10);
//     if (isNaN(pageParam) || pageParam < 1 || isNaN(limitParam) || limitParam < 1) {
//       return withCors(
//         { error: "Invalid pagination parameters." },
//         400
//       );
//     }
//     const skip = (pageParam - 1) * limitParam;
//     const take = limitParam;

//     // Build where filter
//     const whereFilter: any = {};
//     if (agentId) whereFilter.companyId = agentId;
//     if (categoryId) whereFilter.product = { productCategoryId: categoryId };

//     // Fetch listings and total count
//     const [total, listings] = await Promise.all([
//       prisma.marketplaceListings.count({ where: whereFilter }),
//       prisma.marketplaceListings.findMany({
//         where: whereFilter,
//         skip,
//         take,
//         include: { product: true },
//         orderBy: { createdAt: 'desc' }
//       }),
//     ]);

//     const totalPages = Math.ceil(total / take);

//     return withCors(
//       {
//         data: listings,
//         meta: { total, perPage: take, currentPage: pageParam, totalPages }
//       },
//       200
//     );
//   } catch (error: any) {
//     console.error("Error fetching marketplace listings by category:", error);
//     return withCors(
//       { error: "Failed to fetch listings", detail: error.message }, 500);
//   }
// }
