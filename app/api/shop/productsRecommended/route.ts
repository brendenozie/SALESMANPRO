import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// GET /api/recommendations?userId=&agentId=&limit=&offset=
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    if (isNaN(limit) || limit < 1 || isNaN(offset) || offset < 0) {
      return NextResponse.json({ error: "Invalid pagination parameters." }, { status: 400 });
    }

    // Fetch recent interactions
    const recent = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: { product: true },
    });

    const interactedProductIds = recent.map(i => i.productId);
    const categories = recent.map(i => i.product?.productCategoryId).filter(Boolean) as string[];
    const tags = recent.flatMap(i => i.product?.tags || []);

    // Recommendations
    const recommendations = await prisma.marketplaceListings.findMany({
      where: {
        ...(agentId && { companyId: agentId }),
        OR: [
          ...(categories.length ? [{ productCategoryId: { in: categories } }] : []),
          ...(tags.length ? [{ tags: { hasSome: tags } }] : []),
        ],
        NOT: { id: { in: interactedProductIds } },
      },
      take: limit,
      skip: 0,
    });

    return NextResponse.json(
      { data: recommendations, meta: { interactedCount: recent.length, recommendationCount: recommendations.length } },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error fetching recommendations:", err);
    return NextResponse.json({ error: "Failed to fetch recommendations", detail: err.message }, { status: 500 });
  }
}
