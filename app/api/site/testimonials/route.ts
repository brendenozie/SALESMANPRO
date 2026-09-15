import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
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
// CACHED TESTIMONIALS QUERY
// ---------------------------
const getCachedTestimonials = (companyId: string) =>
  unstable_cache(
    async () => {
      return await prisma.testimonial.findMany({
        where: { companyId },
        orderBy: { order: "asc" },
        take: 20,
      });
    },
    [`testimonials-${companyId}`],
    {
      revalidate: 3600, // Cache for 1 hour (testimonials change rarely)
      tags: [`testimonials-${companyId}`],
    }
  )();

// ---------------------------
// GET HANDLER
// ---------------------------
async function GETHandler(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return withCors({ error: 'Missing id parameter' }, 400);
  }

  try {
    const testimonials = await getCachedTestimonials(id);

    return withCors(
      { data: testimonials },
      200,
      {
        // Public cache: Cache at edge for 5 mins, allow stale for 24 hours
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      }
    );
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return withCors({ error: 'Failed to fetch testimonials' }, 500);
  }
}

export const GET = withApiHandler(GETHandler, { requireAuth: false });