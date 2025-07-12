import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed


export async function GET( req : Request ) {

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

      return NextResponse.json(formattedAgents,{status:200});
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Internal server error" },{status:400});
    }
  } else {
    return NextResponse.json({ message: "Method not allowed" },{status:400});
  }
}
