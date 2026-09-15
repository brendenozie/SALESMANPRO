import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { unstable_cache } from 'next/cache';

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

const getCachedEvents = (companyId: string) =>
  unstable_cache(
    async () => {
      return await prisma.event.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    },
    [`events-${companyId}`],
    {
      revalidate: 600,
      tags: [`events-${companyId}`, 'all-events'],
    }
  )();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return withCors({ error: 'Missing id parameter' }, 400);
  }

  try {
    const events = await getCachedEvents(id);

    return withCors(
      { data: events },
      200,
      {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      }
    );
  } catch (error) {
    console.error('Error fetching events:', error);
    return withCors({ error: 'Failed to fetch events' }, 500);
  }
}
