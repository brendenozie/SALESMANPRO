import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET /api/trending?agentId=&limit=&days=&weightViews=&weightPurchases=&weightFavorites=
export async function GET(req: Request) {
  try {
    
       const auth = await verifyAuth(req);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const weightViews = parseFloat(searchParams.get("weightViews") || "1");
    const weightPurchases = parseFloat(searchParams.get("weightPurchases") || "2");
    const weightFavorites = parseFloat(searchParams.get("weightFavorites") || "1.5");

    if (isNaN(limit) || limit < 1 || isNaN(days) || days < 1) {
      return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
    }

    // Optional filter by agent/company
    const whereFilter: any = {};
    if (agentId) whereFilter.companyId = agentId;

    // Fetch metrics (optionally could filter by recent metrics if timestamped)
    const metrics = await prisma.productMetrics.findMany({
      where: whereFilter,
      include: { product: true },
    });

    // Calculate trending score
    const trending = metrics.map((m) => {
      const score =
        (m.views || 0) * weightViews +
        (m.purchases || 0) * weightPurchases +
        (m.favorites || 0) * weightFavorites;
      return {
        product: m.product,
        views: m.views,
        purchases: m.purchases,
        favorites: m.favorites,
        score,
      };
    });

    // Sort descending by score
    trending.sort((a, b) => b.score - a.score);

    // Return top N
    const top = trending.slice(0, limit);

    return NextResponse.json(
      { data: top, meta: { limit, weights: { views: weightViews, purchases: weightPurchases, favorites: weightFavorites } } },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error fetching trending products:", err);
    return NextResponse.json({ error: "Internal Server Error", detail: err.message }, { status: 500 });
  }
}