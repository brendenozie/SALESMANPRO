import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

import prisma from "@/server/db/prismadb";
import { OrderStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";

// Define the expected structure for route parameters (empty for a collection route)
type RouteParams = { params: {} };

// ... (keep your existing imports)

async function handleGetSellerOrders(req: Request, { params }: RouteParams) {
  const { searchParams } = new URL(req.url);
    // 1. Parsing & Validation
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const companyId = searchParams.get("companyId");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "PENDING";
    const skip = (page - 1) * limit;

    if (!companyId)
      return formatResponse(false, null, "companyId required", 400);

    // 2. Unique Cache Key (Crucial for pagination/search)
    const cacheKey = `admin:orders:${companyId}:p_${page}:l_${limit}:s_${search}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

  const orderWhereFilter: Prisma.CustomerOrderWhereInput = {
    status: (status as OrderStatus) || "PENDING",
    items: {
      some: {
        marketplaceListing: { companyId: companyId },
      },
    },
  };

  try {
    const [orders, totalOrders] = await prisma.$transaction([
      prisma.customerOrder.findMany({
        where: orderWhereFilter,
        include: {
          items: {
            where: { marketplaceListing: { companyId: companyId } },
            include: { marketplaceListing: true },
          },
        },
        // IMPORTANT: Ensure shippingAddress is in your Prisma Schema 
        // to include lat/lng for the frontend to use.
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customerOrder.count({ where: orderWhereFilter }),
    ]);

    // Flattening Logic: The frontend needs "Items" that know their "Order" location
    const flattenedItems = orders.flatMap(order => 
      order.items.map(item => ({
        ...item,
        orderId: order.id,
        // We attach the parent order's delivery info to each item
        deliveryLat: (order.shippingAddress as any)?.lat,
        deliveryLng: (order.shippingAddress as any)?.lng,
        deliveryAddress: (order.shippingAddress as any)?.addressLine1 || "No Address Provided",
        customerName: (order as any).customerName || "Guest Customer",
      }))
    );

    const responseData = {
      items: flattenedItems, // The frontend prefers a list of items to bundle
      pagination: {
        totalItems: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
      },
    };

    return formatResponse(true, responseData, "Items fetched", 200);
  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}

// Wrap the core logic with the API handler middleware.
export const GET = withApiHandler(handleGetSellerOrders);
