import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


const getOrdersByStatus = async (req: Request) => {
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
    NextResponse.json({ error: "Failed to fetch orders by status" });
  }
};

export default getOrdersByStatus;
