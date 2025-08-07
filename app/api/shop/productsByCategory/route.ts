import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// GET /api/marketplace-by-category?agentId=&categoryId=&page=&limit=
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const categoryId = searchParams.get("categoryId");

    // Pagination params
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "6", 10);
    if (isNaN(pageParam) || pageParam < 1 || isNaN(limitParam) || limitParam < 1) {
      return NextResponse.json(
        { error: "Invalid pagination parameters." },
        { status: 400 }
      );
    }
    const skip = (pageParam - 1) * limitParam;
    const take = limitParam;

    // Build where filter
    const whereFilter: any = {};
    if (agentId) whereFilter.companyId = agentId;
    if (categoryId) whereFilter.product = { productCategoryId: categoryId };

    // Fetch listings and total count
    const [total, listings] = await Promise.all([
      prisma.marketplaceListings.count({ where: whereFilter }),
      prisma.marketplaceListings.findMany({
        where: whereFilter,
        skip,
        take,
        include: { product: true },
        orderBy: { createdAt: 'desc' }
      }),
    ]);

    const totalPages = Math.ceil(total / take);

    return NextResponse.json(
      {
        data: listings,
        meta: { total, perPage: take, currentPage: pageParam, totalPages }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching marketplace listings by category:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings", detail: error.message },
      { status: 500 }
    );
  }
}
