// app/api/orders/route.ts
import prisma from "@/server/db/prismadb";
import type { OrderStatus } from "@prisma/client";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyAuth } from "@/lib/verifyAuth";


async function getOrders(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);

    const { searchParams } = new URL(req.url);
    const consumerId = searchParams.get("consumerId");
    const statusParam = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const agentId = searchParams.get("agentId");

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return formatResponse(false, null, "Invalid pagination parameters", 400);
    }
    const skip = (page - 1) * limit;

    // Build where filter
    const where: any = {};
    if (consumerId) where.consumerId = consumerId;
    if (agentId) where.salesAgentId = agentId;
    if (statusParam !== "all") where.status = statusParam as OrderStatus;
    if (search) {
      where.consumer = {
        name: { contains: search, mode: "insensitive" },
      };
    }

    // Fetch paginated orders and count
    const [orders, totalOrders] = await prisma.$transaction([
      prisma.customerOrder.findMany({
        where,
        include: {
          items: { include: { marketplaceListing: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customerOrder.count({ where }),
    ]);

    // Revenue aggregates
    const baseWhere = { ...(consumerId && { consumerId }) };
    const totalRev = await prisma.customerOrder.aggregate({
      _sum: { totalPrice: true },
      where: baseWhere,
    });
    const pendingRev = await prisma.customerOrder.aggregate({
      _sum: { totalPrice: true },
      where: { ...baseWhere, status: "PENDING" },
    });
    const completedRev = await prisma.customerOrder.aggregate({
      _sum: { totalPrice: true },
      where: { ...baseWhere, status: "COMPLETED" },
    });

    // Monthly revenue
    const allOrders = await prisma.customerOrder.findMany({
      where: baseWhere,
      select: { createdAt: true, totalPrice: true },
    });
    const monthlyRevenue = Array(12).fill(0);
    allOrders.forEach((o) => {
      const m = o.createdAt?.getMonth();
      if (m !== undefined) monthlyRevenue[m] += o.totalPrice || 0;
      
    });

    // Meta
    const totalPages = Math.ceil(totalOrders / limit);

    return formatResponse(true, {
      data: orders,
      meta: {
        totalOrders,
        perPage: limit,
        currentPage: page,
        totalPages,
        totalRevenue: totalRev._sum.totalPrice ?? 0,
        pendingRevenue: pendingRev._sum.totalPrice ?? 0,
        completedRevenue: completedRev._sum.totalPrice ?? 0,
        monthlyRevenue,
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return formatResponse(false, null, "Failed to fetch orders", 500);
  }
}

export const GET = withApiHandler(getOrders);
