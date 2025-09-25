import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    
       const auth = await verifyAuth(req);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    if (req.method === "GET") {
      // Parse query parameters
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


      // Filter sales based on query parameters
      // const sales = await prisma.order.findMany({
      //   where: {
      //     createdAt: {
      //       gte: startDate ? new Date(startDate as string) : undefined,
      //       lte: endDate ? new Date(endDate as string) : undefined,
      //     },
      //   },
      //   include: {
      //     product: true,
      //     client: true,
      //     salesAgent: true,
      //   },
      // });

      // Format data for the frontend
      // const formattedSales = sales.map((sale) => ({
      //   id: sale.id,
      //   productName: sale.product.name,
      //   category: sale.product.category || "N/A",
      //   quantity: sale.quantity,
      //   price: sale.product.price,
      //   totalAmount: sale.totalPrice,
      //   region: sale.client.name,
      //   date: sale.createdAt.toISOString(),
      // }));

      // console.log(formattedSales);

      return res.status(200).json("formattedSales");
    } else {
      return NextResponse.json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
