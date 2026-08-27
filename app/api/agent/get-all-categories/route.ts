
// app/api/admin/product-categories/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET product categories with pagination
async function getProductCategories(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  if (isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }

  try {
    const skip = page > 0 ? page * limit : 0;

    const [totalCount, categories] = await prisma.$transaction([
      prisma.productCategory.count(),
      prisma.productCategory.findMany({
        skip,
        take: limit,
      }),
    ]);

    const infoResponse = {
      count: totalCount ?? 0,
      next: skip + limit < totalCount ? page + 1 : null,
      pages: Math.ceil(totalCount / limit),
      prev: page > 0 ? page - 1 : null,
    };

    return formatResponse(
      true,
      { info: infoResponse, results: categories },
      "Product categories fetched successfully",
      200
    );
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withApiHandler(getProductCategories);
