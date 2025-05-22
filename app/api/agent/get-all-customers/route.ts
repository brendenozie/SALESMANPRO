import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { id } = req.query;
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


    if (!id || typeof id !== "string") {
      return NextResponse.json({ message: "Agent ID is required and must be a string." });
    }

    try {
      // Fetch clients for the specific agent
      const clients = await prisma.client.findMany({
        where: {
          salesAgentId: id,
        },
        // include: {
        //   orders: {
        //     include: {
        //       product: true, // Optionally include product details for each order
        //     },
        //   },
        // },
      });

      // Format client data with optional order details
      const formattedClients = clients.map((client) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phoneNumber: client.phoneNumber,
        totalOrders: 100,//client.orders.length,
        // orderDetails: client.orders.map((order) => ({
        //   orderId: order.id,
        //   productName: order.product.name,
        //   quantity: order.quantity,
        //   totalPrice: order.totalPrice,
        // })),
      }));

      return res.status(200).json(formattedClients);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Internal server error" });
    }
  } else {
    return NextResponse.json({ message: "Method not allowed" });
  }
}
