import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { formatResponse } from "@/lib/formatResponse";
import { NextApiRequest, NextApiResponse } from "next";


const getOrders = async (req: NextApiRequest, res: NextApiResponse) => {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { page = 1, limit = 10, status = 'all', search = '', agentId } = req.query;

  const currentPage = parseInt(page as string, 10) || 1;
  const itemsPerPage = parseInt(limit as string, 10) || 5;

  const skip = (currentPage - 1) * itemsPerPage;
  const take = itemsPerPage;

  try {
  
  // Fetch total orders, revenues, and pending requests
  const [totalOrders, totalRevenue, pendingRevenueFromLogs, completedRevenue, pendingRequests] =
    await Promise.all([
      prisma.agentInventoryLog.count({
        where: { agentInventory: { salesAgentId: agentId as string } },
      }),
      prisma.clientInventoryLog.aggregate({
        where: {
          salesAgentId: agentId as string,
          action: "ASSIGNED",
        },
        _sum: { totalPrice: true },
      }),
      prisma.clientInventoryLog.aggregate({
        where: {
          salesAgentId: agentId as string,
          action: "allocated",
          status: "pending",
        },
        _sum: { totalPrice: true },
      }),
      prisma.clientInventoryLog.aggregate({
        where: {
          salesAgentId: agentId as string,
          action: "allocated",
          status: "completed",
        },
        _sum: { totalPrice: true },
      }),
      prisma.request.aggregate({
        where: {
          salesAgentId: agentId as string,
          status: "PENDING",
        },
        _sum: { totalPrice: true },
      }),
    ]);

  // Combine pending revenues from logs and requests
  const totalPendingRevenue =
    (pendingRevenueFromLogs._sum.totalPrice || 0) +
    (pendingRequests._sum.totalPrice || 0);

  // Fetch orders with pagination
  const orders = await prisma.clientInventoryLog.findMany({
    where: {
      salesAgentId: agentId as string,
      action: "allocated",
    },
    skip,
    take: itemsPerPage,
    orderBy: { createdAt: "desc" },
  });

  // Monthly revenue grouped by months
  const monthlyRevenue = await prisma.clientInventoryLog.groupBy({
    by: ["createdAt"],
    where: {
      salesAgentId: agentId as string,
      action: "allocated",
    },
    _sum: { totalPrice: true },
  });

  // Format monthly revenue
  const monthlyRevenueFormatted = monthlyRevenue.map((entry) => ({
    month: new Date(entry.createdAt).toLocaleString("default", {
      month: "long",
    }),
    year: new Date(entry.createdAt).getFullYear(),
    revenue: entry._sum.totalPrice || 0,
  }));

  const allOrders = {
    orders,
    totalOrders,
    totalPages: Math.ceil(totalOrders / itemsPerPage),
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    pendingRevenue: totalPendingRevenue,
    completedRevenue: completedRevenue._sum.totalPrice || 0,
    monthlyRevenue: monthlyRevenueFormatted,
  };

    res.status(200).json(allOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    NextResponse.json({ error: 'Failed to fetch orders' });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      await getOrders(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET']);
      NextResponse.end(`Method ${req.method} Not Allowed`);
  }
}
