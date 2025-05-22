import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function GET( req : Request ) {
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed. Use GET." });
  }

  const { clientId } = req.query;
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
  

  // Validate clientId
  if (!clientId || typeof clientId !== "string") {
    return NextResponse.json({ message: "Invalid or missing clientId." });
  }

  try {
    // Fetch client inventory and related product data
    const clientInventory = await prisma.clientInventory.findMany({
      where: { clientId },
      include: {
        inventoryItem: {
          include: {
            product: {
              include :{
                productCategory:true
              }
            }, // Include product details
          },
        },
        salesAgent: true, // Include sales agent details
      },
    });

    // Map client inventory to structure the response
    const inventoryDetails = clientInventory.map((item) => ({
      clientInventoryId: item.id,
      product:item.inventoryItem.product,
      productId: item.inventoryItem.productId,
      productName: item.inventoryItem.product?.name || "Unknown Product",
      quantityPurchased: item.quantity,
      salesAgentId: item.salesAgent.id,
      salesAgentName: item.salesAgent.name,
      category :  item.inventoryItem.product.category,
          subCategory:  item.inventoryItem.product.subCategory,
          tags    :  item.inventoryItem.product.tags,
          brand       :  item.inventoryItem.product.brand,
    }));

    // Respond with structured data
    return res.status(200).json({
      clientId,
      inventory: inventoryDetails,
    });
  } catch (error: any) {
    console.error("Error fetching client inventory:", error);

    return NextResponse.json({
      message: "An error occurred while fetching client inventory.",
      error: error.message || "Unknown error",
    });
  }
}
