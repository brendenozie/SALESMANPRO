import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        // orders: {
        //   select: {
        //     totalPrice: true, // Assuming 'totalPrice' exists in your 'Order' model
        //     createdAt: true,
        //   },
        //   orderBy: {
        //     createdAt: "desc", // Sort orders by most recent
        //   },
        //   take: 1, // Fetch only the most recent order
        // },
        communications: {
          select: {
            createdAt: true, // Date of last communication
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get the most recent communication
        },
      },
    });

    // Process each client to include calculated or derived values
    const processedClients = clients.map((client) => {
      const recentOrder = {totalPrice:0,createdAt:""};//client.orders[0]; // Get the most recent order
      const recentCommunication = client.communications[0]; // Get the most recent communication

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phoneNumber: client.phoneNumber,
        // Calculate total sales by summing all orders (if needed)
        totalSales: recentOrder?.totalPrice || 0, // Replace with aggregation if needed
        // Set recentTransactionAmount and recentTransactionDate
        recentTransactionAmount: recentOrder?.totalPrice || 0,
        recentTransactionDate: recentOrder?.createdAt || null,
        // Derive status (default to 'active' if no communication is present)
        status: recentCommunication ? "engaged" : "inactive",
      };
    });

    res.status(200).json(processedClients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
