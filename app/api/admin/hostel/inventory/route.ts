import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    const items = await prisma.hostelInventory.findMany({
      where: { companyId },
      orderBy: { itemName: 'asc' }
    });

    const data = items.map(item => {
      let status = "Healthy";
      if (item.currentStock <= item.minThreshold) status = "Low Stock";
      if (item.needsRepair) status = "Repair Needed";

      return {
        id: item.assetId || `AST-${item.id.slice(-3)}`,
        dbId: item.id,
        item: item.itemName,
        cat: item.category,
        stock: item.currentStock,
        min: item.minThreshold,
        unit: item.unit,
        status: status,
        value: item.unitPrice * item.currentStock
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load inventory" }, { status: 500 });
  }
}