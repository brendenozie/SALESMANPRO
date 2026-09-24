import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// =======================================================================
// GET /api/admin/inventory-items?companyId=...
// =======================================================================
async function handleGetInventoryItems(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  const items = await prisma.inventoryItem.findMany({
    where: { companyId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return formatResponse(true, items, "Inventory items retrieved successfully", 200);
}

// =======================================================================
// POST /api/admin/inventory-items
// =======================================================================
async function handlePostInventoryItem(request: Request) {
  const body = await request.json();
  const { companyId, name, price, category, quantity = 0, reorderThreshold = 5, sku, barcode } = body;

  if (!companyId || !name) {
    return formatResponse(false, null, "companyId and name are required", 400);
  }

  // 1. Create backing Product
  const product = await prisma.product.create({
    data: {
      name,
      sellingPrice: price !== undefined ? parseFloat(price) : 0,
      costPrice: price !== undefined ? parseFloat(price) : 0,
      category: category || "General",
      company: { connect: { id: companyId } },
    },
  });

  // 2. Create linked InventoryItem
  const inventoryItem = await prisma.inventoryItem.create({
    data: {
      companyId,
      productId: product.id,
      quantity: parseInt(quantity, 10) || 0,
      reorderThreshold: parseInt(reorderThreshold, 10) || 5,
    },
    include: { product: true },
  });

  try {
    await cacheDel(`tenant:${companyId}:inventory:*`);
    await cacheDel(`admin:inventory:*`);
  } catch (e) {}

  return formatResponse(true, inventoryItem, "Inventory item created successfully", 201);
}

export const GET = withApiHandler(handleGetInventoryItems);
export const POST = withApiHandler(handlePostInventoryItem);
