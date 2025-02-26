import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        totalSales: 0,//agent.orders.reduce((sum, order) => sum + order.quantity, 0),
        inventory: {},
        // agent.orders.map((order) => ({
        //   productId: order.product.id,
        //   productName: order.product.name,
        //   quantity: order.quantity,
        // })),
      }));

      return res.status(200).json(formattedAgents);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
