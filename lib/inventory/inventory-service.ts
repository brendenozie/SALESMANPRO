/**
 * lib/inventory/inventory-service.ts
 *
 * Single Authoritative Source of Truth for SalesmanPro & Ghuba Marketplace Inventory.
 *
 * Accounting Convention:
 * - onHandQty (`InventoryItem.quantity` === `Product.quantity`):
 *     Total physical sellable stock currently held in the store/warehouse.
 *     Damaged and written-off units are excluded/deducted from `onHandQty` at the time
 *     of recording and tracked in `InventoryLog.damaged` so they are never subtracted twice.
 * - reservedQty:
 *     Stock committed to approved outbound transfers (status = APPROVED) not yet dispatched.
 * - inTransitQty:
 *     Stock dispatched in outbound transfers (status = IN_TRANSIT) awaiting receipt.
 * - agentAllocatedQty:
 *     Stock currently held by field Sales Agents (`AgentInventory.quantity`).
 * - availableQty = Math.max(0, onHandQty - reservedQty):
 *     Net stock available for new customer orders, transfers, and Ghuba Marketplace listings.
 */

import crypto from "crypto";
import prisma from "@/server/db/prismadb";
import { cacheDel } from "@/lib/cache";

export type InventoryMovementType =
  | "OPENING_STOCK"
  | "PURCHASE_RECEIPT"
  | "RESTOCK"
  | "STOCK_ADDITION"
  | "STOCK_REDUCTION"
  | "STOCKTAKE_ADJUSTMENT"
  | "TRANSFER_OUT"
  | "TRANSFER_IN"
  | "SALE"
  | "POS_SALE"
  | "ORDER_RESERVATION"
  | "ORDER_RELEASE"
  | "ORDER_CANCELLATION"
  | "CUSTOMER_RETURN"
  | "SUPPLIER_RETURN"
  | "AGENT_ASSIGN"
  | "AGENT_RETURN"
  | "DAMAGE"
  | "WRITE_OFF"
  | "STOCK_CORRECTION";

export interface InventoryLedgerMeta {
  referenceId?: string | null;
  referenceType?: string | null;
  movementType?: InventoryMovementType | string;
  productId?: string;
  variant?: string | null;
  companyId?: string;
  warehouseName?: string | null;
  locationId?: string | null;
  sourceLocation?: string | null;
  destinationLocation?: string | null;
  previousQuantity?: number;
  newQuantity?: number;
  delta?: number;
  damaged?: number;
  damagedQuantity?: number;
  actorId?: string | null;
  actorName?: string | null;
  reason?: string | null;
  relatedOrderId?: string | null;
  relatedTransferId?: string | null;
  relatedStocktakeId?: string | null;
  idempotencyKey?: string | null;
  timestamp?: string;
}

const META_SEPARATOR = " ||META:";

