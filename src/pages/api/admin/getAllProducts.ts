import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const products = await prisma.product.findMany({
        include: {
          productCategory: true,
          inventoryItems: {
            include: {
              AgentInventory: true,
            },
          },
          // orders: true,
          CommissionRate: true, // Include commission rate data
        },
      });

      const formattedProducts = products.map((product) => {
        const inventoryId = product.inventoryItems.map((item) => item.id);

        // Calculate company stock
        const companyStock = product.inventoryItems.reduce((sum, item) => sum + item.quantity, 0);

        // Calculate agent stock
        const agentStock = product.inventoryItems.reduce((sum, item) => {
          const agentStockSum = item.AgentInventory.reduce((agentSum, agentItem) => agentSum + agentItem.quantity, 0);
          return sum + agentStockSum;
        }, 0);

        // Extract commission details
        const commissionRate = product.CommissionRate?.commissionRate || 0;
        const commissionType = product.CommissionRate?.commissionType || "COST";

        return {
          id: product.id,
          name: product.name,
          companyId: product.companyId,
          inventoryId: inventoryId,
          category: product.productCategory?.name || "Uncategorized",
          companyStock,
          agentStock,
          costPrice: product.costPrice,
          salesPrice: product.salesPrice,
          commissionRate,
          commissionType,
          product
        };
      });

      return res.status(200).json(formattedProducts);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
