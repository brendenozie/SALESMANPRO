import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { resolveAuthorizedCompany } from "@/lib/auth/companyAccess";
import {
  executeStockMutation,
  parseLedgerDetails,
  invalidateInventoryCaches,
  InventoryMovementType,
} from "@/lib/inventory/inventory-service";
import { z } from "zod";

const adjustSchema = z.object({
  companyId: z.string().min(1, "companyId is required"),
  productId: z.string().min(1, "productId is required"),
  movementType: z.enum([
    "OPENING_STOCK",
    "PURCHASE_RECEIPT",
    "RESTOCK",
    "STOCK_ADDITION",
    "STOCK_REDUCTION",
    "STOCKTAKE_ADJUSTMENT",
    "CUSTOMER_RETURN",
    "SUPPLIER_RETURN",
    "DAMAGE",
    "WRITE_OFF",
    "STOCK_CORRECTION",
  ]),
  quantityDelta: z.number().int().optional(),
  targetQuantity: z.number().int().nonnegative().optional(),
  damagedQuantity: z.number().int().nonnegative().optional().default(0),
  reorderThreshold: z.number().int().nonnegative().optional(),
  warehouseName: z.string().optional(),
  locationId: z.string().optional(),
  referenceId: z.string().optional(),
  reason: z.string().min(1, "A reason or description is required for stock adjustments"),
});

