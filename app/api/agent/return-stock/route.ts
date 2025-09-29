ts
// app/api/returnStock/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const POST = withApiHandler(async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  try {
    const { productId, agentId, quantity, isDamaged } = await req.json();

    if (!productId || !agentId || !quantity) {
      return formatResponse(false, null, "Missing required fields.", 400);
    }

    // Check agent's inventory
    const agentInventory = await prisma.agentInventory.findFirst({
      where: { productId, salesAgentId: agentId },
    });

    if (!agentInventory || agentInventory.quantity < quantity) {
      return formatResponse(false, null, "Insufficient agent stock.", 400);
    }

    // Deduct from agent stock
    await prisma.agentInventory.update({
      where: { id: agentInventory.id },
      data: { quantity: agentInventory.quantity - quantity },
    });

    // Return to company stock if not damaged
    if (!isDamaged) {
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: { productId },
      });

      if (inventoryItem) {
        await prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: inventoryItem.quantity + quantity },
        });
      }
    }

    return formatResponse(true, null, "Stock returned successfully.", 200);
  } catch (error: any) {
    console.error("Error returning stock:", error);
    return formatResponse(
      false,
      null,
      error.message || "Internal server error",
      500
    );
  }
});

