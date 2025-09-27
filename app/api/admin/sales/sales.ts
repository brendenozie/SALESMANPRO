// app/api/admin/reports/sales/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getSales(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  try {
    const { searchParams } = req.nextUrl;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return formatResponse(false, null, "Invalid pagination parameters.", 400);
    }

    // Example placeholder — adjust your relations accordingly
    const sales = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
        salesAgentId: agentId || undefined,
      },
      include: {
        product: true,
        client: true,
        salesAgent: true,
      },
      skip: offset,
      take: limit,
    });

    const formattedSales = sales.map((sale) => ({
      id: sale.id,
      productName: sale.product?.name || "Unknown",
      category: sale.product?.category || "N/A",
      quantity: sale.quantity,
      price: sale.product?.price,
      totalAmount: sale.totalPrice,
      region: sale.client?.name || "N/A",
      salesAgent: sale.salesAgent?.user?.name || "Unknown Agent",
      date: sale.createdAt.toISOString(),
    }));

    return formatResponse(true, formattedSales, "Sales data fetched successfully");
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return formatResponse(false, null, "Failed to fetch sales data", 500);
  }
}

// ✅ Wrap handler with withApiHandler for consistency
export const GET = withApiHandler(getSales);
