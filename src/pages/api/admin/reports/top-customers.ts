import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

const getTopCustomers = async (req: NextApiRequest, res: NextApiResponse) => {
  const { startDate, endDate } = req.query;

  try {
    const customers = await prisma.client.findMany({
      include: {
        orders: {
          where: {
            createdAt: {
              gte: startDate ? new Date(startDate as string) : undefined,
              lte: endDate ? new Date(endDate as string) : undefined,
            },
          },
          select: {
            totalPrice: true,
          },
        },
      },
    });

    const customerData = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      totalRevenue: customer.orders.reduce((sum, order) => sum + order.totalPrice, 0),
    }));

    customerData.sort((a, b) => b.totalRevenue - a.totalRevenue); // Sort by revenue in descending order

    res.status(200).json(customerData);
  } catch (error) {
    console.error("Error fetching top customers:", error);
    res.status(500).json({ error: "Failed to fetch top customers" });
  }
};

export default getTopCustomers;
