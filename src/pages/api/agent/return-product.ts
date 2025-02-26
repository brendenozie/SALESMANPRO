import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

// pages/api/returnProductToAgent.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 
  const { agentId, clientId, inventoryItemId, quantity } = req.body;

  if (!agentId || !clientId || !inventoryItemId || !quantity) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Retrieve client's inventory
    const clientInventory = await prisma.clientInventory.findUnique({
      where: { clientId_inventoryItemId: { clientId, inventoryItemId } },
    });

    if (!clientInventory || clientInventory.quantity < quantity) {
      return res.status(400).json({
        error: "Insufficient quantity in the client's inventory for return.",
      });
    }

    // Retrieve agent's inventory
    let agentInventory ;
    // await prisma.agentInventory.findUnique({
    //   // where: { inventoryItemId_salesAgentId: { inventoryItemId, salesAgentId: agentId } },
    // });

    if (!agentInventory) {
      // Create a new inventory entry for the agent if it doesn't exist
      agentInventory = await prisma.agentInventory.create({
        data: {
          inventoryItemId,
          salesAgentId: agentId,
          quantity: 0, // Start with 0 before incrementing
        },
      });
    }

    // Update client's inventory (decrease quantity)
    await prisma.clientInventory.update({
      where: { id: clientInventory.id },
      data: { quantity: { decrement: quantity } },
    });

    // Update agent's inventory (increase quantity)
    await prisma.agentInventory.update({
      where: { id: agentInventory.id },
      data: { quantity: { increment: quantity } },
    });

    // Reverse commission
    // const product = await prisma.product.findUnique({
    //   where: { id: agentInventory.inventoryItem.productId },
    // });

    // const commissionRate = 0.1; // 10% commission rate (adjust if necessary)
    // const reversedCommission = product.price * quantity * commissionRate;

    // await prisma.commission.create({
    //   data: {
    //     salesAgentId: agentId,
    //     productId: product.id,
    //     commissionRate,
    //     commissionEarned: -reversedCommission, // Negative value to reverse commission
    //     basedOn: "RETURN",
    //     status: "PENDING",
    //   },
    // });

    // Log the return transaction
    // await prisma.clientInventoryLog.create({
    //   data: {
    //     clientInventoryId: clientInventory.id,
    //     action: "returned",
    //     salesAgentId: agentId,
    //     quantity,
    //     damaged: 0,
    //   },
    // });

    // await prisma.agentInventoryLog.create({
    //   data: {
    //     agentInventoryId: agentInventory.id,
    //     action: "client-return",
    //     clientId,
    //     quantity,
    //     damaged: 0,
    //   },
    // });

    return res
      .status(200)
      .json({ message: "Product returned successfully." });
  } catch (error) {
    console.error("Error processing product return:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the return." });
  }
};
