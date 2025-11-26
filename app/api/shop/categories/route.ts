// app/api/shop/categories/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/server/db/prismadb'
import { withApiHandler } from '@/lib/hooks/withApiHandler'

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


async function getHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '12', 10)

    const skip = (page - 1) * limit
    const take = limit

    // Fetch categories sorted by featured status first, then by name
    const [categories, total] = await Promise.all([
      prisma.productCategory.findMany({
        skip,
        take,
        orderBy: [
          { isFeatured: 'desc' }, // Featured categories come first
          { name: 'asc' },        // Then alphabetical order (optional)
        ],
      }),
      prisma.productCategory.count(),
    ])

    return withCors({
      categories,
      totalPages: Math.ceil(total / take),
    })
  } catch (error) {
    console.error('[GET /api/shop/categories] Error:', error)
    return withCors(
      { error: 'Failed to fetch product categories' },
      500
    )
  }
}

export const GET = withApiHandler(getHandler, { requireAuth: false, requireRateLimit: true });
