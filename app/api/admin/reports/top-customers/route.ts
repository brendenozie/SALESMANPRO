import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


const getTopCustomers = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const customers = await prisma.client.findMany({
      include: {
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

    const customerData = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      // totalRevenue: customer.orders.reduce((sum, order) => sum + order.totalPrice, 0),
    }));

    // customerData.sort((a, b) => b.totalRevenue - a.totalRevenue); // Sort by revenue in descending order

    res.status(200).json(customerData);
  } catch (error) {
    console.error("Error fetching top customers:", error);
    NextResponse.json({ error: "Failed to fetch top customers" });
  }
};

export default getTopCustomers;
