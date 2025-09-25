import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import type { Prisma } from "@prisma/client";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { request } from "http";

// GET /api/marketplace-listings?agentId=&search=&brand=&category=&subCategory=&minPrice=&maxPrice=&availability=&sort=&page=&limit=
export async function GET(req: Request) {
  try {
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const search = searchParams.get("search") || undefined;
    const brand = searchParams.getAll("brand");
    const category = searchParams.getAll("category");
    const subCategory = searchParams.getAll("subCategory");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const availabilityParam = searchParams.get("availability");
    const sortParam = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return NextResponse.json({ error: "Invalid pagination parameters." }, { status: 400 });
    }
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.MarketplaceListingWhereInput = {
      ...(agentId && { companyId: agentId }),
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
      ...(minPrice || maxPrice) && {
        sellingPrice: {
          ...(minPrice && !isNaN(Number(minPrice)) && { gte: Number(minPrice) }),
          ...(maxPrice && !isNaN(Number(maxPrice)) && { lte: Number(maxPrice) }),
        },
      },
      ...(availabilityParam === 'true' ? { isAvailable: true } : availabilityParam === 'false' ? { isAvailable: false } : {}),
      ...(brand.length > 0 && { brand: { in: brand } }),
      ...(category.length > 0 && { category: { in: category } }),
      // If subCategory is a JSON field, use 'hasSome' for array matching
      // ...(subCategory.length > 0 && { subCategory: { hasSome: subCategory } }),
    };

    // Sorting
    // Default sort by createdAt desc, or allow sorting by price or createdAt
    let orderBy: Prisma.MarketplaceListingOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortParam) {
      const [field, direction] = sortParam.split(':');
      if (
        (field === 'createdAt' || field === 'sellingPrice') &&
        (direction === 'asc' || direction === 'desc')
      ) {
        orderBy = { [field]: direction };
      }
    }

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.marketplaceListing.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return NextResponse.json(
      { data: listings, meta: { total, perPage: limit, page, totalPages, orderBy } },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error fetching listings:", err);
    return NextResponse.json(
      { error: "Failed to fetch listings", detail: err.message },
      { status: 500 }
    );
  }
}
