import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed

import { OrderStatus } from "@prisma/client";

const getOrders = async (req: NextApiRequest, res: NextApiResponse) => {
  const { page = 1, limit = 5, status = 'all', search = '', salesAgentId } = req.query;
  const { searchParams } = new URL(req.url);
  
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
  
    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return NextResponse.json(
        { message: "Invalid pagination parameters." },
        { status: 400 }
      );
    }
  

  const currentPage = parseInt(page as string, 10) || 1;
  const itemsPerPage = parseInt(limit as string, 10) || 5;

  const skip = (currentPage - 1) * itemsPerPage;
  const take = itemsPerPage;

  try {
    const where: any = {
      AND: [
        salesAgentId ? { salesAgentId: salesAgentId as string } : {},
        status !== 'all' ? { status: status as OrderStatus } : {},
        search ? { client: { name: { contains: search as string, mode: 'insensitive' } } } : {},
      ],
    };

    // const [orders, totalOrders] = await prisma.$transaction([
    //   prisma.order.findMany({
    //     where,
    //     include: {
    //       client: true,
    //       salesAgent: true,
    //       product: true,
    //     },
    //     skip,
    //     take,
    //     orderBy: { createdAt: 'desc' },
    //   }),
    //   prisma.order.count({ where }),
    // ]);

    // const totalRevenue = await prisma.order.aggregate({
    //   _sum: { totalPrice: true },
    //   where: { salesAgentId: salesAgentId as string },
    // });

    // const pendingRevenue = await prisma.order.aggregate({
    //   _sum: { totalPrice: true },
    //   where: { status: 'PENDING', salesAgentId: salesAgentId as string },
    // });

    // const completedRevenue = await prisma.order.aggregate({
    //   _sum: { totalPrice: true },
    //   where: { status: 'COMPLETED', salesAgentId: salesAgentId as string },
    // });

    // // Monthly revenue calculation
    // const ordersForMonthlyRevenue = await prisma.order.findMany({
    //   select: { createdAt: true, totalPrice: true },
    //   where: { salesAgentId: salesAgentId as string },
    // });

    // const monthlyRevenue = Array(12).fill(0);
    
    // ordersForMonthlyRevenue.forEach((order) => {
    //   const month = new Date(order.createdAt).getMonth();
    //   monthlyRevenue[month] += order.totalPrice;
    // });

    // const allOrders = {
    //   orders,
    //   totalOrders,
    //   totalPages: Math.ceil(totalOrders / itemsPerPage),
    //   totalRevenue: totalRevenue._sum.totalPrice || 0,
    //   pendingRevenue: pendingRevenue._sum.totalPrice || 0,
    //   completedRevenue: completedRevenue._sum.totalPrice || 0,
    //   monthlyRevenue,
    // };

    // console.log('Fetched orders for salesAgentId:', salesAgentId, allOrders);

    res.status(200).json("allOrders");
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
