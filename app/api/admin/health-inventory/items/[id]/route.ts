import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


async function validateInventoryAccess(adminSlug: string, itemId: string) {
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return { error: "Company not found", status: 404, companyId: null };
  }
  const companyId = company.id;

  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId, companyId: companyId },
    select: { id: true, quantity: true } // Select minimal fields needed for validation/logging
  });

  if (!item) {
    return { error: "Inventory item not found or not associated with this company", status: 404, companyId, item: null };
  }

  return { error: null, status: 200, companyId, item };
}


async function getInventoryItem(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;
  const validation = await validateInventoryAccess(adminSlug, id);

  if (validation.error) {
    // If we couldn't find the company or the item, return the structured error.
    return formatResponse(false, null, validation.error, validation.status);
  }
  // At this point, the item and company are validated.

  
    const cacheKey = `admin:items:${adminSlug || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: { id: id },
    select: {
      id: true,
      quantity: true,
      reorderThreshold: true,
      createdAt: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          productCategory: { select: { name: true } }
        }
      },
      inventoryLogs: {
        orderBy: { createdAt: 'desc' },
        take: 5, // Fetch recent logs
      }
    },
  });

  try {
    if (inventoryItem) {
      await cacheSet(cacheKey, inventoryItem, 60);
    }
  } catch (e) {}

  // Re-check for null if the select fields somehow caused an issue, though unlikely after validation
  if (!inventoryItem) {
     return formatResponse(false, null, "Inventory item not found.", 404);
  }

  const formattedItem = {
    ...inventoryItem,
    name: inventoryItem.product?.name || 'N/A',
    category: inventoryItem.product?.productCategory?.name || 'Uncategorized',
    minStock: inventoryItem.reorderThreshold || 0,
    lastUpdated: new Date(inventoryItem.updatedAt || '').toISOString().split('T')[0],
    logs: inventoryItem.inventoryLogs.map(log => ({
      ...log,
      createdAt: new Date(log.createdAt || '').toLocaleString(),
    })),
  };

  return formatResponse(true, formattedItem, "Inventory item details fetched successfully", 200);
}


async function updateInventoryItem(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;
  const body = await request.json();
  const { quantity, reorderThreshold, userId } = body; // userId of the admin for logging

  const validation = await validateInventoryAccess(adminSlug, id);
  if (validation.error) {
    return formatResponse(false, null, validation.error, validation.status);
  }

  const itemToUpdate = validation.item; // Contains { id: true, quantity: currentQuantity }

  let updateData: any = { updatedAt: new Date() };

  if (quantity !== undefined) updateData.quantity = parseInt(quantity);
  if (reorderThreshold !== undefined) updateData.reorderThreshold = parseInt(reorderThreshold);

  if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
      return formatResponse(false, null, "No valid fields provided for update.", 400);
  }

  const updatedItem = await prisma.inventoryItem.update({
    where: { id: id },
    data: updateData,
  });

  // Optional: Create an InventoryLog for manual adjustments to quantity
  if (quantity !== undefined && parseInt(quantity) !== itemToUpdate!.quantity) {
    const delta = parseInt(quantity) - itemToUpdate!.quantity;
    await prisma.inventoryLog.create({
      data: {
        inventoryId: updatedItem.id,
        action: "MANUAL_ADJUSTMENT",
        quantity: delta, // Log the delta (positive for increase, negative for decrease)
        userId: userId, // Link to the admin user
        details: `Manual stock adjustment to ${updatedItem.quantity}`,
      }
    });
  }

  
    try { await cacheDel(`admin:items:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedItem, "Inventory item updated successfully", 200);
}


async function deleteInventoryItem(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;
  const validation = await validateInventoryAccess(adminSlug, id);

  if (validation.error) {
    return formatResponse(false, null, validation.error, validation.status);
  }
  // At this point, the item and company are validated.

  // Use a transaction to ensure logs and item are removed atomically
  await prisma.$transaction([
    // Delete associated logs first
    prisma.inventoryLog.deleteMany({
      where: { inventoryId: id }
    }),
    // Then delete the item
    prisma.inventoryItem.delete({
      where: { id: id },
    }),
  ]);

  // Successful deletion typically returns 204 No Content, but we use 200 with a message for consistency.
  
    try { await cacheDel(`admin:items:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Inventory item deleted successfully", 200);
}

// Wrap and export all handlers
export const GET = withApiHandler(getInventoryItem);
export const PUT = withApiHandler(updateInventoryItem);
export const DELETE = withApiHandler(deleteInventoryItem);
