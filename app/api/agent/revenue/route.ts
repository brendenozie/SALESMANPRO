import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed


const getSalesAgentRevenue = async (req: NextApiRequest, res: NextApiResponse) => {
  const { salesAgentId, startDate, endDate } = req.query;
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
  

  if (!salesAgentId) {
    return NextResponse.json({ error: "salesAgentId is required" });
  }

  try {
    // Parse date range
    const start = startDate ? new Date(startDate as string) : new Date('2000-01-01'); // Default start date
    const end = endDate ? new Date(endDate as string) : new Date(); // Default to today

    // Validate dates
    if (start > end) {
      return NextResponse.json({ error: "Invalid date range: startDate cannot be after endDate." });
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
    NextResponse.json({ error: "Failed to calculate revenue." });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      await getSalesAgentRevenue(req, res);
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      NextResponse.end(`Method ${req.method} Not Allowed`);
  }
}
