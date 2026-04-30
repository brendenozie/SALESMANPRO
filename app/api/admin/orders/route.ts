import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

import prisma from "@/server/db/prismadb";
import { OrderStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";

// Define the expected structure for route parameters (empty for a collection route)
type RouteParams = { params: {} };

// --- GET Handler Core Logic ---

async function handleGetSellerOrdersv1(req: Request, { params }: RouteParams) {
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
    return formatResponse(
      false,
      null,
      "Invalid pagination parameters. 'limit' and 'page' must be positive integers.",
      400,
    );
  }

  if (!companyId) {
    return formatResponse(
      false,
      null,
      "companyId is required to fetch seller orders.",
      400,
    );
  }

  // 1. Build the filter for order items associated with the company
  const whereFilter: Prisma.OrderItemWhereInput = {
    marketplaceListing: {
      companyId: companyId,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
  };

  // 2. Fetch Paginated Order Items and Total Count in a transaction

  const cacheKey = `admin:orders:${companyId || "global"}:all`;

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
            name: true,
            email: true,
            phone: true,
            // user: { select: { name: true, email: true } } // Include some user info
          },
        },
      },
      skip,
      take: itemsPerPage,
      orderBy: { order: { createdAt: "desc" } }, // Order by parent order creation date
    }),
    prisma.orderItem.count({ where: whereFilter }),
  ]);

  // 3. Calculate Revenue Aggregates
  const [
    totalRevenueAgg,
    pendingRevenueAgg,
    completedRevenueAgg,
    orderItemsForMonthly,
  ] = await prisma.$transaction([
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
    const month = new Date(item.order.createdAt || "").getMonth();
    monthlyRevenue[month] += item.price;
  });

  //cache

  try {
    if (orderItems) {
      await cacheSet(
        cacheKey,
        {
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
        },
        60,
      );
    }
  } catch (e) {}

  // 5. Return aggregated response
  return formatResponse(
    true,
    {
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
    },
    "Seller orders fetched successfully",
    200,
  );
}

async function handleGetSellerOrders(req: Request, { params }: RouteParams) {
  const { searchParams } = new URL(req.url);

  // 1. Parsing & Validation
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const companyId = searchParams.get("companyId");
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  if (!companyId) return formatResponse(false, null, "companyId required", 400);

  // 2. Unique Cache Key (Crucial for pagination/search)
  const cacheKey = `admin:orders:comp_${companyId}:p_${page}:l_${limit}:s_${search}`;
  
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  // 3. Define the Order Filter
  // We want Orders where at least one item belongs to this seller
  const orderWhereFilter: Prisma.CustomerOrderWhereInput = {
    items: {
      some: {
        marketplaceListing: {
          companyId: companyId,
          ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
        },
      },
    },
  };

  try {
    // 4. Execute Transaction
    const [orders, totalOrders, totalRev, pendingRev] =
      await prisma.$transaction([
        // Fetch the Orders
        prisma.customerOrder.findMany({
          where: orderWhereFilter,
          include: {
            items: {
              // Very Important: Filter the items INSIDE the order
              // so the seller doesn't see items from other companies in the same order
              where: {
                marketplaceListing: { companyId: companyId },
              },
              include: { marketplaceListing: true },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        // Count total orders for pagination
        prisma.customerOrder.count({ where: orderWhereFilter }),
        // Aggregate Revenue for this seller's items only
        prisma.orderItem.aggregate({
          _sum: { price: true },
          where: { marketplaceListing: { companyId } },
        }),
        prisma.orderItem.aggregate({
          _sum: { price: true },
          where: {
            marketplaceListing: { companyId },
            order: { status: "PENDING" },
          },
        }),
      ]);

    // 5. Monthly Revenue Logic (Optimized)
    // Fetch only what's needed for the chart
    const currentYear = new Date().getFullYear();
    const monthlyData = await prisma.orderItem.findMany({
      where: {
        marketplaceListing: { companyId },
        order: { createdAt: { gte: new Date(`${currentYear}-01-01`) } }
      },
      select: {
        price: true,
        order: { select: { createdAt: true } }
      }
    });

    const monthlyRevenue = Array(12).fill(0);
    monthlyData.forEach(item => {
      const month = new Date(item.order?.createdAt ?? new Date()).getMonth();
      monthlyRevenue[month] += item.price;
    });

    const responseData = {
      orders, // Now returns Array<{ id, status, orderItems: [] }>
      pagination: {
        totalItems: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
      },
      revenue: {
        total: totalRev._sum.price || 0,
        pending: pendingRev._sum.price || 0,
        monthly: monthlyRevenue,
      },
    };

    // 6. Cache and Return
    await cacheSet(cacheKey, responseData, 60);
    return formatResponse(true, responseData, "Orders fetched successfully", 200);

  } catch (error: any) {
    console.error(error);
    return formatResponse(false, null, error.message, 500);
  }
}

// Wrap the core logic with the API handler middleware.
export const GET = withApiHandler(handleGetSellerOrders);
