import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * POST Handler: Handles the restock transaction for a specific inventory item.
 */
async function restockInventory(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  // NOTE: Authentication is handled by withApiHandler.
  const { adminSlug, id } = params;
  const body = await request.json();

  // We rely on withApiHandler to ensure the body is available
  const { quantityAdded, reason, userId } = body;

  // --- Input Validation ---
  const parsedQuantity = parseInt(quantityAdded);

  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return formatResponse(
      false,
      null,
      "Quantity to add must be a positive number.",
      400
    );
  }

  // 1. Validate Company Existence
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found.", 404);
  }

  // 2. Validate Inventory Item Existence and Ownership
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: {
      id: id,
      companyId: company.id, // Ensure item belongs to this company
    },
    select: { id: true, quantity: true },
  });

  if (!inventoryItem) {
    return formatResponse(false, null, "Inventory item not found or not associated with this company.", 404);
  }

  // --- Transaction Logic ---
  // Use a transaction to ensure both update and logging succeed or fail together
  const [updatedItem, logEntry] = await prisma.$transaction([
    // Update the quantity of the inventory item
    prisma.inventoryItem.update({
      where: { id: id },
      data: {
        quantity: { increment: parsedQuantity },
        updatedAt: new Date(),
      },
    }),

    // Create an InventoryLog entry for the restock
    prisma.inventoryLog.create({
      data: {
        inventoryId: id, // Use the item ID
        action: "RESTOCK",
        quantity: parsedQuantity,
        // Note: Assuming 'userId' is passed in the body for logging purposes
        // userId: userId, 
      },
    }),
  ]);

  // --- Success Response ---
  return formatResponse(true, {
    message: `Successfully restocked ${parsedQuantity} units.`,
    newStock: updatedItem.quantity,
    logId: logEntry.id,
  }, `Inventory item restocked successfully. New quantity: ${updatedItem.quantity}`, 200);
}

// Wrap the core logic with the API handler middleware
export const POST = withApiHandler(restockInventory);
