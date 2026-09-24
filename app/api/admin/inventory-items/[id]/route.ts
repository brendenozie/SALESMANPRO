import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// =======================================================================
// GET /api/admin/inventory-items/:id
// =======================================================================
async function handleGetInventoryItem(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!item) {
    return formatResponse(false, null, "Inventory item not found", 404);
  }

  return formatResponse(true, item, "Inventory item retrieved successfully", 200);
}

// =======================================================================
// PUT /api/admin/inventory-items/:id
// =======================================================================
async function handlePutInventoryItem(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { quantity, reorderThreshold, price, name, category } = body;

  const existing = await prisma.inventoryItem.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!existing) {
    return formatResponse(false, null, "Inventory item not found", 404);
  }

  // Update InventoryItem
  const updatedItem = await prisma.inventoryItem.update({
    where: { id },
    data: {
      ...(quantity !== undefined && { quantity: parseInt(quantity, 10) }),
      ...(reorderThreshold !== undefined && { reorderThreshold: parseInt(reorderThreshold, 10) }),
    },
    include: { product: true },
  });

  // Update associated Product if provided
  if (existing.productId && (price !== undefined || name || category)) {
    await prisma.product.update({
      where: { id: existing.productId },
      data: {
        ...(price !== undefined && { sellingPrice: parseFloat(price), costPrice: parseFloat(price) }),
        ...(name && { name }),
        ...(category && { category }),
      },
    });
  }

  try {
    await cacheDel(`tenant:${existing.companyId}:inventory:*`);
    await cacheDel(`admin:inventory:*`);
  } catch (e) {}

  return formatResponse(true, updatedItem, "Inventory item updated successfully", 200);
}

// =======================================================================
// DELETE /api/admin/inventory-items/:id
// =======================================================================
async function handleDeleteInventoryItem(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.inventoryItem.findUnique({
    where: { id },
  });

  if (!existing) {
    return formatResponse(false, null, "Inventory item not found", 404);
  }

  // Delete inventory logs first
  await prisma.inventoryLog.deleteMany({
    where: { inventoryId: id },
  }).catch(() => {});

  await prisma.inventoryItem.delete({
    where: { id },
  });

  try {
    await cacheDel(`tenant:${existing.companyId}:inventory:*`);
    await cacheDel(`admin:inventory:*`);
  } catch (e) {}

  return formatResponse(true, null, "Inventory item deleted successfully", 200);
}

export const GET = withApiHandler(handleGetInventoryItem);
export const PUT = withApiHandler(handlePutInventoryItem);
export const DELETE = withApiHandler(handleDeleteInventoryItem);
