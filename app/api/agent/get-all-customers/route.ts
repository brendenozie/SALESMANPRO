import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../server/db/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Agent ID is required and must be a string." });
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
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
