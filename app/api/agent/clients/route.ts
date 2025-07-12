import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed


export default async function GET( req : Request ) {
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed" });
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
                  select: { name: true, salesPrice: true },
                },
              },
            },
            quantity: true,
            updatedAt: true,
            logs: {
              select: {
                price: true,
                totalPrice: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1, // Fetch the most recent log
            },
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
      // Calculate total sales from ClientInventoryLogs
      const totalSales = client.ClientInventory.reduce((sum, inventory) => {
        const mostRecentLog = inventory.logs[0]; // Fetch the most recent log
        return sum + (mostRecentLog?.totalPrice || 0); // Use totalPrice if available
      }, 0);

      // Most recent transaction details
      const recentInventory = client.ClientInventory[0];
      const recentLog = recentInventory?.logs[0]; // Most recent log
      const recentTransactionDate = recentLog?.createdAt || null;
      const recentTransactionAmount = recentLog?.totalPrice || 0;

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

    console.log("Processed clients:", processedClients);

    res.status(200).json(processedClients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    NextResponse.json({ error: "Internal server error" });
  }
}
