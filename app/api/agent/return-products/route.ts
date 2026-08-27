// ts
// app/api/returnProductToAgent/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const POST = withApiHandler(async (req: Request) => {

  try {
    const { agentId, clientId, inventoryItemId, quantity } = await req.json();

    if (!agentId || !clientId || !inventoryItemId || !quantity) {
      return formatResponse(false, null, "Missing required fields.", 400);
    }

    // Retrieve client's inventory
    const clientInventory = await prisma.clientInventory.findUnique({
      where: { clientId_inventoryItemId: { clientId, inventoryItemId } },
    });

    if (!clientInventory || clientInventory.quantity < quantity) {
      return formatResponse(
        false,
        null,
        "Insufficient quantity in the client's inventory for return.",
        400
      );
    }

    // Retrieve agent's inventory
    let agentInventory = await prisma.agentInventory.findFirst({
      where: {
         salesAgentId: agentId,
         inventoryItemId
      },
    });

    if (!agentInventory) {
      // Create a new inventory entry for the agent if it doesn't exist
      agentInventory = await prisma.agentInventory.create({
        data: {
          inventoryItemId,
          salesAgentId: agentId,
          quantity: 0,
        },
      });
    }

    // Update client's inventory (decrement)
    await prisma.clientInventory.update({
      where: { id: clientInventory.id },
      data: { quantity: { decrement: quantity } },
    });

    // Update agent's inventory (increment)
    await prisma.agentInventory.update({
      where: { id: agentInventory.id },
      data: { quantity: { increment: quantity } },
    });

    // TODO: Reverse commission + logs if needed (currently commented out in your version)

    return formatResponse(true, null, "Product returned successfully.", 200);
  } catch (error: any) {
    console.error("Error processing product return:", error);
    return formatResponse(
      false,
      null,
      error.message || "An error occurred while processing the return.",
      500
    );
  }
});

