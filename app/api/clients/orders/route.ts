import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";
import { OrderStatus } from "@prisma/client";

/**
 * API route to fetch aggregated order data and individual order items
 * for a seller's company dashboard. Supports pagination and searching.
 */
export const GET = withApiHandler(async (req: Request) => {
  // 1. Authentication
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  // 2. Extract query parameters
  const { searchParams } = new URL(req.url);

  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const companyId = searchParams.get("companyId");
  const search = searchParams.get("search") || "";

  const itemsPerPage = limit;
  const currentPage = page > 0 ? page : 1;
  const skip = (currentPage - 1) * itemsPerPage;

  if (isNaN(limit) || isNaN(page) || limit <= 0 || page < 1) {
    return formatResponse(
      false,
      null,
      "Invalid pagination parameters (limit or page).",
      400
    );
  }

  if (!companyId) {
    return formatResponse(false, null, "companyId is required.", 400);
  }

  // 3. Filtering
  const whereFilter: any = {
    marketplaceListing: {
      companyId,
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    },
  };

  // 4. Fetch order items + count
  const [orderItems, totalOrderItems] = await prisma.$transaction([
    prisma.orderItem.findMany({
      where: whereFilter,
      include: {
        marketplaceListing: true,
        order: {
          select: {
            status: true,
            createdAt: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
      skip,
      take: itemsPerPage,
      orderBy: { order: { createdAt: "desc" } },
    }),
    prisma.orderItem.count({ where: whereFilter }),
  ]);

  // 5. Revenue aggregates
  const commonRevenueWhere = { marketplaceListing: { companyId } };

  const totalRevenueAgg = await prisma.orderItem.aggregate({
    _sum: { price: true },
    where: commonRevenueWhere,
  });

  const pendingRevenueAgg = await prisma.orderItem.aggregate({
    _sum: { price: true },
    where: { ...commonRevenueWhere, order: { status: OrderStatus.PENDING } },
  });

  const completedRevenueAgg = await prisma.orderItem.aggregate({
    _sum: { price: true },
    where: { ...commonRevenueWhere, order: { status: OrderStatus.COMPLETED } },
  });

  // 6. Monthly revenue
  const orderItemsForMonthly = await prisma.orderItem.findMany({
    select: { order: { select: { createdAt: true } }, price: true },
    where: commonRevenueWhere,
  });

  const monthlyRevenue = Array(12).fill(0);
  orderItemsForMonthly.forEach((item) => {
    const month = new Date(item.order.createdAt).getMonth(); // 0–11
    monthlyRevenue[month] += item.price;
  });

  // 7. Return response
  return formatResponse(
    true,
    {
      orderItems,
      totalOrderItems,
      totalPages: Math.ceil(totalOrderItems / itemsPerPage),
      currentPage,
      totalRevenue: totalRevenueAgg._sum.price || 0,
      pendingRevenue: pendingRevenueAgg._sum.price || 0,
      completedRevenue: completedRevenueAgg._sum.price || 0,
      monthlyRevenue,
    },
    "Seller order dashboard data fetched successfully.",
    200
  );
});
