import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../server/db/prismadb";
import { OrderStatus } from "@prisma/client";

const getSellerOrderItems = async (req: NextApiRequest, res: NextApiResponse) => {
  const { page = 1, limit = 5, search = '', sellerId ='63f7c9e2d91b1b2a5e80b007' } = req.query;
  const currentPage = parseInt(page as string, 10) || 1;
  const itemsPerPage = parseInt(limit as string, 10) || 5;
  const skip = (currentPage - 1) * itemsPerPage;
  const take = itemsPerPage;

  if (!sellerId) {
    return res.status(400).json({ error: "sellerId is required" });
  }

  try {
    // Build the where filter: always match the sellerId on the marketplace listing.
    // If a search term is provided, filter on the listing title.
    const whereFilter: any = {
      marketplaceListing: {
        sellerId: sellerId as string,
        ...(search ? { title: { contains: search as string, mode: 'insensitive' } } : {})
      }
    };

    // Fetch paginated order items and count total order items in a transaction.
    const [orderItems, totalOrderItems] = await prisma.$transaction([
      prisma.orderItem.findMany({
        where: whereFilter,
        include: {
          order: {
            include: { consumer: true }
          },
          marketplaceListing: true,
        },
        skip,
        take,
        // Order by the order's creation date (latest first)
        orderBy: { order: { createdAt: 'desc' } }
      }),
      prisma.orderItem.count({ where: whereFilter }),
    ]);

    // Aggregate revenue data assuming orderItem.price reflects the total price for that item.
    const totalRevenueAgg = await prisma.orderItem.aggregate({
      _sum: { price: true },
      where: {
        marketplaceListing: { sellerId: sellerId as string },
      },
    });

    const pendingRevenueAgg = await prisma.orderItem.aggregate({
      _sum: { price: true },
      where: {
        marketplaceListing: { sellerId: sellerId as string },
        order: { status: OrderStatus.PENDING }
      },
    });

    const completedRevenueAgg = await prisma.orderItem.aggregate({
      _sum: { price: true },
      where: {
        marketplaceListing: { sellerId: sellerId as string },
        order: { status: OrderStatus.COMPLETED }
      },
    });

    // Calculate monthly revenue using the order's createdAt date.
    // This query fetches order items (and their order's creation date) for the seller.
    const orderItemsForMonthly = await prisma.orderItem.findMany({
      select: { 
        order: { select: { createdAt: true } },
        price: true
      },
      where: {
        marketplaceListing: { sellerId: sellerId as string },
      }
    });
    const monthlyRevenue = Array(12).fill(0);
    orderItemsForMonthly.forEach(item => {
      const month = new Date(item.order.createdAt).getMonth();
      monthlyRevenue[month] += item.price;
    });

    const responseData = {
      orderItems,
      totalOrderItems,
      totalPages: Math.ceil(totalOrderItems / itemsPerPage),
      totalRevenue: totalRevenueAgg._sum.price || 0,
      pendingRevenue: pendingRevenueAgg._sum.price || 0,
      completedRevenue: completedRevenueAgg._sum.price || 0,
      monthlyRevenue,
    };

    console.log('Fetched order items for sellerId:', sellerId, responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch(req.method) {
    case 'GET':
      await getSellerOrderItems(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
