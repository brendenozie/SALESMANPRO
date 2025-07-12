import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { OrderStatus } from "@prisma/client";

export async function GET( req : Request ) {

  // const { page = 1, limit = 5, status = 'all', search = '', companyId = '' } = req.query;
  const { searchParams } = new URL(req.url);

  const agentId = searchParams.get("agentId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const page = parseInt(searchParams.get("offset") || "0", 10);
  const status = searchParams.get("status") || "0";
  const search = searchParams.get("offset") || "0";
  const companyId = searchParams.get("companyId") || "";

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }

  const currentPage = page;
  const itemsPerPage = limit;

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

      console.log(products);

      // const formattedProducts = products.map((product) => {
      //   const inventoryId = product.inventoryItems.map((item) => item.id);

      //   // Calculate company stock
      //   const companyStock = product.inventoryItems.reduce((sum, item) => sum + item.quantity, 0);

      //   // Calculate agent stock
      //   const agentStock = product.inventoryItems.reduce((sum, item) => {
      //     const agentStockSum = item.AgentInventory.reduce((agentSum, agentItem) => agentSum + agentItem.quantity, 0);
      //     return sum + agentStockSum;
      //   }, 0);

      //   // Extract commission details
      //   const commissionRate = product.CommissionRate?.commissionRate || 0;
      //   const commissionType = product.CommissionRate?.commissionType || "COST";

      //   return {
      //     id: product.id,
      //     name: product.name,
      //     companyId: product.companyId,
      //     inventoryId: inventoryId,
      //     category: product.productCategory?.name || "Uncategorized",
      //     companyStock,
      //     agentStock,
      //     costPrice: product.costPrice,
      //     salesPrice: product.salesPrice,
      //     commissionRate,
      //     commissionType,
      //     product
      //   };
      // });

      return NextResponse.json(products);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Internal server error" });
    }
  } else {
    return NextResponse.json({ message: "Method not allowed" });
  }
}
