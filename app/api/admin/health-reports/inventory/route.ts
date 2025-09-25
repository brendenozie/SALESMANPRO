// app/api/admin/reports/inventory/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(request: Request) {
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const category = searchParams.get("category");
  const stockStatus = searchParams.get("stockStatus"); // 'LOW', 'IN_STOCK', 'ALL'

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  try {
    const whereClause: any = {
      companyId: companyId,
    };

    if (category) {
      whereClause.category = category;
    }

    // Fetch products that are considered inventory items
    let products = await prisma.product.findMany({
      where: {
        companyId: companyId,
        // Assuming products that have 'quantity' and 'costPrice' are inventory items
        // You might need a more explicit flag or a dedicated InventoryItem model
        // based on your exact schema.
        // For now, we'll filter by products that have a quantity
        quantity: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        category: true,
        quantity: true, // Current stock
        costPrice: true,
        sellingPrice: true,
        createdAt: true,
        updatedAt: true,
        // Assuming reorderThreshold might be part of Product or a related InventoryItem
        // If reorderThreshold is in InventoryItem, you'd need to include it and join
        // For simplicity, let's assume `minStock` from the original prompt is now `reorderThreshold` on Product
        // If not, you'd need to adjust this to fetch from InventoryItem relation.
        inventoryItems: {
          select: {
            id: true,
            quantity: true, // InventoryItem's specific quantity
            reorderThreshold: true,
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    const inventoryReport = products.map(product => {
      // Prioritize InventoryItem's quantity and reorderThreshold if available
      const currentStock = product.inventoryItems.length > 0 ? product.inventoryItems[0].quantity : product.quantity;
      const minStock = product.inventoryItems.length > 0 ? product.inventoryItems[0].reorderThreshold : null; // Assuming reorderThreshold is on InventoryItem

      const status = minStock !== null && currentStock <= minStock ? 'LOW_STOCK' : 'IN_STOCK';

      return {
        id: product.id,
        name: product.name,
        category: product.category || 'N/A',
        stock: currentStock,
        minStock: minStock,
        status: status,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        lastUpdated: product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : 'N/A',
      };
    }).filter(item => {
      if (stockStatus === 'LOW_STOCK') return item.status === 'LOW_STOCK';
      if (stockStatus === 'IN_STOCK') return item.status === 'IN_STOCK';
      return true; // 'ALL' or no filter
    });


    return NextResponse.json(inventoryReport);
  } catch (err: any) {
    console.error("GET /api/admin/reports/inventory error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
