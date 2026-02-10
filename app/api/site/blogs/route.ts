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
// CACHED BLOG QUERY
// ---------------------------
const getCachedBlogs = (companyId: string) =>
  unstable_cache(
    async () => {
      return await prisma.blog.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        // Pro-tip: If you only need summaries for the list view, 
        // use 'select' to exclude heavy 'content' fields here.
      });
    },
    [`blogs-${companyId}`],
    {
      revalidate: 300, // Cache for 5 minutes
      tags: [`blogs-${companyId}`, 'all-blogs'],
    }
  )();

// ---------------------------
// GET HANDLER
// ---------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return withCors({ error: 'Missing id parameter' }, 400);
    }

    const blogs = await getCachedBlogs(id);

    return withCors(
      { data: blogs },
      200,
      {
        // Edge cache for 5 mins, stale serving for 1 hour
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      }
    );
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return withCors({ error: 'Failed to fetch blogs' }, 500);
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
//   const id = searchParams.get('id');
  
//   if (!id) {
//     return withCors({ error: 'Missing id parameter' }, 400);
//   }

//   try {
//     const blogs = await prisma.blog.findMany({
//       where: { 
//         companyId: id,
//         // status: 'PUBLISHED'
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     return withCors({ data: blogs });
//   } catch (error) {
//     console.error('Error fetching blogs:', error);
//     return withCors({ error: 'Failed to fetch blogs' }, 500);
//   }
// }
