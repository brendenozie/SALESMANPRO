import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed. Use GET." });
  }

  const { clientId } = req.query;

  // Validate clientId
  if (!clientId || typeof clientId !== "string") {
    return res.status(400).json({ message: "Invalid or missing clientId." });
  }

  try {
    // Fetch client inventory and related product data
    const clientInventory = await prisma.clientInventory.findMany({
      where: { clientId },
      include: {
        inventoryItem: {
          include: {
            product: true, // Include product details
          },
        },
        salesAgent: true, // Include sales agent details
      },
    });

    // Check if inventory exists
    if (clientInventory.length === 0) {
      return res.status(404).json({ message: "No inventory found for the given clientId." });
    }

    // Map client inventory to structure the response
    const inventoryDetails = clientInventory.map((item) => ({
      clientInventoryId: item.id,
      productId: item.inventoryItem.productId,
      productName: item.inventoryItem.product?.name || "Unknown Product",
      quantityPurchased: item.quantity,
      salesAgentId: item.salesAgent?.id || null,
      salesAgentName: item.salesAgent?.name || "Unknown Sales Agent",
    }));

    // Respond with structured data
    return res.status(200).json({
      clientId,
      inventory: inventoryDetails,
    });
  } catch (error: any) {
    console.error("Error fetching client inventory:", error);

    return res.status(500).json({
      message: "An error occurred while fetching client inventory.",
      error: error.message || "Unknown error",
    });
  }
}
