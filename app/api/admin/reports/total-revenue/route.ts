import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


const getTotalRevenue = async (req: NextApiRequest, res: NextApiResponse) => {
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
    // const totalRevenue = await prisma.order.aggregate({
    //   _sum: {
    //     totalPrice: true,
    //   },
    //   where: {
    //     createdAt: {
    //       gte: startDate ? new Date(startDate as string) : undefined,
    //       lte: endDate ? new Date(endDate as string) : undefined,
    //     },
    //   },
    // });

    // const revenue = totalRevenue._sum.totalPrice || 0;

    res.status(200).json({ totalRevenue: "revenue" });
  } catch (error) {
    console.error("Error fetching total revenue:", error);
    NextResponse.json({ error: "Failed to fetch total revenue" });
  }
};

export default getTotalRevenue;
