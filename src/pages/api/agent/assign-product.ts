import { NextApiRequest, NextApiResponse } from 'next';
import prisma, { client } from "@/server/db/prismadb";
import { CommissionType, PrismaClient } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { agentInventoryId, clientId, quantity, salesPrice } = req.body;

  // Enhanced validation
  if (!agentInventoryId || typeof agentInventoryId !== 'string' || 
      !clientId || typeof clientId !== 'string' || 
      !quantity || quantity <= 0 || !Number.isInteger(quantity) || 
      (salesPrice && typeof salesPrice !== 'number')) {
    return res.status(400).json({ error: "Invalid input data. Please verify all fields." });
  }

  try {
    const transaction = await prisma.$transaction(async (prisma) => {
      const agentInventory = await prisma.agentInventory.findUnique({
        where: { id: agentInventoryId },
        include: {
          inventoryItem: { include: { product: true } },
          salesAgent: true,
        },
      });

      if (!agentInventory) throw new Error("Agent inventory item not found.");
      if (agentInventory.quantity < quantity) throw new Error("Insufficient stock.");

      await prisma.agentInventory.update({
        where: { id: agentInventoryId },
        data: { quantity: { decrement: quantity } },
      });

      const clientInventory = await prisma.clientInventory.upsert({
        where: {
          clientId_inventoryItemId: { clientId, inventoryItemId: agentInventory.inventoryItemId },
        },
        update: { quantity: { increment: quantity } },
        create: {
          clientId, inventoryItemId: agentInventory.inventoryItemId, 
          agentInventoryId, salesAgentId: agentInventory.salesAgentId, quantity,
        },
      });

      const product = agentInventory.inventoryItem.product;
      const commissions = [];
      const productCommissions = await prisma.commission.findMany({ where: { productId: product.id } });

      for (const pc of productCommissions) {
        const { commissionRate = 0, basedOn } = pc;
        const finalPrice = salesPrice || product.price;
        const commissionEarned = basedOn === "COST" ? commissionRate * product.price * quantity : commissionRate * finalPrice * quantity;

        if (commissionEarned > 0) {
          commissions.push(await prisma.commission.create({
            data: {
              salesAgentId: agentInventory.salesAgentId,
              productId: product.id,
              commissionRate,
              commissionEarned,
              basedOn,
            },
          }));
        }
      }

      await prisma.agentInventoryLog.create({
        data: {
          agentInventoryId, action: "assigned-to-client", clientId, quantity,
        },
      });

      await prisma.clientInventoryLog.create({
        data: {
          clientInventoryId: clientInventory.id, 
          action: "assigned", 
          salesAgentId: agentInventory.salesAgentId, quantity,
          price : agentInventory.inventoryItem.product.price, 
          totalPrice : agentInventory.inventoryItem.product.price * quantity,
          status : "assigned"
        },
      });

      return { clientInventory, commissions };
    });

    res.status(200).json({
      message: "Product successfully assigned to client.",
      clientInventory: transaction.clientInventory,
      commissions: transaction.commissions,
    });
  } catch (error: any) {
    console.error("Error:", error.message || error);
    res.status(500).json({ error: error.message || "An error occurred." });
  }
}
