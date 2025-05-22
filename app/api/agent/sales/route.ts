import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      // Parse query parameters
      // const { startDate, endDate, salesAgentId } = req.query;

      // // Filter sales based on query parameters
      // const sales = await prisma.order.findMany({
      //   where: {
      //     createdAt: {
      //       gte: startDate ? new Date(startDate as string) : undefined,
      //       lte: endDate ? new Date(endDate as string) : undefined,
      //     },
      //     salesAgentId: salesAgentId ? String(salesAgentId) : undefined, // Filter by sales agent ID

      //   },
      //   include: {
      //     product: true,
      //     client: true,
      //     salesAgent: true,
      //   },
      // });

      // // Format data for the frontend
      // const formattedSales = sales.map((sale) => ({
      //   id: sale.id,
      //   productName: sale.product.name,
      //   category: sale.product.category || "N/A",
      //   quantity: sale.quantity,
      //   price: sale.product.price,
      //   totalAmount: sale.totalPrice,
      //   region: sale.client.name,
      //   date: sale.createdAt.toISOString(),
      //   salesAgent: sale.salesAgent ? sale.salesAgent.name : "Unknown",
      // }));

      // console.log(formattedSales);

      // return res.status(200).json(formattedSales);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
