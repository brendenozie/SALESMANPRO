import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

const getSalesAgentRevenue = async (req: NextApiRequest, res: NextApiResponse) => {
  const { startDate, endDate } = req.query;

  try {
    const salesAgentRevenue = await prisma.salesAgent.findMany({
      select: {
        id: true,
        name: true,
        // orders: {
        //   where: {
        //     createdAt: {
        //       gte: startDate ? new Date(startDate as string) : undefined,
        //       lte: endDate ? new Date(endDate as string) : undefined,
        //     },
        //   },
        //   select: {
        //     totalPrice: true,
        //   },
        // },
      },
    });

    const revenueData = salesAgentRevenue.map((agent) => ({
      id: agent.id,
      name: agent.name,
      // totalRevenue: agent.orders.reduce((sum, order) => sum + order.totalPrice, 0),
      // totalOrders: agent.orders.length,
    }));

    res.status(200).json(revenueData);
  } catch (error) {
    console.error("Error fetching sales agent revenue:", error);
    res.status(500).json({ error: "Failed to fetch sales agent revenue" });
  }
};

export default getSalesAgentRevenue;
