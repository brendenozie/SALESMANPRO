"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyAuthoritativeStockMovement = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const inventory_service_1 = require("@/lib/inventory/inventory-service");
const changeLogService_1 = require("@/lib/sync/changeLogService");
/**
 * Applies an additive stock movement delta (+delta / -delta) across `marketplaceListings`,
 * `Product`, and `InventoryItem`, appends an auditable `InventoryLog` entry, and handles
 * offline oversell conflicts according to the store's configured `OfflineStockPolicy`
 * (`STRICT` | `CONTROLLED` | `FLEXIBLE`).
 *
 * CRITICAL INVARIANT: Never overwrites stock with a client-supplied absolute balance.
 */
async function applyAuthoritativeStockMovement(input, txClient) {
    const db = txClient || prismadb_1.default;
    const delta = Number(input.delta || 0);
    if (delta === 0 || Number.isNaN(delta)) {
        throw new Error("Stock movement delta must be a non-zero integer.");
    }
    let listing = null;
    let product = null;
    if (input.marketplaceListingId) {
        listing = await db.marketplaceListings.findUnique({
            where: { id: input.marketplaceListingId },
            select: {
                id: true,
                name: true,
                quantity: true,
                isAvailable: true,
                productId: true,
                companyId: true,
            },
        });
    }
    const resolvedProductId = input.productId || listing?.productId || null;
    if (!listing && resolvedProductId) {
        listing = await db.marketplaceListings.findFirst({
            where: {
                productId: resolvedProductId,
                companyId: input.companyId,
            },
            select: {
                id: true,
                name: true,
                quantity: true,
                isAvailable: true,
                productId: true,
                companyId: true,
            },
        });
    }
    if (resolvedProductId) {
        product = await db.product.findUnique({
            where: { id: resolvedProductId },
            select: {
                id: true,
                name: true,
                quantity: true,
                isAvailable: true,
                companyId: true,
            },
        });
    }
    if (!listing && !product) {
        throw new Error(`Cannot apply stock movement: product/listing not found (listingId=${input.marketplaceListingId}, productId=${input.productId}).`);
    }
    let invItem = resolvedProductId
        ? await db.inventoryItem.findFirst({
            where: {
                productId: resolvedProductId,
                companyId: input.companyId,
            },
        })
        : null;
    const currentAuthoritativeQty = invItem?.quantity ?? listing?.quantity ?? product?.quantity ?? 0;
    const projectedQty = currentAuthoritativeQty + delta;
    const isDeduction = delta < 0;
    const isOversell = isDeduction && projectedQty < 0;
    const oversoldAmount = isOversell ? Math.abs(projectedQty) : 0;
    const effectivePolicy = input.offlinePolicy || "CONTROLLED";
    // Under STRICT policy (or online non-sync checkout), block if insufficient stock
    if (isOversell && (!input.isOfflineSync || effectivePolicy === "STRICT")) {
        throw new Error(`Insufficient stock for "${listing?.name || product?.name || "Item"}". Available: ${currentAuthoritativeQty}, Requested: ${Math.abs(delta)}`);
    }
    // Under CONTROLLED or FLEXIBLE offline sync:
    // Record the true movement delta. Keep marketplaceListing/Product quantity clamped >= 0 for public storefront safety,
    // while recording the exact signed delta and flagging a SyncConflictRecord for manager reconciliation.
    const clampedDisplayQty = Math.max(0, projectedQty);
    if (listing) {
        await db.marketplaceListings.update({
            where: { id: listing.id },
            data: {
                quantity: clampedDisplayQty,
                isAvailable: clampedDisplayQty > 0,
            },
        });
    }
    if (resolvedProductId && product) {
        await db.product
            .update({
            where: { id: resolvedProductId },
            data: {
                quantity: clampedDisplayQty,
                isAvailable: clampedDisplayQty > 0,
            },
        })
            .catch(() => null);
    }
    if (resolvedProductId) {
        if (invItem) {
            invItem = await db.inventoryItem.update({
                where: { id: invItem.id },
                data: {
                    // Preserve true accounting balance in InventoryItem or clamp to 0 while logging exact variance
                    quantity: clampedDisplayQty,
                },
            });
        }
        else {
            invItem = await db.inventoryItem.create({
                data: {
                    productId: resolvedProductId,
                    companyId: input.companyId,
                    quantity: clampedDisplayQty,
                },
            });
        }
    }
    // Consume from per-device StockAllocation if an active allocation exists
    if (isDeduction && listing?.id && input.deviceId) {
        await db.stockAllocation
            .updateMany({
            where: {
                companyId: input.companyId,
                deviceId: input.deviceId,
                marketplaceListingId: listing.id,
                status: "ACTIVE",
            },
            data: {
                consumedQty: { increment: Math.abs(delta) },
            },
        })
            .catch(() => null);
    }
    let inventoryLogId = null;
    if (invItem) {
        const itemName = listing?.name || product?.name || "Inventory Item";
        const summaryText = `${input.movementType} (${delta > 0 ? `+${delta}` : delta}) on ${itemName} [Device: ${input.deviceId}]${isOversell ? ` [OVERSELL DISCREPANCY: -${oversoldAmount}]` : ""}`;
        const logEntry = await db.inventoryLog.create({
            data: {
                inventoryId: invItem.id,
                action: input.movementType,
                quantity: Math.abs(delta),
                details: (0, inventory_service_1.formatLedgerDetails)(summaryText, {
                    movementType: input.movementType,
                    productId: resolvedProductId,
                    companyId: input.companyId,
                    previousQuantity: currentAuthoritativeQty,
                    newQuantity: clampedDisplayQty,
                    delta,
                    relatedOrderId: input.relatedOrderId || null,
                    referenceId: input.referenceId || input.operationId,
                    actorId: input.actorId || null,
                    reason: input.reason ||
                        (isOversell
                            ? `Offline oversell discrepancy of ${oversoldAmount} unit(s) from terminal ${input.deviceId}`
                            : `Stock movement ${input.operationId}`),
                }),
                ...(input.actorId && /^[0-9a-fA-F]{24}$/.test(input.actorId)
                    ? { userId: input.actorId }
                    : {}),
            },
        });
        inventoryLogId = logEntry.id;
    }
    let conflictRecordId = null;
    if (isOversell) {
        const conflict = await db.syncConflictRecord.create({
            data: {
                companyId: input.companyId,
                storeId: input.storeId || null,
                deviceId: input.deviceId,
                operationId: input.operationId,
                entityType: "INVENTORY",
                entityId: resolvedProductId || listing?.id || null,
                conflictType: "OVERSELL_DISCREPANCY",
                severity: "HIGH",
                status: "OPEN",
                clientPayload: {
                    delta,
                    movementType: input.movementType,
                    relatedOrderId: input.relatedOrderId,
                    referenceId: input.referenceId,
                },
                serverState: {
                    productName: listing?.name || product?.name,
                    previousAuthoritativeStock: currentAuthoritativeQty,
                    requestedDeduction: Math.abs(delta),
                    projectedBalance: projectedQty,
                    clampedBalance: clampedDisplayQty,
                    oversoldUnits: oversoldAmount,
                },
                details: `Offline sale/movement on terminal ${input.deviceId} deducted ${Math.abs(delta)} units of "${listing?.name || product?.name}", exceeding available cloud stock (${currentAuthoritativeQty}) by ${oversoldAmount} unit(s).`,
            },
        });
        conflictRecordId = conflict.id;
        // Increment device conflict counter
        await db.registeredDevice
            .updateMany({
            where: {
                companyId: input.companyId,
                deviceId: input.deviceId,
            },
            data: {
                conflictCount: { increment: 1 },
            },
        })
            .catch(() => null);
    }
    // Emit change log so all devices pull the updated stock projection
    await (0, changeLogService_1.appendSyncChange)({
        companyId: input.companyId,
        storeId: input.storeId || null,
        entityType: "INVENTORY",
        entityId: listing?.id || resolvedProductId || "UNKNOWN",
        changeType: "UPDATED",
        payload: {
            marketplaceListingId: listing?.id || null,
            productId: resolvedProductId,
            cloudAuthoritativeStock: clampedDisplayQty,
            lastDelta: delta,
            lastMovementType: input.movementType,
            oversoldDiscrepancy: isOversell ? oversoldAmount : 0,
            updatedAt: new Date().toISOString(),
        },
        sourceDeviceId: input.deviceId,
        sourceOperationId: input.operationId,
        actorId: input.actorId || null,
    }, db);
    return {
        applied: true,
        oversold: isOversell,
        oversoldAmount,
        previousQuantity: currentAuthoritativeQty,
        newQuantity: clampedDisplayQty,
        productId: resolvedProductId,
        marketplaceListingId: listing?.id || null,
        inventoryItemId: invItem?.id || null,
        inventoryLogId,
        conflictRecordId,
    };
}
exports.applyAuthoritativeStockMovement = applyAuthoritativeStockMovement;