export function generateMovementRef(prefix = "MOV"): string {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${datePart}-${rand}`;
}

export function formatLedgerDetails(
  humanSummary: string,
  meta: InventoryLedgerMeta = {},
): string {
  const enriched: InventoryLedgerMeta = {
    referenceId: meta.referenceId || generateMovementRef("MOV"),
    timestamp: meta.timestamp || new Date().toISOString(),
    damaged: meta.damaged ?? meta.damagedQuantity ?? 0,
    damagedQuantity: meta.damagedQuantity ?? meta.damaged ?? 0,
    ...meta,
  };
  return `${humanSummary}${META_SEPARATOR}${JSON.stringify(enriched)}`;
}

export function parseLedgerDetails(rawDetails?: string | null): {
  summary: string;
  meta: Partial<InventoryLedgerMeta> | null;
} {
  if (!rawDetails) return { summary: "", meta: null };
  const idx = rawDetails.indexOf(META_SEPARATOR);
  if (idx === -1) {
    return { summary: rawDetails, meta: null };
  }
  const summary = rawDetails.slice(0, idx).trim();
  const jsonStr = rawDetails.slice(idx + META_SEPARATOR.length).trim();
  try {
    return { summary, meta: JSON.parse(jsonStr) };
  } catch {
    return { summary: rawDetails, meta: null };
  }
}

/**
 * Ensures an authoritative InventoryItem exists for a Product + Company,
 * reconciling initial quantity if missing.
 */
export async function ensureInventoryItemTx(
  tx: any,
  productId: string,
  companyId: string,
  fallbackQty?: number,
  reorderThreshold?: number,
) {
  let invItem = await tx.inventoryItem.findFirst({
    where: { productId, companyId },
  });

  if (!invItem) {
    invItem = await tx.inventoryItem.findFirst({
      where: { productId },
    });
  }

  if (!invItem) {
    const prod = await tx.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    });
    const initialQty = Math.max(0, fallbackQty ?? prod?.quantity ?? 0);
    invItem = await tx.inventoryItem.create({
      data: {
        productId,
        companyId,
        quantity: initialQty,
        reorderThreshold: reorderThreshold ?? 10,
      },
    });
  }

  return invItem;
}

/**
 * Synchronizes all attached Ghuba / storefront marketplaceListings for a Product
 * inside or outside a transaction.
 * Supports both `(tx, productId, onHandQty, reservedQty)` and `(tx, productId, companyId, onHandQty, reservedQty)`.
 * Never overwrites custom listing titles, descriptions, SEO, or prices.
 */
export async function syncMarketplaceListingsTx(
  tx: any,
  productId: string,
  companyIdOrOnHandQty: string | number,
  onHandQtyOrReservedQty: number = 0,
  maybeReservedQty: number = 0,
) {
  const onHandQty =
    typeof companyIdOrOnHandQty === "number"
      ? companyIdOrOnHandQty
      : Number(onHandQtyOrReservedQty || 0);
  const reservedQty =
    typeof companyIdOrOnHandQty === "number"
      ? Number(onHandQtyOrReservedQty || 0)
      : Number(maybeReservedQty || 0);

  const availableQty = Math.max(0, onHandQty - reservedQty);
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: { id: true, status: true, isAvailable: true },
  });

  if (!product) return { syncedCount: 0, availableQty };

  const productActive =
    product.status !== "INACTIVE" && product.status !== "ARCHIVED";
  const listings = await tx.marketplaceListings.findMany({
    where: { productId },
    select: { id: true, status: true, listingSystemStatus: true },
  });

  let syncedCount = 0;
  for (const listing of listings) {
    const listingActive =
      listing.status === "ACTIVE" &&
      listing.listingSystemStatus !== "INACTIVE";
    const derivedAvailable = Boolean(
      productActive && listingActive && availableQty > 0,
    );
    await tx.marketplaceListings.update({
      where: { id: listing.id },
      data: {
        quantity: availableQty,
        isAvailable: derivedAvailable,
        listingMarketStatus: derivedAvailable ? "AVAILABLE" : "SOLD",
        updatedAt: new Date(),
      },
    });
    syncedCount++;
  }

  return { syncedCount, availableQty };
}

/**
 * Purges all tenant & admin inventory and marketplace caches so UI updates immediately.
 */
export async function invalidateInventoryCaches(
  companyId: string,
  slug?: string | null,
) {
  if (!companyId) return;
  try {
    await Promise.all([
      cacheDel(`tenant:${companyId}:get-all-inventory:*`),
      cacheDel(`tenant:${companyId}:inventory_label_products:*`),
      cacheDel(`tenant:${companyId}:products:*`),
      cacheDel(`tenant:${companyId}:admin_products:*`),
      cacheDel(`tenant:${companyId}:listings:*`),
      cacheDel(`tenant:${companyId}:pos_marketplace_listings:*`),
      cacheDel(`tenant:${companyId}:inventory:*`),
      cacheDel(`tenant:${companyId}:post-restock:*`),
      cacheDel(`admin:get-all-inventory:*`),
      cacheDel(`admin:post-product:*`),
      cacheDel(`admin:post-restock:*`),
      cacheDel(`shop:products:${companyId}:*`),
    ]);
  } catch (err) {
    console.warn("[INVENTORY_CACHE_INVALIDATE_WARN]", err);
  }

  if (slug) {
    try {
      const { revalidateCompanyCache } = await import("@/lib/company-fetcher");
      await revalidateCompanyCache(slug);
    } catch {}
  }
}

/**
 * Normalizes a raw Prisma Product (with `inventoryItems`, `AgentInventory`, `productCategory`, `marketplaceListings`)
 * into the exact shape expected by AdminInventoryClient, Modals, StockAuditClient, StockTransferClient, and APIs.
 */
export function normalizeInventoryProductRecord(p: any) {
  const inventoryItems = Array.isArray(p.inventoryItems)
    ? p.inventoryItems
    : [];

  const primaryInv =
    inventoryItems.find((it: any) => it.companyId === p.companyId) ||
    inventoryItems[0] ||
    null;

  const inventoryIds = inventoryItems.map((inv: any) => inv.id);

  // Authoritative company warehouse stock: sum of InventoryItem.quantity if present, else Product.quantity
  const companyStock =
    inventoryItems.length > 0
      ? inventoryItems.reduce(
          (sum: number, inv: any) => sum + Math.max(0, Number(inv.quantity || 0)),
          0,
        )
      : Math.max(0, Number(p.quantity || 0));

  // Authoritative field agent allocated stock
  const agentStock = inventoryItems.reduce(
    (sum: number, inv: any) =>
      sum +
      (Array.isArray(inv.AgentInventory)
        ? inv.AgentInventory.reduce(
            (aSum: number, ai: any) => aSum + Math.max(0, Number(ai.quantity || 0)),
            0,
          )
        : 0),
    0,
  );

  const reorderThreshold = Number(primaryInv?.reorderThreshold ?? 10);

  // Recent ledger logs attached to inventoryItems
  const rawLogs = inventoryItems.flatMap((inv: any) =>
    Array.isArray(inv.inventoryLogs) ? inv.inventoryLogs : [],
  );
  const recentLogs = rawLogs
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 15)
    .map((log: any) => {
      const parsed = parseLedgerDetails(log.details);
      return {
        id: log.id,
        action: log.action,
        movementType: parsed.meta?.movementType || log.action,
        quantity: log.quantity,
        damaged: log.damaged || parsed.meta?.damaged || 0,
        previousQuantity: parsed.meta?.previousQuantity ?? null,
        newQuantity: parsed.meta?.newQuantity ?? null,
        delta: parsed.meta?.delta ?? null,
        reason: parsed.meta?.reason || parsed.summary || log.action,
        summary: parsed.summary || log.action,
        actorName: parsed.meta?.actorName || log.user?.name || "System",
        referenceId: parsed.meta?.referenceId || null,
        createdAt:
          log.createdAt instanceof Date
            ? log.createdAt.toISOString()
            : log.createdAt,
      };
    });

  const storeCategories = Array.isArray(p.productCategory?.StoreCategory)
    ? p.productCategory.StoreCategory
    : [];
  const overrideCat =
    storeCategories.find((sc: any) => sc.companyId === p.companyId) || null;

  const categoryDisplayName =
    overrideCat?.displayName ||
    p.productCategory?.name ||
    p.category ||
    "General";

  const categoryObj = {
    id: overrideCat?.id || p.productCategoryId || "",
    displayName: categoryDisplayName,
    name: categoryDisplayName,
    ...(overrideCat || {}),
  };

  const sku =
    p.sku ||
    p.model ||
    p.isbn ||
    p.vin ||
    `SKU-${String(p.id).slice(-8).toUpperCase()}`;

  const productItem = {
    id: p.id,
    companyId: p.companyId || "",
    name: p.name || "Untitled Product",
    sku,
    description: p.description || "",
    longDescription: p.longDescription || "",
    tags: Array.isArray(p.tags) ? p.tags : [],
    category: categoryObj,
    productCategoryId: p.productCategoryId || "",
    subCategory: p.subCategory || null,
    subCategoryName: p.subCategoryName || "",
    brand: p.brand || null,
    model: p.model || "",
    color: p.color || null,
    size: p.size || null,
    weight: p.weight || "",
    condition: p.condition || "",
    dimensions: p.dimensions || "",
    material: p.material || null,
    images: Array.isArray(p.images) ? p.images : [],
    videos: p.videos || null,
    digitalUrl: p.digitalUrl || "",
    autoDeliver: Boolean(p.autoDeliver),
    isAvailable: companyStock > 0 && p.status !== "INACTIVE",
    isOnOffer: Boolean(p.isOnOffer),
    isFlashDeal: Boolean(p.isFlashDeal),
    isNewArrival: Boolean(p.isNewArrival),
    isDiscounted: Boolean(p.isDiscounted),
    isFeatured: Boolean(p.isFeatured),
    showOnGhuba: Boolean(
      p.showOnGhuba ||
        (Array.isArray(p.marketplaceListings) &&
          p.marketplaceListings.some((l: any) => l.showOnGhuba || l.status === "ACTIVE")),
    ),
    costPrice: Number(p.costPrice || 0),
    sellingPrice: Number(p.sellingPrice || 0),
    discount: Number(p.discount || 0),
    finalPrice: Number(p.finalPrice || p.sellingPrice || 0),
    profitMargin: Number(p.profitMargin || 0),
    pricingTiers: p.pricingTiers || [],
    startDealDate:
      p.startDealDate instanceof Date
        ? p.startDealDate.toISOString()
        : p.startDealDate || null,
    endDealDate:
      p.endDealDate instanceof Date
        ? p.endDealDate.toISOString()
        : p.endDealDate || null,
    commissionRate: Number(p.CommissionRate?.commissionRate || 0),
    commissionType: p.CommissionRate?.commissionType || "COST",
    make: p.make || "",
    trim: p.trim || "",
    type: p.type || "",
    mileage: p.mileage || "",
    engineType: p.engineType || "",
    engineSize: Number(p.engineSize || 0),
    horsepower: Number(p.horsepower || 0),
    torque: Number(p.torque || 0),
    fuelType: p.fuelType || "",
    fuelEconomy: p.fuelEconomy || "",
    transmission: p.transmission || "",
    drivetrain: p.drivetrain || "",
    vin: p.vin || "",
    logbookStatus: p.logbookStatus || "",
    supplierId: p.supplierId || null,
    supplierName: p.supplierName || p.supplier?.name || null,
    marketplaceListings: Array.isArray(p.marketplaceListings)
      ? p.marketplaceListings
      : [],
    reorderThreshold,
  };

  return {
    ...productItem,
    id: p.id,
    name: p.name || "Untitled Product",
    sku,
    companyId: p.companyId || "",
    inventoryId: primaryInv?.id || null,
    inventoryIds,
    companyStock,
    agentStock,
    totalStock: companyStock + agentStock,
    reorderThreshold,
    sales: 0,
    costPrice: Number(p.costPrice || 0),
    sellingPrice: Number(p.sellingPrice || 0),
    salesPrice: Number(p.sellingPrice || 0),
    category: categoryObj,
    productItem,
    recentLogs,
    metrics: {
      onHandQty: companyStock,
      availableQty: companyStock,
      agentAllocatedQty: agentStock,
      reorderThreshold,
      isLowStock: companyStock > 0 && companyStock <= reorderThreshold,
      isOutOfStock: companyStock <= 0,
    },
    createdAt:
      p.createdAt instanceof Date
        ? p.createdAt.toISOString()
        : p.createdAt || new Date().toISOString(),
    updatedAt:
      p.updatedAt instanceof Date
        ? p.updatedAt.toISOString()
        : p.updatedAt || new Date().toISOString(),
  };
}

/**
 * Authoritative query for all inventory products of a company.
 * Used by both `/admin/[slug]/inventory/page.tsx` and `GET /api/admin/get-all-inventory`.
 * Self-heals missing `InventoryItem` rows and reconciles `Product.quantity` + `marketplaceListings.quantity`.
 */
export async function fetchCompanyInventoryProducts(
  companyId: string,
  options: { page?: number; limit?: number } = {},
) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 100);
  const skip = (page - 1) * limit;

  if (!companyId) {
    return {
      results: [],
      paging: { page, limit, total: 0, totalPages: 1 },
    };
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where: { companyId } }),
    prisma.product.findMany({
      where: { companyId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        inventoryItems: {
          include: {
            AgentInventory: true,
            inventoryLogs: {
              orderBy: { createdAt: "desc" },
              take: 10,
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
        productCategory: {
          include: {
            StoreCategory: true,
          },
        },
        CommissionRate: true,
        marketplaceListings: {
          select: {
            id: true,
            name: true,
            status: true,
            ghubaStatus: true,
            showOnGhuba: true,
            isAvailable: true,
            quantity: true,
            sellingPrice: true,
            finalPrice: true,
            listingMarketStatus: true,
            listingSystemStatus: true,
            updatedAt: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  // Self-heal missing InventoryItem rows and drift between Product.quantity, InventoryItem.quantity, and marketplaceListings
  const healPromises: Promise<any>[] = [];
  for (const p of products) {
    const primaryInv =
      p.inventoryItems.find((it) => it.companyId === companyId) ||
      p.inventoryItems[0];

    if (!primaryInv) {
      const initialQty = Math.max(0, Number(p.quantity ?? 0));
      healPromises.push(
        prisma.inventoryItem
          .create({
            data: {
              productId: p.id,
              companyId,
              quantity: initialQty,
              reorderThreshold: 10,
            },
          })
          .then((createdInv) => {
            p.inventoryItems.push({
              ...createdInv,
              AgentInventory: [],
              inventoryLogs: [],
            } as any);
          })
          .catch(() => null),
      );
    } else {
      const authoritativeQty = Math.max(0, Number(primaryInv.quantity ?? 0));
      if (p.quantity !== authoritativeQty) {
        p.quantity = authoritativeQty;
        healPromises.push(
          prisma.product
            .update({
              where: { id: p.id },
              data: {
                quantity: authoritativeQty,
                isAvailable: authoritativeQty > 0,
              },
            })
            .catch(() => null),
        );
      }

      // Also heal any attached marketplaceListing whose quantity drifted from authoritativeQty
      if (Array.isArray(p.marketplaceListings)) {
        for (const listing of p.marketplaceListings) {
          const shouldBeAvailable =
            listing.status === "ACTIVE" &&
            listing.listingSystemStatus !== "INACTIVE" &&
            authoritativeQty > 0;
          if (
            listing.quantity !== authoritativeQty ||
            listing.isAvailable !== shouldBeAvailable
          ) {
            listing.quantity = authoritativeQty;
            listing.isAvailable = shouldBeAvailable;
            healPromises.push(
              prisma.marketplaceListings
                .update({
                  where: { id: listing.id },
                  data: {
                    quantity: authoritativeQty,
                    isAvailable: shouldBeAvailable,
                    listingMarketStatus: shouldBeAvailable
                      ? "AVAILABLE"
                      : "SOLD",
                  },
                })
                .catch(() => null),
            );
          }
        }
      }
    }
  }

  if (healPromises.length > 0) {
    await Promise.allSettled(healPromises);
  }

  const results = products.map(normalizeInventoryProductRecord);

  return {
    results,
    paging: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export interface StockMutationInput {
  companyId: string;
  productId: string;
  movementType: InventoryMovementType;
  quantityDelta?: number;
  targetQuantity?: number;
  damaged?: number;
  damagedQuantity?: number;
  reorderThreshold?: number;
  reason?: string;
  warehouseName?: string | null;
  locationId?: string | null;
  sourceLocation?: string | null;
  destinationLocation?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  relatedOrderId?: string | null;
  relatedTransferId?: string | null;
  relatedStocktakeId?: string | null;
  idempotencyKey?: string | null;
  allowNegative?: boolean;
}

/**
 * Executes an atomic, auditable stock adjustment across:
 * 1. `InventoryItem.quantity` (and `reorderThreshold` if provided)
 * 2. `Product.quantity` and `Product.isAvailable`
 * 3. `marketplaceListings.quantity` and `marketplaceListings.isAvailable`
 * 4. `InventoryLog` movement ledger entry
 */
export async function executeStockMutation(input: StockMutationInput) {
  const {
    companyId,
    productId,
    movementType,
    quantityDelta,
    targetQuantity,
    damaged,
    damagedQuantity,
    reorderThreshold,
    reason,
    warehouseName,
    locationId,
    sourceLocation,
    destinationLocation,
    actorId,
    actorName,
    supplierId,
    supplierName,
    referenceId: inputReferenceId,
    referenceType,
    relatedOrderId,
    relatedTransferId,
    relatedStocktakeId,
    idempotencyKey,
    allowNegative = false,
  } = input;

  const resolvedDamaged = Math.max(
    0,
    Number(damaged ?? damagedQuantity ?? 0),
  );

  const result = await prisma.$transaction(
    async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, companyId },
      });

      if (!product) {
        throw new Error(
          `Product ${productId} not found in company ${companyId}`,
        );
      }

      const invItem = await ensureInventoryItemTx(
        tx,
        productId,
        companyId,
        product.quantity,
        reorderThreshold,
      );

      const previousQuantity = Math.max(
        0,
        Number(invItem.quantity ?? product.quantity ?? 0),
      );
      let newQuantity = previousQuantity;

      if (targetQuantity !== undefined && targetQuantity !== null) {
        if (!allowNegative && targetQuantity < 0) {
          throw new Error("Stock quantity cannot be negative.");
        }
        newQuantity = Math.floor(Number(targetQuantity));
      } else if (quantityDelta !== undefined && quantityDelta !== null) {
        newQuantity = previousQuantity + Math.floor(Number(quantityDelta));
        if (!allowNegative && newQuantity < 0) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${previousQuantity}, Requested reduction: ${Math.abs(
              quantityDelta,
            )}`,
          );
        }
      }

      const delta = newQuantity - previousQuantity;
      const referenceId =
        inputReferenceId ||
        generateMovementRef(
          movementType === "STOCKTAKE_ADJUSTMENT"
            ? "STK"
            : movementType.startsWith("TRANSFER")
              ? "TRF"
              : "ADJ",
        );

      // 1. Update InventoryItem
      const updatedInvItem = await tx.inventoryItem.update({
        where: { id: invItem.id },
        data: {
          quantity: newQuantity,
          ...(reorderThreshold !== undefined && reorderThreshold !== null
            ? { reorderThreshold: Math.max(0, Number(reorderThreshold)) }
            : {}),
          updatedAt: new Date(),
        },
      });

      // 2. Update Product
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: {
          quantity: newQuantity,
          isAvailable: newQuantity > 0,
          ...(supplierId ? { supplier: { connect: { id: supplierId } } } : {}),
          ...(supplierName !== undefined
            ? { supplierName: supplierName || null }
            : {}),
          updatedAt: new Date(),
        },
      });

      // 3. Synchronize attached Ghuba Marketplace Listings
      const marketplaceSync = await syncMarketplaceListingsTx(
        tx,
        product.id,
        newQuantity,
      );

      // 4. Record auditable InventoryLog entry
      const meta: InventoryLedgerMeta = {
        referenceId,
        referenceType: referenceType || "ADJUSTMENT",
        movementType,
        productId: product.id,
        companyId,
        warehouseName: warehouseName || sourceLocation || "Main Warehouse",
        locationId: locationId || null,
        sourceLocation: sourceLocation || warehouseName || "Main Warehouse",
        destinationLocation: destinationLocation || null,
        previousQuantity,
        newQuantity,
        delta,
        damaged: resolvedDamaged,
        damagedQuantity: resolvedDamaged,
        actorId: actorId || null,
        actorName: actorName || null,
        reason: reason || null,
        relatedOrderId: relatedOrderId || null,
        relatedTransferId: relatedTransferId || null,
        relatedStocktakeId: relatedStocktakeId || null,
        idempotencyKey: idempotencyKey || null,
        timestamp: new Date().toISOString(),
      };

      const sign = delta >= 0 ? `+${delta}` : `${delta}`;
      const humanSummary = `[${movementType}] ${
        reason || "Stock update"
      } (${sign} units | ${previousQuantity} → ${newQuantity}) • Ref: ${referenceId}`;

      const logEntry = await tx.inventoryLog.create({
        data: {
          inventoryId: invItem.id,
          action: movementType,
          quantity: Math.abs(delta),
          damaged: resolvedDamaged,
          details: formatLedgerDetails(humanSummary, meta),
          ...(actorId && /^[0-9a-fA-F]{24}$/.test(actorId)
            ? { userId: actorId }
            : {}),
        },
      });

      return {
        referenceId,
        productId: product.id,
        productName: product.name,
        inventoryId: updatedInvItem.id,
        inventoryItemId: updatedInvItem.id,
        previousQuantity,
        newQuantity,
        delta,
        damaged: resolvedDamaged,
        reorderThreshold: updatedInvItem.reorderThreshold,
        marketplaceSyncedCount: marketplaceSync.syncedCount,
        logEntry,
        product: updatedProduct,
      };
    },
    { maxWait: 10000, timeout: 20000 },
  );

  await invalidateInventoryCaches(companyId);
  return result;
}

