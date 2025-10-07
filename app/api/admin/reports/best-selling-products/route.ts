// app/api/admin/reports/best-selling-products/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const getBestSellingProducts = async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(req.url);

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const companyId = searchParams.get("companyId");
  const limit = searchParams.get("limit") || "10";

  if (!startDate || !endDate) {
    return formatResponse(false, null, "startDate and endDate are required", 400);
  }

  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);
  endDateTime.setHours(23, 59, 59, 999); // Include full end day

  const whereClause: any = {
    createdAt: {
      gte: startDateTime,
      lte: endDateTime,
    },
  };

  // Filter OrderItems by companyId through CustomerOrder relation
  if (companyId) {
    whereClause.order = { companyId };
  }

  // Aggregate by marketplaceListingId
  const bestSellingProducts = await prisma.orderItem.groupBy({
    by: ["marketplaceListingId"],
    _sum: { quantity: true },
    where: whereClause,
    orderBy: { _sum: { quantity: "desc" } },
    take: parseInt(limit),
  });

  const listingIds = bestSellingProducts
    .map((item) => item.marketplaceListingId)
    .filter((id): id is string => typeof id === "string" && id !== null);

  const listings = await prisma.marketplaceListings.findMany({
    where: { id: { in: listingIds } },
    select: { id: true, name: true },
  });

  const listingMap = new Map(listings.map((l) => [l.id, l.name || "Unknown Product"]));

  const formattedProducts = bestSellingProducts.map((item) => ({
    name: listingMap.get(item?.marketplaceListingId || "") || "Unknown Product",
    totalSold: item._sum.quantity || 0,
  }));

  return formatResponse(true, formattedProducts, "Best-selling products fetched successfully", 200);
};

export const GET = withApiHandler(getBestSellingProducts);
