import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


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

        return {
          id: product.id,
          name: product.name,
          companyId: product.companyId,
          inventoryId: inventoryId,
          category: product.productCategory?.name || "Uncategorized",
          companyStock,
          agentStock,
          salesPrice: product.salesPrice,
        };
      });

      return res.status(200).json(formattedProducts);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Internal server error" });
    }
  } else {
    return NextResponse.json({ message: "Method not allowed" });
  }
}
