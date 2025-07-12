import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed


const getSalesAgentRevenue = async (req: NextApiRequest, res: NextApiResponse) => {
  const { startDate, endDate } = req.query;
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
    NextResponse.json({ error: "Failed to fetch sales agent revenue" });
  }
};

export default getSalesAgentRevenue;
