import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

import { formatResponse } from "@/lib/formatResponse";
import { request } from "http";

// GET /api/site/productsByFlag?agentId=&flag=&page=&limit=&sortBy=&order=
export async function GET(req: Request) {
  try {
    
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const flag = searchParams.get("flag") || "";

    // Pagination params
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "25", 10);
    if (isNaN(pageParam) || pageParam < 1 || isNaN(limitParam) || limitParam < 1) {
      return NextResponse.json({ error: "Invalid pagination parameters." }, { status: 400 });
    }
    const skip = (pageParam - 1) * limitParam;
    const take = limitParam;

    // Sorting params
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const orderParam = (searchParams.get("order") || "desc").toLowerCase();
    const order = orderParam === "asc" ? "asc" : "desc";

    // Build where filter
    const whereFilter: any = {};
    if (flag) whereFilter[flag] = true;
    if (agentId) whereFilter.companyId = agentId;

    // Fetch data and count in parallel
    const [total, listings] = await Promise.all([
      prisma.marketplaceListings.count({ where: whereFilter }),
      prisma.marketplaceListings.findMany({
        where: whereFilter,
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
    ]);

    const totalPages = Math.ceil(total / take);

    return NextResponse.json(
      {
        data: listings,
        meta: {
          total,
          perPage: take,
          currentPage: pageParam,
          totalPages,
          sortBy,
          order,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching marketplace listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings", detail: error.message },
      { status: 500 }
    );
  }
}
