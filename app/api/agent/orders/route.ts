typescript
// app/api/admin/agents/[id]/orders/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getOrders(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";
  const agentId = params.id;

  const skip = (page - 1) * limit;

  try {
    // Aggregate totals
    const [totalOrders, totalRevenue, pendingRevenueFromLogs, completedRevenue, pendingRequests] =
      await Promise.all([
        prisma.agentInventoryLog.count({
          where: { agentInventory: { salesAgentId: agentId } },
        }),
        prisma.clientInventoryLog.aggregate({
          where: { salesAgentId: agentId, action: "ASSIGNED" },
          _sum: { totalPrice: true },
        }),
        prisma.clientInventoryLog.aggregate({
          where: { salesAgentId: agentId, action: "allocated", status: "pending" },
          _sum: { totalPrice: true },
        }),
        prisma.clientInventoryLog.aggregate({
          where: { salesAgentId: agentId, action: "allocated", status: "completed" },
          _sum: { totalPrice: true },
        }),
        prisma.request.aggregate({
          where: { salesAgentId: agentId, status: "PENDING" },
          _sum: { totalPrice: true },
        }),
      ]);

    const totalPendingRevenue =
      (pendingRevenueFromLogs._sum.totalPrice || 0) +
      (pendingRequests._sum.totalPrice || 0);

    // Fetch orders with pagination
    const orders = await prisma.clientInventoryLog.findMany({
      where: {
        salesAgentId: agentId,
        action: "allocated",
        ...(status !== "all" ? { status } : {}),
        ...(search
          ? {
              inventoryItem: {
                product: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            }
          : {}),
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        inventoryItem: { include: { product: true } },
        client: true,
      },
    });

    // Monthly revenue grouped
    const monthlyRevenue = await prisma.clientInventoryLog.groupBy({
      by: ["createdAt"],
      where: { salesAgentId: agentId, action: "allocated" },
      _sum: { totalPrice: true },
    });

    const monthlyRevenueFormatted = monthlyRevenue.map((entry) => ({
      month: new Date(entry.createdAt).toLocaleString("default", { month: "long" }),
      year: new Date(entry.createdAt).getFullYear(),
      revenue: entry._sum.totalPrice || 0,
    }));

    return formatResponse(
      true,
      {
        orders,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        pendingRevenue: totalPendingRevenue,
        completedRevenue: completedRevenue._sum.totalPrice || 0,
        monthlyRevenue: monthlyRevenueFormatted,
      },
      "Orders fetched successfully",
      200
    );
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export const GET = withApiHandler(getOrders);

