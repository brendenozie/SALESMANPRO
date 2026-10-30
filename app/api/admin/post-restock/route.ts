import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { TargetStatus } from "@prisma/client";
import { z } from "zod";
import {
  ensureInventoryItemTx,
  syncMarketplaceListingsTx,
  formatLedgerDetails,
  invalidateInventoryCaches,
} from "@/lib/inventory/inventory-service";

const restockSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  action: z.enum(["NEWSTOCK", "RESTOCK", "ASSIGN", "RETURN"]),
  companyId: z.string().optional(),
  damaged: z.number().int().nonnegative().optional().default(0),
  salesAgentId: z.string().optional(),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  reason: z.string().optional(),
  adminId: z.string().optional(),
  commissionRate: z.number().nonnegative().optional().default(0),
  commissionType: z.string().optional().default("PERCENTAGE"),
  target: z
    .object({
      type: z.string().optional().default("QUANTITY"),
      value: z.number().optional().default(0),
      metricType: z.string().optional().default("SALES_VOLUME"),
    })
    .optional(),
});

async function handlePost(req: Request, context: any) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return formatResponse(false, null, "Invalid JSON payload", 400);
  }

  const parsed = restockSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.errors, 400);
  }

  const companyId =
    parsed.data.companyId || context.companyId || context.user?.companyId;
  if (!companyId) {
    return formatResponse(
      false,
      null,
      "Authorized company context is required",
      403,
    );
  }

  const {
    productId,
    quantity,
    damaged,
    action,
    salesAgentId,
    supplierId,
    supplierName,
    reason,
    adminId,
    commissionRate,
    commissionType,
    target,
  } = parsed.data;

  const actorId = adminId || context?.user?.id || "system";
  const actorName = context?.user?.name || context?.user?.email || "Admin";

  // Verify product belongs to tenant company
  const product = await prisma.product.findFirst({
    where: { id: productId, companyId },
    select: { id: true, name: true, quantity: true, sellingPrice: true },
  });

  if (!product) {
    return formatResponse(
      false,
      null,
      "Product not found or does not belong to authorized company",
      404,
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Ensure an InventoryItem row exists (seeded with product.quantity if missing)
      const inventoryItem = await ensureInventoryItemTx(
        tx,
        productId,
        companyId,
        product.quantity || 0,
      );

      const previousQuantity = inventoryItem.quantity || 0;

      // Optionally update product's supplier if supplied
      const supplierPatch: Record<string, any> = {};
      if (supplierId) {
        supplierPatch.supplier = { connect: { id: supplierId } };
      }
      if (supplierName) {
        supplierPatch.supplierName = supplierName;
      }

      // --- NEWSTOCK / RESTOCK ---
      if (action === "RESTOCK" || action === "NEWSTOCK") {
        // Net sellable addition = quantity (damaged units are logged separately in damaged count)
        const newQuantity = previousQuantity + quantity;

        const updatedInventory = await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: newQuantity,
            updatedAt: new Date(),
          },
        });

        await tx.product.update({
          where: { id: productId },
          data: {
            ...supplierPatch,
            quantity: newQuantity,
            isAvailable: newQuantity > 0,
          },
        });

        await syncMarketplaceListingsTx(tx, productId, companyId, newQuantity);

        await tx.inventoryLog.create({
          data: {
            inventoryId: inventoryItem.id,
            action,
            damaged,
            quantity,
            details: formatLedgerDetails(
              reason ||
                `${action === "NEWSTOCK" ? "Opening stock" : "Restock"} of +${quantity} units${
                  supplierName ? ` from ${supplierName}` : ""
                }${damaged > 0 ? ` (${damaged} damaged)` : ""}`,
              {
                movementType:
                  action === "NEWSTOCK" ? "OPENING_STOCK" : "RESTOCK",
                previousQuantity,
                newQuantity,
                delta: quantity,
                damagedQuantity: damaged,
                actorId,
                actorName,
                reason:
                  reason ||
                  (supplierName
                    ? `Supplied by ${supplierName}`
                    : "Warehouse restock"),
              },
            ),
          },
        });

        return {
          inventory: updatedInventory,
          previousQuantity,
          newQuantity,
          message:
            action === "NEWSTOCK"
              ? "Opening inventory recorded successfully."
              : "Product restocked successfully.",
        };
      }

      // --- ASSIGN TO SALES AGENT ---
      if (action === "ASSIGN") {
        if (!salesAgentId) {
          throw new Error("salesAgentId is required for ASSIGN action");
        }

        if (previousQuantity < quantity) {
          throw new Error(
            `Insufficient warehouse stock for assignment. Available: ${previousQuantity}, Requested: ${quantity}.`,
          );
        }

        const updateResult = await tx.inventoryItem.updateMany({
          where: {
            id: inventoryItem.id,
            companyId,
            quantity: { gte: quantity },
          },
          data: {
            quantity: { decrement: quantity },
            updatedAt: new Date(),
          },
        });

        if (updateResult.count === 0) {
          throw new Error("Insufficient inventory quantity for assignment.");
        }

        const newQuantity = previousQuantity - quantity;

        const updatedInventory = await tx.inventoryItem.findUnique({
          where: { id: inventoryItem.id },
        });

        await tx.product.update({
          where: { id: productId },
          data: {
            ...supplierPatch,
            quantity: newQuantity,
            isAvailable: newQuantity > 0,
          },
        });

        await syncMarketplaceListingsTx(tx, productId, companyId, newQuantity);

        const commission = await tx.commission.upsert({
          where: { salesAgentId_productId: { salesAgentId, productId } },
          update: {
            commissionEarned: { increment: quantity * commissionRate },
            updatedAt: new Date(),
          },
          create: {
            salesAgentId,
            productId,
            commissionRate,
            commissionEarned: quantity * commissionRate,
            basedOn: commissionType as any,
          },
        });

        let targetP: any = null;
        if (target) {
          targetP = await tx.target.upsert({
            where: {
              agent_product_unique: {
                agentId: salesAgentId,
                productId,
              },
            },
            update: {
              achievedValue: { increment: quantity },
              updatedAt: new Date(),
            },
            create: {
              salesAgent: { connect: { id: salesAgentId } },
              product: { connect: { id: productId } },
              targetType: (target.type || "QUANTITY") as any,
              targetValue: target.value || 0,
              achievedValue: quantity,
              startDate: new Date(),
              endDate: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
              ),
              metricType: (target.metricType ?? "SALES_VOLUME") as any,
              periodStart: new Date(),
              periodEnd: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
              ),
              status: "ONGOING" as TargetStatus,
            },
          });
        }

        let agentInventory = await tx.agentInventory.findFirst({
          where: { inventoryItemId: inventoryItem.id, salesAgentId },
        });

        if (!agentInventory) {
          agentInventory = await tx.agentInventory.create({
            data: {
              salesAgentId,
              inventoryItemId: inventoryItem.id,
              quantity,
            },
          });
        } else {
          agentInventory = await tx.agentInventory.update({
            where: { id: agentInventory.id },
            data: {
              quantity: { increment: quantity },
              updatedAt: new Date(),
            },
          });
        }

        await tx.inventoryLog.create({
          data: {
            inventoryId: inventoryItem.id,
            action: "ASSIGN",
            damaged,
            quantity,
            details: formatLedgerDetails(
              `Assigned ${quantity} units to sales agent (${salesAgentId})`,
              {
                movementType: "AGENT_ASSIGN",
                previousQuantity,
                newQuantity,
                delta: -quantity,
                damagedQuantity: damaged,
                referenceId: salesAgentId,
                referenceType: "AGENT",
                actorId,
                actorName,
                reason: reason || "Assigned to sales agent",
              },
            ),
          },
        });

        await tx.agentInventoryLog.create({
          data: {
            agentInventoryId: agentInventory.id,
            action: "ASSIGN",
            damaged,
            quantity,
            totalPrice: (product.sellingPrice || 100) * quantity,
          },
        });

        return {
          inventory: updatedInventory,
          previousQuantity,
          newQuantity,
          commission,
          target: targetP,
          message: "Product assigned successfully.",
        };
      }

      // --- RETURN FROM SALES AGENT ---
      if (action === "RETURN") {
        if (!salesAgentId) {
          throw new Error("salesAgentId is required for RETURN action");
        }

        const agentInventory = await tx.agentInventory.findFirst({
          where: { inventoryItemId: inventoryItem.id, salesAgentId },
        });

        if (!agentInventory || agentInventory.quantity < quantity) {
          throw new Error(
            `Insufficient agent inventory quantity for return. Agent holds: ${
              agentInventory?.quantity || 0
            }, Requested: ${quantity}.`,
          );
        }

        const agentUpdate = await tx.agentInventory.updateMany({
          where: {
            id: agentInventory.id,
            quantity: { gte: quantity },
          },
          data: {
            quantity: { decrement: quantity },
            updatedAt: new Date(),
          },
        });

        if (agentUpdate.count === 0) {
          throw new Error("Insufficient agent inventory quantity for return.");
        }

        // Good sellable units returned to warehouse = quantity - damaged
        const goodReturned = Math.max(0, quantity - damaged);
        const newQuantity = previousQuantity + goodReturned;

        const updatedInventory = await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: newQuantity,
            updatedAt: new Date(),
          },
        });

        await tx.product.update({
          where: { id: productId },
          data: {
            ...supplierPatch,
            quantity: newQuantity,
            isAvailable: newQuantity > 0,
          },
        });

        await syncMarketplaceListingsTx(tx, productId, companyId, newQuantity);

        await tx.agentInventoryLog.create({
          data: {
            agentInventoryId: agentInventory.id,
            action: "RETURN",
            damaged,
            quantity,
            totalPrice: (product.sellingPrice || 100) * quantity,
          },
        });

        await tx.return.create({
          data: {
            inventoryId: inventoryItem.id,
            returnedBy: { connect: { id: salesAgentId } },
            quantity,
            reason: reason || "Returned to stock",
            ...(adminId && { ReturnApprovedBy: { connect: { id: adminId } } }),
          },
        });

        await tx.inventoryLog.create({
          data: {
            inventoryId: inventoryItem.id,
            action: "RETURN",
            damaged,
            quantity: goodReturned,
            details: formatLedgerDetails(
              `Returned ${quantity} units from agent (${goodReturned} sellable, ${damaged} damaged). Reason: ${
                reason || "Returned to stock"
              }`,
              {
                movementType: "AGENT_RETURN",
                previousQuantity,
                newQuantity,
                delta: goodReturned,
                damagedQuantity: damaged,
                referenceId: salesAgentId,
                referenceType: "AGENT",
                actorId,
                actorName,
                reason: reason || "Returned from sales agent",
              },
            ),
          },
        });

        return {
          inventory: updatedInventory,
          previousQuantity,
          newQuantity,
          message: "Product returned successfully.",
        };
      }

      throw new Error("Invalid inventory action.");
    });

    await invalidateInventoryCaches(companyId);

    return formatResponse(true, result, result.message, 200);
  } catch (err: any) {
    console.error("[INVENTORY_RESTOCK_ERROR]", err);
    return formatResponse(
      false,
      null,
      err.message || "Failed to process inventory restock transaction",
      400,
    );
  }
}

export const POST = withApiHandler(handlePost, {
  requireAuth: true,
  requireTenant: true,
  requireIdempotency: false,
});
