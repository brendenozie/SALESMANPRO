import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic';

// Helper to map flag → Prisma condition
const flagMap: Record<string, Record<string, any>> = {
  isFeatured: { isFeatured: true },
  isOnOffer: { isOnOffer: true },
  isFlashDeal: { isFlashDeal: true },
  isNewArrival: { isNewArrival: true },
  isDiscounted: { isDiscounted: true },
  trending: { providerRating: { gte: 4.5 } },
};

export const revalidate = 60; // Revalidate cached data every 60 seconds

// ✅ Caching wrapper — ensures repeated calls don’t hit the DB
const getProductsByFlag = unstable_cache(
  async (id: string, flag: string, limit: number, page: number) => {
    const where: any = {
      company: { id: id },
      ...(flagMap[flag] || {}),
    };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.marketplaceListings.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          sellingPrice: true,
          finalPrice: true,
          brand: true,
          images: true,
          isFeatured: true,
          isOnOffer: true,
          isDiscounted: true,
          isFlashDeal: true,
          isNewArrival: true,
        },
      }),
      prisma.marketplaceListings.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  ['products-by-flag'], // cache key
  { revalidate: 60 }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const flag = searchParams.get('flag') || 'isFeatured';
    const limit = parseInt(searchParams.get('limit') || '8');
    const page = parseInt(searchParams.get('page') || '1');

    if (!id) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    const response = await getProductsByFlag(id, flag, limit, page);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        // ✅ Cache at edge for 2 min, allow stale reads for 10 min
        'Cache-Control': 's-maxage=120, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to load products' },
      { status: 500 }
    );
  }
}
