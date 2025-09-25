import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  if (req.method === "GET") {
    try {
      const agents = await prisma.salesAgent.findMany({
        include: {
          // orders: {
          //   include: {
          //     product: true,
          //   },
          // },
          clients: true, // Optional: Include clients if needed
        },
      });

      const formattedAgents = agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        // totalSales: agent.orders.reduce((sum, order) => sum + order.quantity, 0),
        // inventory: agent.orders.map((order) => ({
        //   productId: order.product.id,
        //   productName: order.product.name,
        //   quantity: order.quantity,
        // })),
      }));

      return res.status(200).json(formattedAgents);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Internal server error" });
    }
  } else {
    return NextResponse.json({ message: "Method not allowed" });
  }
}
