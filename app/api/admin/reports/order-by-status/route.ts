import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../server/db/prismadb";

const getOrdersByStatus = async (req: NextApiRequest, res: NextApiResponse) => {
  const { startDate, endDate } = req.query;

  try {
    // const ordersByStatus = await prisma.order.groupBy({
    //   by: ["status"],
    //   where: {
    //     createdAt: {
    //       gte: startDate ? new Date(startDate as string) : undefined,
    //       lte: endDate ? new Date(endDate as string) : undefined,
    //     },
    //   },
    //   _count: {
    //     id: true,
    //   },
    // });

    res.status(200).json("ordersByStatus");
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    res.status(500).json({ error: "Failed to fetch orders by status" });
  }
};

export default getOrdersByStatus;
