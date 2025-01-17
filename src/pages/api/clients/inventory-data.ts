import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const lowStockThreshold = 10; // Define your threshold here.

    const lowStockItems = await prisma.inventoryItem.count({
      where: { quantity: { lt: lowStockThreshold } },
    });

    res.status(200).json({ lowStock: lowStockItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
