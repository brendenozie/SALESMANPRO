import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";
import { OrderStatus } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = 1, limit = 5, status = 'all', search = '', companyId = '' } = req.query;

  const currentPage = parseInt(page as string, 10) || 1;
  const itemsPerPage = parseInt(limit as string, 10) || 5;

  const skip = (currentPage - 1) * itemsPerPage;
  const take = itemsPerPage;

  if (req.method === "GET") {
    try {
      const where: any = {
        companyId
            // AND: [
            //  status !== 'all' ? { status: status as OrderStatus } : {},
            //   search ? { client: { name: { contains: search as string, mode: 'insensitive' } } } : {},
              // companyId
            // ],
          };

      const products = await prisma.product.findMany({
        where,
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