async function handleGet(req: Request, context: any) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("companyId") || context?.companyId;
  const productId = searchParams.get("productId") || undefined;
  const movementType = searchParams.get("movementType") || undefined;
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

  const authRes = await resolveAuthorizedCompany(
    context?.user || context,
    rawCompanyId,
  );
  if (!authRes.authorized || !authRes.companyId) {
    return formatResponse(
      false,
      null,
      authRes.error || "Unauthorized company access",
      authRes.status || 403,
    );
  }
  const companyId = authRes.companyId;

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      companyId,
      ...(productId ? { productId } : {}),
    },
    select: {
      id: true,
      productId: true,
      quantity: true,
      reorderThreshold: true,
      product: {
        select: {
          id: true,
          name: true,
          model: true,
          brand: true,
          images: true,
          sellingPrice: true,
          costPrice: true,
        },
      },
    },
  });

  if (inventoryItems.length === 0) {
    return formatResponse(
      true,
      { logs: [], total: 0 },
      "No inventory movement logs found.",
      200,
    );
  }

  const itemById = new Map(inventoryItems.map((i) => [i.id, i]));
  const invIds = inventoryItems.map((i) => i.id);

  const rawLogs = await prisma.inventoryLog.findMany({
    where: {
      inventoryId: { in: invIds },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const logs = rawLogs
    .map((log) => {
      const parsed = parseLedgerDetails(log.details);
      const inv = itemById.get(log.inventoryId);
      const resolvedMovementType =
        parsed.meta?.movementType || log.action || "STOCK_CORRECTION";

      return {
        id: log.id,
        inventoryId: log.inventoryId,
        productId: inv?.productId || null,
        productName: inv?.product?.name || "Unknown Product",
        productSku:
          inv?.product?.model ||
          (inv?.productId
            ? `SKU-${inv.productId.slice(-8).toUpperCase()}`
            : "N/A"),
        action: log.action,
        movementType: resolvedMovementType,
        quantity: log.quantity,
        damaged: log.damaged || parsed.meta?.damagedQuantity || 0,
        previousQuantity: parsed.meta?.previousQuantity ?? null,
        newQuantity: parsed.meta?.newQuantity ?? null,
        delta: parsed.meta?.delta ?? null,
        warehouseName: parsed.meta?.warehouseName || "Main Warehouse",
        referenceId: parsed.meta?.referenceId || null,
        referenceType: parsed.meta?.referenceType || null,
        actorId: parsed.meta?.actorId || null,
        actorName: parsed.meta?.actorName || "System / Admin",
        reason: parsed.meta?.reason || parsed.summary || log.action,
        summary: parsed.summary || log.action,
        createdAt: log.createdAt,
      };
    })
    .filter((entry) =>
      movementType ? entry.movementType === movementType : true,
    );

  return formatResponse(
    true,
    { logs, total: logs.length },
    "Inventory ledger fetched successfully.",
    200,
  );
}

async function handlePost(req: Request, context: any) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return formatResponse(false, null, "Invalid JSON payload", 400);
  }

  // Allow reorder-level-only update if requested
  if (
    body.action === "UPDATE_REORDER_THRESHOLD" &&
    body.companyId &&
    body.productId &&
    typeof body.reorderThreshold === "number"
  ) {
    const authRes = await resolveAuthorizedCompany(
      context?.user || context,
      body.companyId,
    );
    if (!authRes.authorized || !authRes.companyId) {
      return formatResponse(false, null, "Unauthorized", 403);
    }
    const companyId = authRes.companyId;
    const inv = await prisma.inventoryItem.findFirst({
      where: { productId: body.productId, companyId },
    });
    if (!inv) {
      return formatResponse(false, null, "Inventory record not found", 404);
    }
    const updated = await prisma.inventoryItem.update({
      where: { id: inv.id },
      data: {
        reorderThreshold: Math.max(0, Math.round(body.reorderThreshold)),
        updatedAt: new Date(),
      },
    });
    await invalidateInventoryCaches(companyId);
    return formatResponse(
      true,
      updated,
      "Reorder threshold updated successfully.",
      200,
    );
  }

  const parsed = adjustSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(
      false,
      null,
      parsed.error.errors.map((e) => e.message).join(", "),
      400,
    );
  }

  const authRes = await resolveAuthorizedCompany(
    context?.user || context,
    parsed.data.companyId || context?.companyId,
  );
  if (!authRes.authorized || !authRes.companyId) {
    return formatResponse(
      false,
      null,
      authRes.error || "Unauthorized company access",
      authRes.status || 403,
    );
  }

  const companyId = authRes.companyId;
  const {
    productId,
    movementType,
    quantityDelta,
    targetQuantity,
    damagedQuantity,
    reorderThreshold,
    warehouseName,
    locationId,
    referenceId,
    reason,
  } = parsed.data;

  // Determine signed delta if not targetQuantity
  let resolvedDelta = quantityDelta;
  if (resolvedDelta === undefined && targetQuantity === undefined) {
    return formatResponse(
      false,
      null,
      "Either quantityDelta or targetQuantity must be provided.",
      400,
    );
  }

  if (resolvedDelta !== undefined) {
    const absQty = Math.abs(resolvedDelta);
    if (
      movementType === "STOCK_REDUCTION" ||
      movementType === "SUPPLIER_RETURN" ||
      movementType === "DAMAGE" ||
      movementType === "WRITE_OFF"
    ) {
      resolvedDelta = -absQty;
    } else if (
      movementType === "STOCK_ADDITION" ||
      movementType === "PURCHASE_RECEIPT" ||
      movementType === "RESTOCK" ||
      movementType === "CUSTOMER_RETURN" ||
      movementType === "OPENING_STOCK"
    ) {
      resolvedDelta = absQty;
    }
  }

  try {
    const mutationResult = await executeStockMutation({
      companyId,
      productId,
      movementType: movementType as InventoryMovementType,
      quantityDelta: resolvedDelta,
      targetQuantity,
      damagedQuantity:
        movementType === "DAMAGE" && resolvedDelta
          ? Math.max(damagedQuantity || 0, Math.abs(resolvedDelta))
          : damagedQuantity,
      reason,
      referenceId,
      referenceType: "ADJUSTMENT",
      warehouseName: warehouseName || "Main Warehouse",
      locationId,
      actorId: context?.user?.id || "admin",
      actorName: context?.user?.name || context?.user?.email || "Admin",
      allowNegative: false,
    });

    if (typeof reorderThreshold === "number") {
      await prisma.inventoryItem.update({
        where: { id: mutationResult.inventoryItemId },
        data: { reorderThreshold: Math.max(0, reorderThreshold) },
      });
    }

    return formatResponse(
      true,
      mutationResult,
      `Stock adjusted successfully (${mutationResult.previousQuantity} → ${mutationResult.newQuantity}).`,
      200,
    );
  } catch (err: any) {
    console.error("[INVENTORY_ADJUST_ERROR]", err);
    return formatResponse(
      false,
      null,
      err.message || "Failed to adjust stock",
      400,
    );
  }
}

export const GET = withApiHandler(handleGet, {
  requireAuth: true,
});

export const POST = withApiHandler(handlePost, {
  requireAuth: true,
});

