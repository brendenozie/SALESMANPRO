// // app/api/admin/reports/sales/route.ts
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getSales(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const offset = (page - 1) * limit;

  // Validate required params
  if (!companyId) {
    return formatResponse(
      false,
      null,
      "Missing required query parameter: companyId.",
      400,
    );
  }

  if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
    return formatResponse(
      false,
      null,
      "Invalid pagination parameters. 'limit' and 'page' must be positive integers.",
      400,
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const orders = await prisma.customerOrder.findMany({
      where: {
        companyId: companyId,
        createdAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
        status: { not: "CANCELLED" }, // Only count valid sales
      },
      include: {
        items: {
          include: {
            product: true,
            marketplaceListing: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Flattening orders into "Sale" records for the UI
    const formattedSales = orders.flatMap((order) => {
      return order.items.map((item) => ({
        id: item.id,
        orderId: order.id,
        productName:
          item.product?.name ||
          item.marketplaceListing?.name ||
          "Unknown Product",
        category: (item.product as any)?.category || "General",
        quantity: item.quantity,
        price: item.price,
        totalAmount: item.quantity * item.price,
        // Using shippingAddress JSON to extract region/city if available
        region: (order.shippingAddress as any)?.city || "N/A",
        date: order.createdAt?.toISOString() || new Date().toISOString(),
      }));
    });

    return formatResponse(true, formattedSales, "Success");
  } catch (error) {
    console.error("Sales Fetch Error:", error);
    return formatResponse(false, null, "Failed to fetch sales", 500);
  }
}

export const GET = withApiHandler(getSales);

// import prisma from "@/server/db/prismadb";
// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { cacheGet, cacheSet } from "@/lib/cache";

// async function getSales(req: Request) {

//   try {
//     const { searchParams } = req.url ? new URL(req.url) : { searchParams: new URLSearchParams() };
//     const startDate = searchParams.get("startDate");
//     const endDate = searchParams.get("endDate");
//     const agentId = searchParams.get("agentId");
//     const companyId = searchParams.get("companyId");
//     const limit = parseInt(searchParams.get("limit") || "10", 10);
//     const offset = parseInt(searchParams.get("offset") || "0", 10);

//     if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
//       return formatResponse(false, null, "Invalid pagination parameters.", 400);
//     }

//     const cacheKey = `admin:sales:${companyId || 'all'}:${startDate || 'start'}:${endDate || 'end'}:limit${limit}:offset${offset}`;

//     try {
//       const cached = await cacheGet(cacheKey);
//       if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
//     } catch (e) {}

//     // Example placeholder — adjust your relations accordingly
//     const sales = await prisma.customerOrder.findMany({
//       where: {
//         createdAt: {
//           gte: startDate ? new Date(startDate) : undefined,
//           lte: endDate ? new Date(endDate) : undefined,
//         },
//         companyId: companyId ? companyId : undefined,
//       },
//       include: {
//         items: { include: { marketplaceListing: true } },
//       },
//       skip: offset,
//       take: limit,
//     });

//     const formattedSales = sales.map((sale) => {
//       const firstItem = sale.items && sale.items.length > 0 ? sale.items[0] : null;
//       return {
//         id: sale.id,
//         productName: firstItem?.marketplaceListing?.name || "Unknown",
//         category: firstItem?.marketplaceListing?.category || "N/A",
//         quantity: firstItem?.quantity ??  0,
//         price: firstItem?.marketplaceListing?.finalPrice ?? null,
//         totalAmount: sale.totalPrice,
//         region: "N/A",
//         salesAgent:  "Unknown Agent", //sale.salesAgent?.user?.name ||
//         date: sale.createdAt?.toISOString() || null,
//       };
//     });

//     try {
//       await cacheSet(cacheKey, formattedSales, 60);
//     } catch (e) {}

//     return formatResponse(true, formattedSales, "Sales data fetched successfully");
//   } catch (error) {
//     console.error("Error fetching sales data:", error);
//     return formatResponse(false, null, "Failed to fetch sales data", 500);
//   }
// }

// // ✅ Wrap handler with withApiHandler for consistency
// export const GET = withApiHandler(getSales);
