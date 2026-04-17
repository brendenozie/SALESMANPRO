import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet } from "@/lib/cache";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Optimization: Pre-calculate headers
const JSON_HEADER = { "Content-Type": "application/json", ...CORS_HEADERS };

async function getHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10));
    const skip = (page - 1) * limit;

    const cacheKey = `shop:cat:p${page}:l${limit}`;

    // 1. Quick Cache Check
    try {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return new NextResponse(JSON.stringify(cached), {
          status: 200,
          headers: JSON_HEADER,
        });
      }
    } catch (e) {
      /* Fallback to DB if cache is down */
    }

    // 2. Optimized Database Query
    // Optimization: Only select the fields you actually need for the UI
    const [categories, total] = await prisma.$transaction([
      prisma.productCategory.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          icon: true,
          isFeatured: true,
          // Avoid selecting large description fields if not needed in the list
        },
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      }),
      prisma.productCategory.count(),
    ]);

    const responseData = {
      categories,
      totalPages: Math.ceil(total / limit),
    };

    // 3. Background Cache Set (Don't 'await' if your cache lib allows)
    // Increase TTL to 1 hour (3600s). Invalidate manually when adding a category.
    cacheSet(cacheKey, responseData, 3600).catch(console.error);

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...JSON_HEADER,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: JSON_HEADER },
    );
  }
}

export const GET = withApiHandler(getHandler, {
  requireAuth: false,
  requireRateLimit: true,
});
