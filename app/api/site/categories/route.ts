// app/api/shop/categories/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/server/db/prismadb'
import { withApiHandler } from '@/lib/hooks/withApiHandler'

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

    return NextResponse.json({
      categories,
      totalPages: Math.ceil(total / take),
    })
  } catch (error) {
    console.error('[GET /api/shop/categories] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product categories' },
      { status: 500 }
    )
  }
}

export const GET = withApiHandler(getHandler, { requireAuth: false, requireRateLimit: true });
