import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

const getTotalRevenue = async (req: NextApiRequest, res: NextApiResponse) => {
  const { startDate, endDate } = req.query;

  try {
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
    });

    const revenue = totalRevenue._sum.totalPrice || 0;

    res.status(200).json({ totalRevenue: revenue });
  } catch (error) {
    console.error("Error fetching total revenue:", error);
    res.status(500).json({ error: "Failed to fetch total revenue" });
  }
};

export default getTotalRevenue;
