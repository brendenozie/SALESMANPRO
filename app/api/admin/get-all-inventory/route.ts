import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; 
import { OrderStatus } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ message: "Missing companyId" }, { status: 400 });
  }

  if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }

  const skip = (page - 1) * limit;

  try {
    const where: any = {
      companyId,
      AND: [],
    };

    if (status !== "all") {
      where.AND.push({ status: status as OrderStatus });
    }

    if (search) {
      where.AND.push({
        name: { contains: search, mode: "insensitive" },
      });
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        productCategory: true,
        inventoryItems: {
          include: {
            AgentInventory: true,
          },
        },
        CommissionRate: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedProducts = products.map((product) => {
      const inventoryId = product.inventoryItems.map((item) => item.id);
      const companyStock = product.inventoryItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const agentStock = product.inventoryItems.reduce((sum, item) => {
        return (
          sum +
          item.AgentInventory.reduce((agentSum, aItem) => agentSum + (aItem.quantity || 0), 0)
        );
      }, 0);

      const commissionRate = product.CommissionRate?.commissionRate || 0;
      const commissionType = product.CommissionRate?.commissionType || "COST";

      return {
        id: product.id,
        name: product.name,
        companyId: product.companyId!,
        inventoryId,
        category: product.productCategory?.name || "Uncategorized",
        companyStock,
        agentStock,
        costPrice: product.costPrice,
        salesPrice: product.salesPrice,
        commissionRate,
        commissionType,
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
