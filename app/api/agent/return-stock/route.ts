import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


// POST return stock from an agent
export async function returnStock(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { productId, agentId, quantity, isDamaged } = req.body;

  try {
    // const agentInventory = await prisma.agentInventory.findFirst({
    //   where: { productId, salesAgentId: agentId },
    // });

    // if (!agentInventory || agentInventory.quantity < quantity) {
    //   return res.status(400).json({ message: "Insufficient agent stock" });
    // }

    // // Deduct from agent stock
    // await prisma.agentInventory.update({
    //   where: { id: agentInventory.id },
    //   data: { quantity: agentInventory.quantity - quantity },
    // });

    // if (!isDamaged) {
    //   const inventoryItem = await prisma.inventoryItem.findFirst({
    //     where: { productId },
    //   });

    //   if (inventoryItem) {
    //     await prisma.inventoryItem.update({
    //       where: { id: inventoryItem.id },
    //       data: { quantity: inventoryItem.quantity + quantity },
    //     });
    //   }
    // }

    res.status(200).json({ message: "Stock returned successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}