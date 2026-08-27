import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function getInventoryReport(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const category = searchParams.get("category");
  const stockStatus = searchParams.get("stockStatus"); // 'LOW_STOCK', 'IN_STOCK', 'ALL'

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId", 400);
  }

  // 1. Build Base Where Clause for Inventory Items
  const whereClause: any = {
    companyId: companyId,
  };

  if (category) {
    // Filter by the product category name associated with the inventory item
    whereClause.product = {
      productCategory: {
        name: category
      }
    };
  }

  // 2. Fetch Inventory Items
  
  const cacheKey = `admin:inventory:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: whereClause,
    select: {
      id: true,
      quantity: true,
      reorderThreshold: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          name: true,
          costPrice: true,
          sellingPrice: true,
          productCategory: { select: { name: true } }
        }
      }
    },
    orderBy: { product: { name: 'asc' } },
  });

  // 3. Process and Filter Report Data in memory (after fetching relevant items)
  const inventoryReport = inventoryItems
    .map(item => {
      const currentStock = item.quantity;
      const minStock = item.reorderThreshold;

      // Determine stock status
      const status = minStock !== null && currentStock <= minStock ? 'LOW_STOCK' : 'IN_STOCK';

      return {
        id: item.id,
        name: item.product?.name || 'N/A Product',
        category: item.product?.productCategory?.name || 'N/A',
        stock: currentStock,
        minStock: minStock,
        status: status,
        costPrice: item.product?.costPrice || 0,
        sellingPrice: item.product?.sellingPrice || 0,
        lastUpdated: item.updatedAt ? new Date(item.updatedAt).toISOString().split('T')[0] : 'N/A',
      };
    })
    // Apply client-side stock status filter
    .filter(item => {
      if (stockStatus === 'LOW_STOCK') return item.status === 'LOW_STOCK';
      if (stockStatus === 'IN_STOCK') return item.status === 'IN_STOCK';
      return true; // 'ALL' or no filter
    });
  
    try{
      if (inventoryReport) {
        await cacheSet(cacheKey, inventoryReport, 60);
      }
    } catch (e) {
      console.error("Error caching inventory report:", e);
    }

  // 4. Return formatted success response
  return formatResponse(true, inventoryReport, "Inventory report generated successfully", 200);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(getInventoryReport);
