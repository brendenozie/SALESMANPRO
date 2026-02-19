// app/api/admin/reports/sales/route.ts

import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet } from "@/lib/cache";

async function getSales(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  try {
    const { searchParams } = req.url ? new URL(req.url) : { searchParams: new URLSearchParams() };
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return formatResponse(false, null, "Invalid pagination parameters.", 400);
    }

    const cacheKey = `admin:sales:${agentId || 'all'}:${startDate || 'start'}:${endDate || 'end'}:limit${limit}:offset${offset}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}
    
    // Example placeholder — adjust your relations accordingly
    const sales = await prisma.customerOrder.findMany({
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
        consumerId: agentId || undefined,
      },
      include: {
        items: { include: { marketplaceListing: true } },
      },
      skip: offset,
      take: limit,
    });

    const formattedSales = sales.map((sale) => {
      const firstItem = sale.items && sale.items.length > 0 ? sale.items[0] : null;
      return {
        id: sale.id,
        productName: firstItem?.marketplaceListing?.name || "Unknown",
        category: firstItem?.marketplaceListing?.category || "N/A",
        quantity: firstItem?.quantity ??  0,
        price: firstItem?.marketplaceListing?.finalPrice ?? null,
        totalAmount: sale.totalPrice,
        region: "N/A",
        salesAgent:  "Unknown Agent", //sale.salesAgent?.user?.name ||
        date: sale.createdAt?.toISOString() || null,
      };
    });

    try {
      await cacheSet(cacheKey, formattedSales, 60);
    } catch (e) {}

    return formatResponse(true, formattedSales, "Sales data fetched successfully");
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return formatResponse(false, null, "Failed to fetch sales data", 500);
  }
}

// ✅ Wrap handler with withApiHandler for consistency
export const GET = withApiHandler(getSales);
