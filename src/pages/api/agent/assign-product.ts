// pages/api/assignProductToClient.ts

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/server/db/prismadb";

const ASSIGNED = 'assigned';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // if (req.method === 'POST') {
  //  const assignProductToClient = async (req, res) => {
  const { agentId, clientId, inventoryItemId, quantity } = req.body;

  if (!agentId || !clientId || !inventoryItemId || !quantity) {
    return res.status(400).json({ error: "Missing required fields.1"+agentId+"-2"+clientId+"-3"+inventoryItemId+"-4"+quantity+"" });
  }

  try {
    const agentInventory = await prisma.agentInventory.findUnique({
      where: { id: inventoryItemId },
      include: { inventoryItem: true, salesAgent: true },
    });

    if (!agentInventory) {
      return res.status(404).json({ error: "Agent inventory not found." });
    }

    if (agentInventory.quantity < quantity) {
      return res
        .status(400)
        .json({ error: "Insufficient quantity in agent inventory." });
    }

    // Update agent's inventory
    await prisma.agentInventory.update({
      where: { id: inventoryItemId },
      data: { quantity: { decrement: quantity } },
    });

    // Check if the client already has this product in inventory
    let clientInventory = await prisma.clientInventory.findUnique({
      where: { clientId_inventoryItemId: { clientId, inventoryItemId } },
    });

    if (clientInventory) {
      // Update the client's existing inventory
      await prisma.clientInventory.update({
        where: { id: clientInventory.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      // Create a new inventory entry for the client
      clientInventory = await prisma.clientInventory.create({
        data: {
          clientId,
          inventoryItemId,
          salesAgentId: agentId,
          agentInventoryId: inventoryItemId,
          quantity,
        },
      });
    }

    // Calculate commission
    const product = await prisma.product.findUnique({
      where: { id: agentInventory.inventoryItem.productId },
    });

    const commissionRate = 0.1; // 10% commission rate (adjust as needed)
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    const commissionEarned = product.price * quantity * commissionRate;

    await prisma.commission.create({
      data: {
        salesAgentId: agentId,
        productId: product.id,
        commissionRate,
        commissionEarned,
        basedOn: "COST",
        status: "PENDING",
      },
    });

    // Log the transaction
    await prisma.clientInventoryLog.create({
      data: {
        clientInventoryId: clientInventory.id,
        action: "allocated",
        salesAgentId: agentId,
        quantity,
        damaged: 0,
      },
    });

    await prisma.agentInventoryLog.create({
      data: {
        agentInventoryId: inventoryItemId,
        action: "client-allocation",
        clientId,
        quantity,
        damaged: 0,
      },
    });

    return res
      .status(200)
      .json({ message: "Product assigned successfully.", clientInventory });
  } catch (error) {
    console.error("Error assigning product:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while assigning the product." });
  }
};
