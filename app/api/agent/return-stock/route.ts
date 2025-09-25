import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { NextApiRequest, NextApiResponse } from "next";


// POST return stock from an agent
export async function returnStock(req: NextApiRequest, res: NextApiResponse) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  if (req.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" });
  }

  const { productId, agentId, quantity, isDamaged } = req.body;

  try {
    // const agentInventory = await prisma.agentInventory.findFirst({
    //   where: { productId, salesAgentId: agentId },
    // });

    // if (!agentInventory || agentInventory.quantity < quantity) {
    //   return NextResponse.json({ message: "Insufficient agent stock" });
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
    NextResponse.json({ message: "Internal server error" });
  }
}