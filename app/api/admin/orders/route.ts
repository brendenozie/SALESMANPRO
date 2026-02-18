import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from "@/server/db/prismadb";
import { OrderStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";

// Define the expected structure for route parameters (empty for a collection route)
type RouteParams = { params: {} };

// --- GET Handler Core Logic ---

async function handleGetSellerOrders(req: Request, { params }: RouteParams) {
  const { searchParams } = new URL(req.url);

  // Parse and validate pagination parameters
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const companyId = searchParams.get("companyId");
  const search = searchParams.get("search") || "";

  const currentPage = page;
  const itemsPerPage = limit;
  const skip = (currentPage - 1) * itemsPerPage;

  if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
    return formatResponse(false, null, "Invalid pagination parameters. 'limit' and 'page' must be positive integers.", 400);
  }

  if (!companyId) {
    return formatResponse(false, null, "companyId is required to fetch seller orders.", 400);
  }

  // 1. Build the filter for order items associated with the company
  const whereFilter: Prisma.OrderItemWhereInput = {
    marketplaceListing: {
      companyId: companyId,
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {})
    }
  };

  // 2. Fetch Paginated Order Items and Total Count in a transaction
  
    const cacheKey = `admin:orders:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const [orderItems, totalOrderItems] = await prisma.$transaction([
    prisma.orderItem.findMany({
      where: whereFilter,
      include: {
        marketplaceListing: true,
        order: {
            select: {
                id: true,
                status: true,
                createdAt: true,
                // user: { select: { name: true, email: true } } // Include some user info
            }
        },
      },
      skip,
      take: itemsPerPage,
      orderBy: { order: { createdAt: 'desc' } }, // Order by parent order creation date
    }),
    prisma.orderItem.count({ where: whereFilter }),
  ]);

  try {
    if (orderItems) {
      await cacheSet(cacheKey, orderItems, 60);
    }
  } catch (e) {}

  // 3. Calculate Revenue Aggregates
  const [totalRevenueAgg, pendingRevenueAgg, completedRevenueAgg, orderItemsForMonthly] = await prisma.$transaction([
      prisma.orderItem.aggregate({
          _sum: { price: true },
          where: { marketplaceListing: { companyId } },
      }),
      prisma.orderItem.aggregate({
          _sum: { price: true },
          where: {
              marketplaceListing: { companyId },
              order: { status: OrderStatus.PENDING },
          },
      }),
      prisma.orderItem.aggregate({
          _sum: { price: true },
          where: {
              marketplaceListing: { companyId },
              order: { status: OrderStatus.COMPLETED },
          },
      }),
      prisma.orderItem.findMany({
          select: {
              order: { select: { createdAt: true } },
              price: true,
          },
          where: {
              marketplaceListing: { companyId },
          },
      }),
  ]);

  // 4. Calculate Monthly Revenue (Client-side aggregation logic)
  const monthlyRevenue = Array(12).fill(0);
  orderItemsForMonthly.forEach((item) => {
    // Assuming createdAt is in the current year context or is being compared
    const month = new Date(item.order.createdAt || '').getMonth();
    monthlyRevenue[month] += item.price;
  });


  // 5. Return aggregated response
  return formatResponse(true, {
    orderItems,
    pagination: {
      totalItems: totalOrderItems,
      totalPages: Math.ceil(totalOrderItems / itemsPerPage),
      currentPage: currentPage,
      itemsPerPage: itemsPerPage,
    },
    revenue: {
      total: totalRevenueAgg._sum.price || 0,
      pending: pendingRevenueAgg._sum.price || 0,
      completed: completedRevenueAgg._sum.price || 0,
      monthly: monthlyRevenue,
    },
  }, "Seller orders fetched successfully", 200);
}

// Wrap the core logic with the API handler middleware.
export const GET = withApiHandler(handleGetSellerOrders);
