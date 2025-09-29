import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { formatResponse } from "@/lib/formatResponse";
import { request } from "http";


export default async function GET( req : Request ) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed. Use GET." });
  }

  const { salesAgentId } = req.query;



  // Validate salesAgentId
  if (!salesAgentId || typeof salesAgentId !== "string") {
    return NextResponse.json({ message: "Invalid or missing salesAgentId." });
  }

  try {
    // Fetch agent inventory and related product data
    const agentInventory = await prisma.agentInventory.findMany({
      where: { salesAgentId },
      include: {
        inventoryItem: {
          include: {
            product: true, // Include product details
          },
        },
      },
    });

    // Fetch client inventory related to the sales agent
    const clientInventory = await prisma.clientInventory.findMany({
      where: { salesAgentId },
      include: {
        inventoryItem: {
          include: {
            product: true, // Include product details
          },
        },
        client: true, // Include client details
      },
    });

    // Map client inventory to calculate sales details
    const salesDetails = clientInventory.map((item) => ({
      clientId: item.client.id,
      clientName: item.client.name,
      productId: item.inventoryItem.productId,
      productName: item.inventoryItem.product?.name || "Unknown Product",
      quantitySold: item.quantity,
    }));

    // Map agent inventory to include remaining stock and total sales
    const inventoryDetails = agentInventory.map((item) => {
      const productId = item.inventoryItem.productId;

      // Calculate total sold for this product
      const totalSold = salesDetails
        .filter((sale) => sale.productId === productId)
        .reduce((sum, sale) => sum + sale.quantitySold, 0);

        console.log(item);

      return {
        agentInventoryId: item.id,
        inventoryItemId: item.inventoryItem.id, // Company inventory ID
        productId,
        product: item.inventoryItem.product,
        productName: item.inventoryItem.product?.name || "Unknown Product",
        totalAssignedStock: item.quantity,
        totalSold,
        remainingStock: Math.max(item.quantity, 0),
      };
    });

    // Respond with structured data
    return res.status(200).json({
      salesAgentId,
      inventory: inventoryDetails,
      sales: salesDetails,
    });
  } catch (error: any) {
    console.error("Error fetching inventory:", error);

    return NextResponse.json({
      message: "An error occurred while fetching inventory.",
      error: error.message || "Unknown error",
    });
  }
}