/**
 * Restores deducted inventory when a CustomerOrder transitions from a non-cancelled state to CANCELLED.
 * Idempotent: checks InventoryLog so an order's stock is never restored twice.
 */
export async function restoreOrderInventoryOnCancellation(
  orderId: string,
  companyId?: string | null,
  actorId?: string | null,
) {
  if (!orderId) return { restoredItems: 0 };

  const order = await prisma.customerOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          marketplaceListing: {
            select: {
              id: true,
              productId: true,
              companyId: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!order || !order.items || order.items.length === 0) {
    return { restoredItems: 0 };
  }

  let restoredItems = 0;
  const affectedCompanies = new Set<string>();

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const listing = item.marketplaceListing;
      if (!listing) continue;
      if (companyId && listing.companyId && listing.companyId !== companyId) {
        continue;
      }

      const targetCompanyId = listing.companyId || order.companyId;
      const productId = listing.productId;
      const qtyToRestore = Math.max(0, Number(item.quantity || 0));
      if (qtyToRestore <= 0) continue;

      if (productId && targetCompanyId) {
        const inv = await ensureInventoryItemTx(tx, productId, targetCompanyId);

        // Guard against duplicate restoration for the same orderId + inventoryId
        const existingRestoreLog = await tx.inventoryLog.findFirst({
          where: {
            inventoryId: inv.id,
            action: "ORDER_CANCELLATION",
            details: { contains: orderId },
          },
        });
        if (existingRestoreLog) continue;

        const prevQty = Math.max(0, Number(inv.quantity || 0));
        const newQty = prevQty + qtyToRestore;

        await tx.inventoryItem.update({
          where: { id: inv.id },
          data: { quantity: newQty, updatedAt: new Date() },
        });

        await tx.product.update({
          where: { id: productId },
          data: {
            quantity: newQty,
            isAvailable: newQty > 0,
            updatedAt: new Date(),
          },
        });

        await syncMarketplaceListingsTx(tx, productId, newQty);

        await tx.inventoryLog.create({
          data: {
            inventoryId: inv.id,
            action: "ORDER_CANCELLATION",
            quantity: qtyToRestore,
            damaged: 0,
            details: formatLedgerDetails(
              `Order #${orderId.slice(-6)} cancelled — restored +${qtyToRestore} units (${prevQty} → ${newQty})`,
              {
                movementType: "ORDER_CANCELLATION",
                productId,
                companyId: targetCompanyId,
                previousQuantity: prevQty,
                newQuantity: newQty,
                delta: qtyToRestore,
                relatedOrderId: orderId,
                referenceId: `ORD-CNL-${orderId.slice(-6).toUpperCase()}`,
                actorId: actorId || "system",
                reason: `Order #${orderId} cancelled`,
              },
            ),
          },
        });

        affectedCompanies.add(targetCompanyId);
        restoredItems++;
      } else {
        // Standalone marketplaceListing without linked productId
        const currentListing = await tx.marketplaceListings.findUnique({
          where: { id: listing.id },
          select: { quantity: true, status: true },
        });
        const newListingQty =
          Math.max(0, Number(currentListing?.quantity || 0)) + qtyToRestore;
        await tx.marketplaceListings.update({
          where: { id: listing.id },
          data: {
            quantity: newListingQty,
            isAvailable: newListingQty > 0,
            listingMarketStatus:
              newListingQty > 0 ? "AVAILABLE" : "SOLD",
            updatedAt: new Date(),
          },
        });
        if (targetCompanyId) affectedCompanies.add(targetCompanyId);
        restoredItems++;
      }
    }
  });

  for (const cid of affectedCompanies) {
    await invalidateInventoryCaches(cid);
  }

  return { restoredItems };
}
