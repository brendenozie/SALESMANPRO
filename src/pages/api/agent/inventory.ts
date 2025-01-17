import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed. Use GET." });
  }

  const { salesAgentId } = req.query;

  // Validate salesAgentId
  if (!salesAgentId || typeof salesAgentId !== "string") {
    return res.status(400).json({ message: "Invalid or missing salesAgentId." });
  }

  try {
    // Fetch inventory assigned to the sales agent
    const inventory = await prisma.agentInventory.findMany({
      where: { salesAgentId },
      include: {
        inventoryItem: {
          include: {
            product: true, // Include product details for inventory items
          },
        },
        salesAgent: true, // Include sales agent details
      },
    });

    // Fetch client inventory related to this sales agent
    const clientInventory = await prisma.clientInventory.findMany({
      where: { salesAgentId },
      include: {
        product: true, // Include product details for client inventory
        client: true,  // Include client details
      },
    });

    // Map sales data using clientInventory
    const salesDetails = clientInventory
      .filter((item) => item.product && item.client) // Exclude null relations
      .map((item) => ({
        clientId: item.client.id,
        clientName: item.client.name,
        productId: item.product.id,
        productName: item.product.name,
        quantitySold: item.quantity,
      }));

    // Map inventory details to include remaining stock and company inventory ID
    const inventoryDetails = inventory.map((item) => {
      const relatedSales = salesDetails.filter(
        (sale) => sale.productId === item.inventoryItem.productId
      );
      const totalSold = relatedSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
      const remainingStock = Math.max(item.quantity - totalSold, 0); // Avoid negative stock

      return {
        agentInventoryItemId: item.id,
        companyInventoryId: item.inventoryItem.id, // Add company's inventory ID
        productId: item.inventoryItem.productId,
        product: item.inventoryItem.product,
        productName: item.inventoryItem.product?.name || "Unknown Product",
        totalAssignedStock: item.quantity,
        totalSold,
        remainingStock,
      };
    });

    // Send success response with structured data
    return res.status(200).json({
      salesAgentId,
      inventory: inventoryDetails,
      sales: salesDetails,
    });
  } catch (error:any) {
    console.error("Error fetching inventory:", error);

    return res.status(500).json({
      message: "An error occurred while fetching inventory.",
      error: error.message || "Unknown error",
    });
  }
}
