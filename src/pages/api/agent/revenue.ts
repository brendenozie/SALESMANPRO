import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

const getSalesAgentRevenue = async (req: NextApiRequest, res: NextApiResponse) => {
  const { salesAgentId, startDate, endDate } = req.query;

  if (!salesAgentId) {
    return res.status(400).json({ error: "salesAgentId is required" });
  }

  try {
    // Parse date range
    const start = startDate ? new Date(startDate as string) : new Date('2000-01-01'); // Default start date
    const end = endDate ? new Date(endDate as string) : new Date(); // Default to today

    // Validate dates
    if (start > end) {
      return res.status(400).json({ error: "Invalid date range: startDate cannot be after endDate." });
    }

    // Aggregate revenue over the specified period
    // const revenueData = await prisma.order.groupBy({
    //   by: ["createdAt"],
    //   where: {
    //     salesAgentId: salesAgentId as string,
    //     createdAt: { gte: start, lte: end },
    //   },
    //   _sum: {
    //     totalPrice: true,
    //   },
    //   orderBy: { createdAt: "asc" },
    // });

    // // Format response: Group by day, month, or any desired time interval
    // const formattedRevenue = revenueData.map((entry) => ({
    //   date: entry.createdAt.toISOString().split("T")[0], // Format date as YYYY-MM-DD
    //   revenue: entry._sum.totalPrice || 0,
    // }));

    // res.status(200).json({
    //   salesAgentId,
    //   startDate: start.toISOString().split("T")[0],
    //   endDate: end.toISOString().split("T")[0],
    //   revenue: formattedRevenue,
    // });
  } catch (error) {
    console.error("Error calculating revenue:", error);
    res.status(500).json({ error: "Failed to calculate revenue." });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      await getSalesAgentRevenue(req, res);
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
