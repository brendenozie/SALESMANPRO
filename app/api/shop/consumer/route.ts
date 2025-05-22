import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../server/db/prismadb";
import { OrderStatus } from "@prisma/client";

const getOrders = async (req: NextApiRequest, res: NextApiResponse) => {
  // Updated query parameter to consumerId to match the new model
  const { page = 1, limit = 5, status = 'all', search = '', consumerId } = req.query;

  const currentPage = parseInt(page as string, 10) || 1;
  const itemsPerPage = parseInt(limit as string, 10) || 5;

  const skip = (currentPage - 1) * itemsPerPage;
  const take = itemsPerPage;

  try {
    // Updated the "where" clause to use consumerId and the consumer relation for searching by name
    const where: any = {
      AND: [
        consumerId ? { consumerId: consumerId as string } : {},
        status !== 'all' ? { status: status as OrderStatus } : {},
        search ? { consumer: { name: { contains: search as string, mode: 'insensitive' } } } : {},
      ],
    };

    // Use the updated CustomerOrder model and include consumer details and order items
    const [orders, totalOrders] = await prisma.$transaction([
      prisma.customerOrder.findMany({
        where,
        include: {
          consumer: true,
          items: {
            include: {
              marketplaceListing: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customerOrder.count({ where }),
    ]);

    // Update aggregate queries to reference consumerId and the CustomerOrder model
    const totalRevenue = await prisma.customerOrder.aggregate({
      _sum: { totalPrice: true },
      where: { consumerId: consumerId as string },
    });

    const pendingRevenue = await prisma.customerOrder.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'PENDING', consumerId: consumerId as string },
    });

    const completedRevenue = await prisma.customerOrder.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'COMPLETED', consumerId: consumerId as string },
    });

    // Monthly revenue calculation based on the updated model
    const ordersForMonthlyRevenue = await prisma.customerOrder.findMany({
      select: { createdAt: true, totalPrice: true },
      where: { consumerId: consumerId as string },
    });

    const monthlyRevenue = Array(12).fill(0);
    ordersForMonthlyRevenue.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      monthlyRevenue[month] += order.totalPrice;
    });

    const allOrders = {
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / itemsPerPage),
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      pendingRevenue: pendingRevenue._sum.totalPrice || 0,
      completedRevenue: completedRevenue._sum.totalPrice || 0,
      monthlyRevenue,
    };

    console.log('Fetched orders for consumerId:', consumerId, allOrders);
    res.status(200).json(allOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      await getOrders(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
