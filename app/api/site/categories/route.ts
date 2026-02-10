import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { unstable_cache } from 'next/cache';

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
// CACHED CATEGORY QUERY
// ---------------------------
const getCachedCategories = (companyId: string) =>
  unstable_cache(
    async () => {
      return await prisma.storeCategory.findMany({
        where: { companyId },
        orderBy: { displayName: 'asc' },
        select: { id: true, displayName: true },
      });
    },
    [`store-categories-${companyId}`],
    {
      revalidate: 3600, // Cache for 1 hour
      tags: [`categories-${companyId}`],
    }
  )();

// ---------------------------
// GET HANDLER
// ---------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return withCors({ error: 'Missing companyId' }, 400);
    }

    const categories = await getCachedCategories(companyId);

    return withCors(
      { data: categories },
      200,
      {
        // Category navigation is perfect for aggressive Edge caching
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
      }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return withCors({ error: 'Failed to fetch categories' }, 500);
  }
}
// import { NextResponse } from 'next/server';
// import prisma from '@/server/db/prismadb';

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

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const companyId = searchParams.get('companyId');
//   if (!companyId) return withCors({ error: 'Missing companyId' }, 400);
//   const categories = await prisma.storeCategory.findMany({
//     where: { companyId },
//     orderBy: { displayName: 'asc' },
//     select: { id: true, displayName: true },
//   });

//   return withCors({ data: categories });
// }
