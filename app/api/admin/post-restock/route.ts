import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { TargetStatus } from "@prisma/client";
import { z } from "zod";

const restockSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  action: z.enum(["NEWSTOCK", "RESTOCK", "ASSIGN", "RETURN"]),
  companyId: z.string().optional(),
  damaged: z.number().int().nonnegative().optional().default(0),
  salesAgentId: z.string().optional(),
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

  const companyId = context.companyId || parsed.data.companyId;
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
    reason,
    adminId,
    commissionRate,
    commissionType,
    target,
  } = parsed.data;

  // Verify product belongs to tenant company
  const product = await prisma.product.findFirst({
    where: { id: productId, companyId },
    select: { id: true, name: true },
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
      // Find existing inventory item scoped to tenant
      let inventoryItem = await tx.inventoryItem.findFirst({
        where: { productId, companyId },
      });

      // --- NEWSTOCK / RESTOCK when item does not exist ---
      if (!inventoryItem && (action === "RESTOCK" || action === "NEWSTOCK")) {
        inventoryItem = await tx.inventoryItem.create({
          data: {
            product: { connect: { id: productId } },
            company: { connect: { id: companyId } },
            quantity,
            reorderThreshold: 10,
          },
        });

        await tx.inventoryLog.create({
          data: {
            inventoryId: inventoryItem.id,
            action: "NEWSTOCK",
            damaged,
            quantity,
          },
        });

        return { inventory: inventoryItem, message: "New inventory item added." };
      }

      if (!inventoryItem) {
        throw new Error("Inventory record not found for this product.");
      }

      // --- RESTOCK: Atomic increment ---
      if (action === "RESTOCK") {
        const updatedInventory = await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: { increment: quantity },
            updatedAt: new Date(),
          },
        });

        await tx.inventoryLog.create({
          data: { inventoryId: inventoryItem.id, action, damaged, quantity },
        });

        return {
          inventory: updatedInventory,
          message: "Product restocked successfully.",
        };
      }

      // --- ASSIGN TO SALES AGENT ---
      if (action === "ASSIGN") {
        if (!salesAgentId) {
          throw new Error("salesAgentId is required for ASSIGN action");
        }

        // Conditional atomic decrement ensuring stock does not go below zero
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

        const updatedInventory = await tx.inventoryItem.findUnique({
          where: { id: inventoryItem.id },
        });

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
            basedOn: commissionType,
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
              targetType: target.type || "QUANTITY",
              targetValue: target.value || 0,
              achievedValue: quantity,
              startDate: new Date(),
              endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
              metricType: target.metricType ?? "SALES_VOLUME",
              periodStart: new Date(),
              periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
              status: "ONGOING" as TargetStatus,
            },
          });
        }

        let agentInventory = await tx.agentInventory.findFirst({
          where: { inventoryItemId: inventoryItem.id, salesAgentId },
        });

        if (!agentInventory) {
          agentInventory = await tx.agentInventory.create({
            data: { salesAgentId, inventoryItemId: inventoryItem.id, quantity },
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
          },
        });
        await tx.agentInventoryLog.create({
          data: {
            agentInventoryId: agentInventory.id,
            action: "ASSIGN",
            damaged,
            quantity,
            totalPrice: 100,
          },
        });

        return {
          inventory: updatedInventory,
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
          throw new Error("Insufficient agent inventory quantity for return.");
        }

        // Conditional decrement on agent inventory
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

        const updatedInventory = await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: { increment: quantity },
            updatedAt: new Date(),
          },
        });

        await tx.agentInventoryLog.create({
          data: {
            agentInventoryId: agentInventory.id,
            action: "RETURN",
            damaged,
            quantity,
            totalPrice: 100,
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
            quantity,
          },
        });

        return {
          inventory: updatedInventory,
          message: "Product returned successfully.",
        };
      }

      throw new Error("Invalid inventory action.");
    });

    try {
      await cacheDel(`tenant:${companyId}:post-restock:*`);
      await cacheDel(`tenant:${companyId}:inventory:*`);
      await cacheDel(`admin:post-restock:*`);
    } catch {}

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
  requireIdempotency: true,
});
