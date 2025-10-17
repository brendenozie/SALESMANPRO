// app/api/post-inventory-agent/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function postInventory(req: Request) {

  try {
    const data = await req.json();

    // Validate required fields
    const { salesAgentId, inventoryItems } = data;
    if (!salesAgentId || !Array.isArray(inventoryItems)) {
      return formatResponse(false, null, "Invalid input data.", 400);
    }

    // Create inventory records
    const createdInventory = await Promise.all(
      inventoryItems.map(async (item: any) => {
        return prisma.agentInventory.create({
          data: {
            salesAgentId,
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity,
          },
        });
      })
    );

    return formatResponse(true, createdInventory, "Inventory posted successfully", 201);
  } catch (error) {
    console.error("Error posting inventory:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withApiHandler(postInventory);