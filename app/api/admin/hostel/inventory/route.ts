import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    
    const cacheKey = buildTenantCacheKey(companyId, "inventory", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const items = await prisma.hostelInventory.findMany({
      where: { companyId },
      orderBy: { itemName: 'asc' }
    });

    const data = items.map((item:any) => {
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

    try {
      if (data) {
        await cacheSet(cacheKey, data, 60);
      }
    } catch (e) {
      console.error("Error caching inventory data:", e);
    }
    
    return formatResponse(true, data, "Inventory fetched successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to load inventory", 500);
  }
}