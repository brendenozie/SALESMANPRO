// ts
// app/api/salesAgent/revenue/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(async (req: Request) => {

  const { searchParams } = new URL(req.url);
  const salesAgentId = searchParams.get("salesAgentId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (!salesAgentId) {
    return formatResponse(false, null, "salesAgentId is required", 400);
  }

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(false, null, "Invalid pagination parameters", 400);
  }

  try {
    // Parse date range
    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date();

    if (start > end) {
      return formatResponse(
        false,
        null,
        "Invalid date range: startDate cannot be after endDate.",
        400
      );
    }

    // Aggregate revenue data
    const revenueData = await prisma.customerOrder.groupBy({
      by: ["createdAt"],
      where: {
        consumerId:salesAgentId,
        createdAt: { gte: start, lte: end },
      },
      _sum: { totalPrice: true },
      orderBy: { createdAt: "asc" },
    });

    const formattedRevenue = revenueData.map((entry) => ({
      date: entry.createdAt?.toISOString().split("T")[0],
      revenue: entry._sum.totalPrice || 0,
    }));

    return formatResponse(true, {
      salesAgentId,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      revenue: formattedRevenue,
    });
  } catch (error: any) {
    console.error("Error calculating revenue:", error);
    return formatResponse(false, null, error.message || "Failed to calculate revenue.", 500);
  }
});

