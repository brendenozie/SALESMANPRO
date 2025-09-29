import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler"; // Assumed utility
import { formatResponse } from "@/lib/formatResponse"; // Assumed utility
import { verifyAuth } from "@/lib/verifyAuth"; // Assumed utility
import { CommissionBasedOn } from "@prisma/client"; // Assuming these types exist

// Handles the assignment of inventory from an Agent's stock to a Client's inventory.
export const POST = withApiHandler(async (request: Request) => {
  // 1. Authentication and Authorization Check
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);
  // Add an authorization check here if only specific roles (e.g., 'ADMIN') can use this endpoint.

  const body = await request.json();
  const { agentInventoryId, clientId, quantity } = body;

  // 2. Enhanced Input Validation
  const parsedQuantity = Number(quantity);

  if (
    !agentInventoryId ||
    typeof agentInventoryId !== "string" ||
    !clientId ||
    typeof clientId !== "string" ||
    !parsedQuantity ||
    parsedQuantity <= 0 ||
    !Number.isInteger(parsedQuantity)
  ) {
    return formatResponse(
      false,
      null,
      "Invalid input data. Please verify agentInventoryId, clientId (both strings), and quantity (positive integer).",
      400
    );
  }

  try {
    // 3. Database Transaction for Atomicity
    const transaction = await prisma.$transaction(async (tx) => {
      // a. Fetch the agent inventory item details
      const agentInventory = await tx.agentInventory.findUnique({
        where: { id: agentInventoryId },
        include: {
          inventoryItem: { include: { product: true } },
          salesAgent: true,
        },
      });

      if (!agentInventory) {
        throw new Error("Agent inventory item not found.");
      }
      if (agentInventory.quantity < parsedQuantity) {
        throw new Error(`Insufficient stock. Available: ${agentInventory.quantity}, Requested: ${parsedQuantity}`);
      }

      const { inventoryItem } = agentInventory;
      const product = inventoryItem.product;

      // b. Reduce stock from the agent's inventory
      await tx.agentInventory.update({
        where: { id: agentInventoryId },
        data: { quantity: { decrement: parsedQuantity } },
      });

      // c. Assign inventory to the client (upsert)
      const clientInventory = await tx.clientInventory.upsert({
        where: {
          clientId_inventoryItemId: {
            clientId,
            inventoryItemId: inventoryItem.id,
          },
        },
        update: { quantity: { increment: parsedQuantity } },
        create: {
          clientId,
          inventoryItemId: inventoryItem.id,
          agentInventoryId,
          salesAgentId: agentInventory.salesAgentId,
          quantity: parsedQuantity,
        },
      });

      // d. Calculate and record commissions
      // NOTE: Assuming the 'Commission' model stores the RATE configuration, not the earned record.
      // If the model is used for earned records, consider renaming the table for rates (e.g., ProductCommissionRate).
      const commissionRates = await tx.commission.findMany({
        where: { productId: product.id },
      });

      const recordedCommissions: any[] = [];

      for (const rateConfig of commissionRates) {
        const { commissionRate = 0, basedOn } = rateConfig;

        // CRITICAL FIX: Base commission on costPrice if basedOn is 'COST'.
        // If 'COST' is intended to be *Sales Price* in your business logic, adjust this.
        const basePrice = basedOn === "COST" ? product.costPrice : product.salesPrice;

        // Ensure commissionRate is a valid number
        if (typeof commissionRate !== 'number' || commissionRate < 0) continue;

        const commissionEarned = commissionRate * basePrice * parsedQuantity;

        if (commissionEarned > 0) {
          recordedCommissions.push(
            await tx.commissionEarned.create({ // Assuming a separate model for earned commissions: CommissionEarned
              data: {
                salesAgentId: agentInventory.salesAgentId,
                productId: product.id,
                commissionRate,
                commissionEarned,
                basedOn: basedOn as CommissionBasedOn, // Casting based on imported type
                // Optionally add: clientInventoryId: clientInventory.id,
              },
            })
          );
        }
      }

      // Return combined results from the transaction
      return { clientInventory, commissions: recordedCommissions };
    });

    return formatResponse(
      true,
      transaction,
      "Product successfully assigned to client and commissions recorded.",
      200
    );
  } catch (error: any) {
    console.error("Assignment Error:", error.message || error);
    // The wrapper 'withApiHandler' should handle this, but explicit return is fine too.
    return formatResponse(
      false,
      null,
      error.message || "An unexpected error occurred during assignment.",
      500
    );
  }
});
