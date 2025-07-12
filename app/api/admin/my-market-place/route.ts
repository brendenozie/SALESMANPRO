// app/api/marketplace-list/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const companyId = searchParams.get("companyId");
  const limit     = parseInt(searchParams.get("limit")  || "10", 10);
  const page      = parseInt(searchParams.get("page")   || "1", 10);
  const offset    = (page - 1) * limit;

  // Validate inputs
  if (!companyId) {
    return NextResponse.json(
      { message: "Missing required query parameter: companyId." },
      { status: 400 }
    );
  }
  if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters. 'limit' and 'page' must be positive integers." },
      { status: 400 }
    );
  }

  try {
    // 1. Total count for pagination UI
    const total = await prisma.marketplaceListing.count({
      where: { companyId },
    });

    // 2. Fetch the paginated slice
    const listings = await prisma.marketplaceListing.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },  // newest first
      skip: offset,
      take: limit,
      include: {
        productCategory: true,
        // you can include other relations here if needed
      },
    });

    // 3. Build pagination meta
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      meta: {
        companyId,
        totalItems: total,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
      results: listings,
    });
  } catch (error: any) {
    console.error("Error fetching marketplace listings:", error);
    return NextResponse.json(
      {
        message: "An error occurred while fetching marketplace listings.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
