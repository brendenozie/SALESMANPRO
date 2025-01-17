import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

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
        ClientInventory: {
          select: {
            inventoryItem: {
              select: {
                product: {
                  select: { name: true, price: true },
                },
              },
            },
            quantity: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
        communications: {
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    // Process each client to include calculated or derived values
    const processedClients = clients.map((client) => {
      // Total sales calculation based on ClientInventory
      const totalSales = client.ClientInventory.reduce((sum, inventory) => {
        const productPrice = inventory.inventoryItem.product.price;
        return sum + inventory.quantity * productPrice;
      }, 0);

      // Most recent transaction
      const recentInventory = client.ClientInventory[0];
      const recentTransactionDate = recentInventory?.updatedAt || null;

      const recentTransactionAmount = recentInventory
        ? recentInventory.quantity * (recentInventory.inventoryItem.product.price || 0)
        : 0;

      // Client engagement status
      const recentCommunication = client.communications[0];
      const status = recentCommunication ? "engaged" : "inactive";

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phoneNumber: client.phoneNumber,
        totalSales,
        recentTransactionAmount,
        recentTransactionDate,
        status,
      };
    });

    res.status(200).json(processedClients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
