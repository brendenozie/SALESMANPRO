import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import type { ListingStatus, Prisma } from "@prisma/client";
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

    // Extract & Sanitize
    const agentId = searchParams.get("agentId");
    const search = searchParams.get("search")?.trim();
    const brands = searchParams.getAll("brand");
    const categories = searchParams.getAll("category");
    const minPrice = parseFloat(searchParams.get("minPrice") || "");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "");
    const isAvailable = searchParams.get("availability") === "true";
    const sortParam = searchParams.get("sort") || "createdAt:desc";
    const statusParam = searchParams.get("status") || "ACTIVE";
    const ghubaAdminApprovedParam =  searchParams.get("ghubaAdminApproved") === "true";
    const ghubaStatusParam = searchParams.get("ghubaStatus") || "APPROVED";
    const cursor = searchParams.get("cursor");

    // Increased default limit for better virtualization fill
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || "24", 10)),
      100,
    );

    const cacheKey = `mkt:search:${JSON.stringify({
      agentId,
      search,
      brands: brands.sort(),
      categories: categories.sort(),
      minPrice,
      maxPrice,
      isAvailable,
      sortParam,
      cursor,
      limit,
    })}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return new NextResponse(JSON.stringify(cached), {
          status: 200,
          headers: JSON_HEADER,
        });
      }
    } catch (e) {
      // Cache miss or error, continue
    }

    const where: Prisma.marketplaceListingsWhereInput = {
      ...(agentId && { companyId: agentId }),
      ...(isAvailable && { isAvailable: true }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...((!isNaN(minPrice) || !isNaN(maxPrice)) && {
        sellingPrice: {
          ...(!isNaN(minPrice) && { gte: minPrice }),
          ...(!isNaN(maxPrice) && { lte: maxPrice }),
        },
      }),
      ...(brands.length > 0 && { brand: { in: brands } }),
      ...(categories.length > 0 && { category: { in: categories } }),
      ...(statusParam && { status: statusParam as ListingStatus }),
      ...(ghubaAdminApprovedParam && { ghubaAdminApproved: true }),
      ...(ghubaStatusParam && { ghubaStatus: ghubaStatusParam }),
    };

    const [field, direction] = sortParam.split(":");
    const orderBy: Prisma.marketplaceListingsOrderByWithRelationInput =
      field === "sellingPrice" || field === "createdAt"
        ? { [field]: direction === "asc" ? "asc" : "desc" }
        : { createdAt: "desc" };

    // Optimized: Removed the heavy count() transaction
    const listings = await prisma.marketplaceListings.findMany({
      where,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1, // Fetch one extra to determine if next page exists
      orderBy,
      select: {
        id: true,
        name: true,
        sellingPrice: true,
        finalPrice: true,
        images: true,
        brand: true,
        category: true,
        isAvailable: true,
        createdAt: true,
      },
    });

    let nextCursor: string | undefined = undefined;
    if (listings.length > limit) {
      const nextItem = listings.pop();
      nextCursor = nextItem?.id;
    }

    const responseData = {
      data: listings,
      meta: {
        nextCursor,
        hasNextPage: !!nextCursor,
      },
    };

    cacheSet(cacheKey, responseData, 120).catch(() => {});

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...JSON_HEADER,
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
      },
    });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: "Internal Error" }), {
      status: 500,
      headers: JSON_HEADER,
    });
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
