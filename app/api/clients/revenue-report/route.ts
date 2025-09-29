// app/api/reports/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { OrderStatus } from "@prisma/client"; // if used in reports

/**
 * API route to fetch various financial and sales reports based on the 'reportType' query parameter.
 */
async function GET(req: Request) {
  // 1. Authentication Check
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  // 2. Extract and Validate Parameters
  const { searchParams } = new URL(req.url);

  const reportType = searchParams.get("reportType");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(
      false,
      null,
      "Invalid pagination parameters (limit or offset).",
      400
    );
  }

  if (!reportType) {
    return formatResponse(
      false,
      null,
      "Missing required query parameter: reportType.",
      400
    );
  }

  try {
    let data;

    switch (reportType) {
      case "total-revenue":
        data = await prisma.customerOrder.aggregate({
          _sum: { totalPrice: true },
        });
        break;

      case "revenue-by-product":
        data = await prisma.customerOrder.groupBy({
          by: ["productId"],
          _sum: { totalPrice: true },
        });
        break;

      case "revenue-by-sales-agent":
        data = await prisma.customerOrder.groupBy({
          by: ["salesAgentId"],
          _sum: { totalPrice: true },
        });
        break;

      case "revenue-by-client":
        data = await prisma.customerOrder.groupBy({
          by: ["clientId"],
          _sum: { totalPrice: true },
        });
        break;

      case "monthly-revenue":
        const ordersForMonthly = await prisma.customerOrder.findMany({
          select: { createdAt: true, totalPrice: true },
          orderBy: { createdAt: "asc" },
        });

        const monthlyRevenue = Array(12).fill(0);
        ordersForMonthly.forEach((order) => {
          const month = new Date(order.createdAt).getMonth();
          monthlyRevenue[month] += order.totalPrice;
        });
        data = { monthlyRevenue };
        break;

      case "revenue-vs-target":
        const targetAgg = await prisma.target.aggregate({
          _sum: { targetValue: true },
        });
        const actualRevenueAgg = await prisma.customerOrder.aggregate({
          _sum: { totalPrice: true },
        });
        const targetRevenue = targetAgg._sum.targetValue ?? 0;
        const actualRevenue = actualRevenueAgg._sum.totalPrice ?? 0;

        data = {
          targetRevenue,
          actualRevenue,
          percentageAchieved: targetRevenue
            ? (actualRevenue / targetRevenue) * 100
            : 0,
        };
        break;

      case "commission-based-revenue":
        data = await prisma.commission.groupBy({
          by: ["salesAgentId"],
          _sum: { commissionEarned: true },
        });
        break;

      case "revenue-by-order-status":
        data = await prisma.customerOrder.groupBy({
          by: ["status"],
          _sum: { totalPrice: true },
        });
        break;

      default:
        return formatResponse(
          false,
          null,
          `Invalid report type: ${reportType}.`,
          400
        );
    }

    return formatResponse(
      true,
      { reportType, data },
      `Financial report generated successfully for type: ${reportType}.`,
      200
    );
  } catch (error: any) {
    console.error(`❌ Error fetching report '${reportType}':`, error);
    return formatResponse(
      false,
      null,
      error.message ||
        `An error occurred while fetching the report for ${reportType}.`,
      500
    );
  }
}

// Wrap withApiHandler
export const GETHandler = withApiHandler(GET);
export { GETHandler as GET };
