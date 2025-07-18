import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { OrderStatus } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Parse and validate query params
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const status = (searchParams.get("status") || "all") as string;
  const search = searchParams.get("search") || "";
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ message: "Missing companyId" }, { status: 400 });
  }

  const skip = (page - 1) * limit;

  try {
    // Build filters
    const andFilters: any[] = [];
    if (status !== "all") {
      andFilters.push({ status: status as OrderStatus });
    }
    if (search) {
      andFilters.push({ name: { contains: search, mode: "insensitive" } });
    }

    // Fetch products with related data
    const products = await prisma.product.findMany({
      where: {
        companyId,
        AND: andFilters,
      },
      include: {
        productCategory: {
          include: { StoreCategory: true },
        },
        inventoryItems: {
          include: { AgentInventory: true },
        },
        CommissionRate: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Format the response
    const formatted = products.map((prod) => {
      // Compute stocks
      const companyStock = prod.inventoryItems.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );
      const agentStock = prod.inventoryItems.reduce(
        (sum, item) =>
          sum +
          item.AgentInventory.reduce(
            (aSum, ai) => aSum + (ai.quantity || 0),
            0
          ),
        0
      );

      // Find the store-specific category override
      const storeCat = prod.productCategory?.StoreCategory.find(
        (sc) => sc.companyId === prod.companyId
      );

      return {
        id: prod.id,
        name: prod.name,
        companyId: prod.companyId!,
        inventoryIds: prod.inventoryItems.map((i) => i.id),
        category: storeCat || null,
        companyStock,
        agentStock,
        costPrice: prod.costPrice,
        salesPrice: prod.sellingPrice,
        commissionRate: prod.CommissionRate?.commissionRate || 0,
        commissionType: prod.CommissionRate?.commissionType || "COST",
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
