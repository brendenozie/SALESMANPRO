import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { resolveAuthorizedCompany } from "@/lib/auth/companyAccess";
import {
  ensureInventoryItemTx,
  syncMarketplaceListingsTx,
  formatLedgerDetails,
  invalidateInventoryCaches,
} from "@/lib/inventory/inventory-service";

export interface TransferMeta {
  destinationType: "STORE" | "AGENT" | "LOCATION";
  toCompanyId?: string;
  toCompanyName?: string;
  toAgentId?: string;
  toAgentName?: string;
  toLocationId?: string;
  toLocationName?: string;
  destinationName?: string;
  cleanNotes?: string;
}

const TRANSFER_META_PREFIX = "||TMETA:";

function encodeTransferNotes(
  cleanNotes: string | null | undefined,
  meta: TransferMeta,
): string {
  return `${cleanNotes || ""}${TRANSFER_META_PREFIX}${JSON.stringify(meta)}`;
}

function decodeTransferNotes(rawNotes?: string | null): {
  cleanNotes: string;
  meta: TransferMeta;
} {
  if (!rawNotes) {
    return {
      cleanNotes: "",
      meta: { destinationType: "LOCATION", cleanNotes: "" },
    };
  }
  const idx = rawNotes.indexOf(TRANSFER_META_PREFIX);
  if (idx === -1) {
    // Also support legacy [META:{...}] format if present
    const legacyMatch = rawNotes.match(/^\[META:(\{[\s\S]*?\})\]\s*([\s\S]*)$/);
    if (legacyMatch) {
      try {
        const parsed = JSON.parse(legacyMatch[1]);
        return {
          cleanNotes: legacyMatch[2] || "",
          meta: {
            destinationType: parsed.destinationType || "LOCATION",
            ...parsed,
            cleanNotes: legacyMatch[2] || "",
          },
        };
      } catch {}
    }
    return {
      cleanNotes: rawNotes,
      meta: { destinationType: "LOCATION", cleanNotes: rawNotes },
    };
  }
  const cleanNotes = rawNotes.slice(0, idx).trim();
  const jsonPart = rawNotes.slice(idx + TRANSFER_META_PREFIX.length).trim();
  try {
    const parsed = JSON.parse(jsonPart);
    return {
      cleanNotes,
      meta: {
        destinationType: parsed.destinationType || "LOCATION",
        ...parsed,
        cleanNotes,
      },
    };
  } catch {
    return {
      cleanNotes: rawNotes,
      meta: { destinationType: "LOCATION", cleanNotes: rawNotes },
    };
  }
}

function generateTransferNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRF-${dateStr}-${rand}`;
}

function enrichTransferForClient(transfer: any) {
  const { cleanNotes, meta } = decodeTransferNotes(transfer.notes);
  const destType = meta.destinationType || "LOCATION";
  const destName =
    meta.destinationName ||
    meta.toCompanyName ||
    meta.toAgentName ||
    meta.toLocationName ||
    destType;

  return {
    ...transfer,
    fromCompanyId: transfer.companyId,
    destinationType: destType,
    toCompanyId: meta.toCompanyId || null,
    toAgentId: meta.toAgentId || null,
    destinationName: destName,
    notes: cleanNotes,
    meta: {
      ...meta,
      destinationType: destType,
      cleanNotes,
    },
    items: Array.isArray(transfer.items)
      ? transfer.items.map((it: any) => ({
          ...it,
          description: it.description || it.productName || "Product",
          productName: it.description || it.productName || "Product",
        }))
      : [],
  };
}

/**
 * GET /api/stock-transfer?companyId=...&status=...
 * Lists all stock transfers for a company, plus available destination locations, agents, sister stores, and store products.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedCompanyId = searchParams.get("companyId");
    const statusFilter = searchParams.get("status");

    const access = await resolveAuthorizedCompany(
      session.user as any,
      requestedCompanyId,
    );
    if (!access.authorized || !access.companyId) {
      return NextResponse.json(
        { error: access.error || "Forbidden" },
        { status: access.status || 403 },
      );
    }

    const companyId = access.companyId;

    const whereClause: any = {
      OR: [
        { companyId },
        { notes: { contains: `"toCompanyId":"${companyId}"` } },
      ],
    };

    if (statusFilter && statusFilter !== "ALL") {
      whereClause.status = statusFilter;
    }

    const [rawTransfers, companyRecord, locations, agents, rawProducts] =
      await Promise.all([
        prisma.stockTransfer.findMany({
          where: whereClause,
          include: {
            items: true,
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        prisma.company.findUnique({
          where: { id: companyId },
          select: {
            id: true,
            userId: true,
            name: true,
            slug: true,
            address: true,
          },
        }),
        prisma.companyLocation
          .findMany({
            where: { companyId },
            include: {
              location: { select: { id: true, name: true } },
            },
          })
          .catch(() => []),
        prisma.salesAgent
          .findMany({
            where: { companyId },
            select: {
              id: true,
              loginCode: true,
              phoneNumber: true,
              isActive: true,
              user: { select: { id: true, name: true, email: true } },
            },
          })
          .catch(() => []),
        prisma.product
          .findMany({
            where: { companyId },
            include: {
              inventoryItems: {
                where: { companyId },
                select: { id: true, quantity: true },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 250,
          })
          .catch(() => []),
      ]);

    const rawSisterStores = companyRecord?.userId
      ? await prisma.company.findMany({
          where: {
            userId: companyRecord.userId,
            id: { not: companyId },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
          },
        })
      : [];

    const storesFormatted = rawSisterStores.map((s) => ({
      id: s.id,
      name: s.name || "Sister Store",
      companyName: s.name || "Sister Store",
      slug: s.slug || s.id,
      category: s.category || "Retail",
    }));

    const locationsFormatted =
      locations.length > 0
        ? locations.map((cl: any) => ({
            id: cl.id,
            name: cl.location?.name || cl.address || "Branch Location",
            address: cl.address,
            region: cl.location?.region || "",
            isPrimary: cl.isPrimary,
          }))
        : [
            {
              id: "loc-main-warehouse",
              name: "Main Warehouse",
              address: companyRecord?.address || "Headquarters",
              isPrimary: true,
            },
            {
              id: "loc-storefront-floor",
              name: "Storefront Display Floor",
              address: companyRecord?.address || "Retail Floor",
              isPrimary: false,
            },
          ];

    const productsFormatted = rawProducts.map((p: any) => {
      const stock =
        p.inventoryItems && p.inventoryItems.length > 0
          ? p.inventoryItems.reduce(
              (sum: number, inv: any) =>
                sum + Math.max(0, Number(inv.quantity || 0)),
              0,
            )
          : Math.max(0, Number(p.quantity || 0));
      return {
        id: p.id,
        name: p.name,
        sku: p.model || `SKU-${p.id.slice(-6).toUpperCase()}`,
        stock,
        costPrice: Number(p.costPrice || 0),
        sellingPrice: Number(p.sellingPrice || 0),
        category: p.category || "General",
        image: p.images?.[0] || undefined,
      };
    });

    return NextResponse.json({
      success: true,
      company: companyRecord
        ? {
            id: companyRecord.id,
            name: companyRecord.name,
            slug: companyRecord.slug || companyRecord.id,
          }
        : null,
      transfers: rawTransfers.map(enrichTransferForClient),
      products: productsFormatted,
      destinations: {
        locations: locationsFormatted,
        agents: agents.map((ag: any) => ({
          id: ag.id,
          name: ag.user?.name || ag.loginCode || "Sales Agent",
          email: ag.user?.email || "",
          phone: ag.phoneNumber || "",
          status: ag.isActive ? "ACTIVE" : "INACTIVE",
        })),
        stores: storesFormatted,
        sisterStores: storesFormatted,
      },
    });
  } catch (error: any) {
    console.error("[STOCK_TRANSFER_GET_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to load stock transfers" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/stock-transfer
 * Creates a new StockTransfer with source stock validation.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyId: requestedCompanyId,
      fromLocationId,
      destinationType = "LOCATION",
      toCompanyId,
      toCompanyName,
      toLocationId,
      toLocationName,
      toAgentId,
      toAgentName,
      destinationName,
      notes,
      items,
      autoApprove = true,
    } = body;

    const access = await resolveAuthorizedCompany(
      session.user as any,
      requestedCompanyId,
    );
    if (!access.authorized || !access.companyId) {
      return NextResponse.json(
        { error: access.error || "Forbidden" },
        { status: access.status || 403 },
      );
    }

    const fromCompanyId = access.companyId;

    if (!["LOCATION", "AGENT", "STORE"].includes(destinationType)) {
      return NextResponse.json(
        { error: "Valid destinationType (LOCATION, AGENT, STORE) is required" },
        { status: 400 },
      );
    }

    if (
      destinationType === "STORE" &&
      (!toCompanyId || toCompanyId === fromCompanyId)
    ) {
      return NextResponse.json(
        { error: "Source and destination store cannot be identical." },
        { status: 400 },
      );
    }
    if (
      destinationType === "LOCATION" &&
      fromLocationId &&
      toLocationId &&
      fromLocationId === toLocationId
    ) {
      return NextResponse.json(
        {
          error:
            "Source and destination warehouse location cannot be identical.",
        },
        { status: 400 },
      );
    }
    if (destinationType === "AGENT" && !toAgentId) {
      return NextResponse.json(
        {
          error:
            "Sales Agent destination (toAgentId) is required for AGENT transfers.",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one product item is required for transfer" },
        { status: 400 },
      );
    }

    const normalizedItems = items
      .map((item: any) => ({
        productId: String(item.productId || ""),
        productName: String(
          item.productName || item.description || "Product",
        ),
        sku: item.sku ? String(item.sku) : null,
        quantityRequested: Math.floor(Number(item.quantityRequested || 0)),
        unitCost: Number(item.unitCost || 0),
      }))
      .filter((it) => it.productId && it.quantityRequested > 0);

    if (normalizedItems.length === 0) {
      return NextResponse.json(
        {
          error:
            "Transfer quantities must be positive integers greater than zero.",
        },
        { status: 400 },
      );
    }

    // Validate available source stock for all requested items before creating transfer
    const productIds = normalizedItems.map((i) => i.productId);
    const sourceProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, companyId: fromCompanyId },
      include: {
        inventoryItems: {
          where: { companyId: fromCompanyId },
          select: { id: true, quantity: true },
        },
      },
    });
    const productById = new Map(sourceProducts.map((p) => [p.id, p]));

    for (const reqItem of normalizedItems) {
      const prod = productById.get(reqItem.productId);
      if (!prod) {
        return NextResponse.json(
          {
            error: `Product "${reqItem.productName}" does not belong to the source company.`,
          },
          { status: 400 },
        );
      }
      const availableStock =
        prod.inventoryItems.length > 0
          ? prod.inventoryItems.reduce(
              (s, inv) => s + Math.max(0, Number(inv.quantity || 0)),
              0,
            )
          : Math.max(0, Number(prod.quantity || 0));

      if (availableStock < reqItem.quantityRequested) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${prod.name}". Available: ${availableStock}, Requested: ${reqItem.quantityRequested}.`,
          },
          { status: 400 },
        );
      }
    }

    const transferNumber = generateTransferNumber();
    const userId = (session.user as any).id;
    const resolvedDestName =
      destinationName ||
      toCompanyName ||
      toAgentName ||
      toLocationName ||
      destinationType;

    const encodedNotes = encodeTransferNotes(notes, {
      destinationType: destinationType as any,
      toCompanyId: destinationType === "STORE" ? toCompanyId : undefined,
      toCompanyName:
        destinationType === "STORE" ? resolvedDestName : undefined,
      toAgentId: destinationType === "AGENT" ? toAgentId : undefined,
      toAgentName: destinationType === "AGENT" ? resolvedDestName : undefined,
      toLocationId: destinationType === "LOCATION" ? toLocationId : undefined,
      toLocationName:
        destinationType === "LOCATION" ? resolvedDestName : undefined,
      destinationName: resolvedDestName,
    });

    const created = await prisma.stockTransfer.create({
      data: {
        transferNumber,
        companyId: fromCompanyId,
        fromLocationId: fromLocationId || null,
        toLocationId: destinationType === "LOCATION" ? toLocationId : null,
        status: autoApprove ? "APPROVED" : "REQUESTED",
        notes: encodedNotes,
        requestedById: userId,
        approvedById: autoApprove ? userId : null,
        items: {
          create: normalizedItems.map((item) => ({
            productId: item.productId,
            description:
              productById.get(item.productId)?.name || item.productName,
            sku:
              item.sku ||
              productById.get(item.productId)?.model ||
              `SKU-${item.productId.slice(-6).toUpperCase()}`,
            quantityRequested: item.quantityRequested,
            quantityDispatched: 0,
            quantityReceived: 0,
            unitCost:
              item.unitCost ||
              Number(productById.get(item.productId)?.costPrice || 0),
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      transfer: enrichTransferForClient(created),
    });
  } catch (error: any) {
    console.error("[STOCK_TRANSFER_POST_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create stock transfer" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/stock-transfer
 * Transitions a StockTransfer through its lifecycle:
 * - APPROVE (from REQUESTED / DRAFT -> APPROVED)
 * - DISPATCH (from REQUESTED / APPROVED -> IN_TRANSIT)
 * - RECEIVE (from IN_TRANSIT -> RECEIVED)
 * - CANCEL (from DRAFT / REQUESTED / APPROVED / IN_TRANSIT -> CANCELLED, restoring IN_TRANSIT stock!)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const transferId = body.transferId || body.id;
    const {
      action,
      companyId: requestedCompanyId,
      receivedItems,
      notes: actionNotes,
    } = body as {
      action: "APPROVE" | "DISPATCH" | "RECEIVE" | "CANCEL";
      companyId?: string;
      receivedItems?: Array<{
        itemId?: string;
        productId?: string;
        quantityReceived: number;
      }>;
      notes?: string;
    };

    if (!transferId || !action) {
      return NextResponse.json(
        { error: "transferId (or id) and action are required" },
        { status: 400 },
      );
    }

    const access = await resolveAuthorizedCompany(
      session.user as any,
      requestedCompanyId,
    );
    if (!access.authorized || !access.companyId) {
      return NextResponse.json(
        { error: access.error || "Forbidden" },
        { status: access.status || 403 },
      );
    }

    const existing = await prisma.stockTransfer.findUnique({
      where: { id: transferId },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 },
      );
    }

    const { cleanNotes, meta } = decodeTransferNotes(existing.notes);
    const fromCompanyId = existing.companyId;
    const toCompanyId = meta.toCompanyId || fromCompanyId;
    const toAgentId = meta.toAgentId || null;
    const toLocationId = existing.toLocationId || meta.toLocationId || null;
    const destinationType = meta.destinationType || "LOCATION";
    const destinationName =
      meta.destinationName ||
      meta.toCompanyName ||
      meta.toAgentName ||
      meta.toLocationName ||
      destinationType;

    if (
      fromCompanyId !== access.companyId &&
      toCompanyId !== access.companyId
    ) {
      return NextResponse.json(
        { error: "Forbidden transfer access" },
        { status: 403 },
      );
    }

    const userId = (session.user as any).id;
    const actorName =
      (session.user as any).name || (session.user as any).email || "Admin";

    // --- 1. APPROVE ---
    if (action === "APPROVE") {
      if (existing.status !== "REQUESTED" && existing.status !== "DRAFT") {
        return NextResponse.json(
          {
            error: `Cannot approve a transfer in status "${existing.status}".`,
          },
          { status: 409 },
        );
      }
      const updated = await prisma.stockTransfer.update({
        where: { id: transferId },
        data: {
          status: "APPROVED",
          approvedById: userId,
        },
        include: { items: true },
      });
      return NextResponse.json({
        success: true,
        transfer: enrichTransferForClient(updated),
      });
    }

    // --- 2. CANCEL (with IN_TRANSIT stock rollback!) ---
    if (action === "CANCEL") {
      if (existing.status === "RECEIVED" || existing.status === "CANCELLED") {
        return NextResponse.json(
          {
            error: `Cannot cancel a transfer that is already "${existing.status}".`,
          },
          { status: 409 },
        );
      }

      const wasInTransit = existing.status === "IN_TRANSIT";

      const cancelled = await prisma.$transaction(async (tx) => {
        if (wasInTransit) {
          for (const item of existing.items) {
            if (!item.productId) continue;
            const qtyToRestore = Math.max(
              0,
              Number(item.quantityDispatched || item.quantityRequested || 0),
            );
            if (qtyToRestore <= 0) continue;

            const invItem = await ensureInventoryItemTx(
              tx,
              item.productId,
              fromCompanyId,
            );
            const prevQty = Math.max(0, Number(invItem.quantity || 0));
            const newQty = prevQty + qtyToRestore;

            await tx.inventoryItem.update({
              where: { id: invItem.id },
              data: { quantity: newQty, updatedAt: new Date() },
            });

            await tx.product.update({
              where: { id: item.productId },
              data: {
                quantity: newQty,
                isAvailable: newQty > 0,
                updatedAt: new Date(),
              },
            });

            await syncMarketplaceListingsTx(tx, item.productId, newQty);

            await tx.inventoryLog.create({
              data: {
                inventoryId: invItem.id,
                action: "TRANSFER_IN",
                quantity: qtyToRestore,
                damaged: 0,
                details: formatLedgerDetails(
                  `Cancelled in-transit transfer ${existing.transferNumber} — restored +${qtyToRestore} units to source (${prevQty} → ${newQty})`,
                  {
                    referenceId: existing.transferNumber,
                    referenceType: "TRANSFER_CANCEL",
                    movementType: "TRANSFER_IN",
                    productId: item.productId,
                    companyId: fromCompanyId,
                    sourceLocation: destinationName,
                    destinationLocation:
                      existing.fromLocationId || "Main Warehouse",
                    previousQuantity: prevQty,
                    newQuantity: newQty,
                    delta: qtyToRestore,
                    actorId: userId,
                    actorName,
                    reason:
                      actionNotes ||
                      `Cancelled in-transit transfer ${existing.transferNumber}`,
                    relatedTransferId: existing.id,
                  },
                ),
                ...(userId && /^[0-9a-fA-F]{24}$/.test(userId)
                  ? { userId }
                  : {}),
              },
            });
          }
        }

        const updatedCleanNotes = actionNotes
          ? `${cleanNotes ? cleanNotes + " | " : ""}Cancelled: ${actionNotes}`
          : cleanNotes;

        return tx.stockTransfer.update({
          where: { id: transferId },
          data: {
            status: "CANCELLED",
            notes: encodeTransferNotes(updatedCleanNotes, meta),
          },
          include: { items: true },
        });
      });

      if (wasInTransit) {
        await invalidateInventoryCaches(fromCompanyId);
      }

      return NextResponse.json({
        success: true,
        transfer: enrichTransferForClient(cancelled),
        stockRestored: wasInTransit,
      });
    }

    // --- 3. DISPATCH (Deduct from source warehouse & mark IN_TRANSIT) ---
    if (action === "DISPATCH") {
      if (existing.status !== "APPROVED" && existing.status !== "REQUESTED") {
        return NextResponse.json(
          {
            error: `Transfer ${existing.transferNumber} cannot be dispatched because its status is "${existing.status}".`,
          },
          { status: 409 },
        );
      }

      const dispatched = await prisma.$transaction(
        async (tx) => {
          for (const item of existing.items) {
            if (!item.productId) continue;
            const qtyToDispatch = Math.max(
              0,
              Number(item.quantityRequested || 0),
            );
            if (qtyToDispatch <= 0) continue;

            const prod = await tx.product.findFirst({
              where: { id: item.productId, companyId: fromCompanyId },
            });
            if (!prod) {
              throw new Error(
                `Source product "${item.description}" not found in source company.`,
              );
            }

            const invItem = await ensureInventoryItemTx(
              tx,
              prod.id,
              fromCompanyId,
              prod.quantity,
            );

            const prevQty = Math.max(
              0,
              Number(invItem.quantity ?? prod.quantity ?? 0),
            );
            if (prevQty < qtyToDispatch) {
              throw new Error(
                `Insufficient stock to dispatch "${item.description}". Available: ${prevQty}, Requested: ${qtyToDispatch}.`,
              );
            }

            const newQty = prevQty - qtyToDispatch;

            await tx.inventoryItem.update({
              where: { id: invItem.id },
              data: { quantity: newQty, updatedAt: new Date() },
            });

            await tx.product.update({
              where: { id: prod.id },
              data: {
                quantity: newQty,
                isAvailable: newQty > 0,
                updatedAt: new Date(),
              },
            });

            await syncMarketplaceListingsTx(tx, prod.id, newQty);

            await tx.inventoryLog.create({
              data: {
                inventoryId: invItem.id,
                action: "TRANSFER_OUT",
                quantity: qtyToDispatch,
                damaged: 0,
                details: formatLedgerDetails(
                  `Dispatched ${qtyToDispatch} units via ${existing.transferNumber} to ${destinationName} (${prevQty} → ${newQty})`,
                  {
                    referenceId: existing.transferNumber,
                    referenceType: "TRANSFER",
                    movementType: "TRANSFER_OUT",
                    productId: prod.id,
                    companyId: fromCompanyId,
                    sourceLocation:
                      existing.fromLocationId || "Main Warehouse",
                    destinationLocation: destinationName,
                    previousQuantity: prevQty,
                    newQuantity: newQty,
                    delta: -qtyToDispatch,
                    actorId: userId,
                    actorName,
                    reason:
                      cleanNotes ||
                      `Outbound stock transfer ${existing.transferNumber}`,
                    relatedTransferId: existing.id,
                  },
                ),
                ...(userId && /^[0-9a-fA-F]{24}$/.test(userId)
                  ? { userId }
                  : {}),
              },
            });

            await tx.stockTransferItem.update({
              where: { id: item.id },
              data: { quantityDispatched: qtyToDispatch },
            });
          }

          return tx.stockTransfer.update({
            where: { id: transferId },
            data: {
              status: "IN_TRANSIT",
              dispatchedAt: new Date(),
            },
            include: { items: true },
          });
        },
        { maxWait: 10000, timeout: 25000 },
      );

      await invalidateInventoryCaches(fromCompanyId);

      return NextResponse.json({
        success: true,
        transfer: enrichTransferForClient(dispatched),
      });
    }

    // --- 4. RECEIVE (Add to destination & mark RECEIVED) ---
    if (action === "RECEIVE") {
      if (existing.status !== "IN_TRANSIT") {
        return NextResponse.json(
          {
            error: `Transfer ${existing.transferNumber} cannot be received because its status is "${existing.status}" (must be IN_TRANSIT).`,
          },
          { status: 409 },
        );
      }

      const receivedOverrideMap = new Map<string, number>();
      if (Array.isArray(receivedItems)) {
        for (const ri of receivedItems) {
          const key = ri.itemId || ri.productId;
          if (key && typeof ri.quantityReceived === "number") {
            receivedOverrideMap.set(
              key,
              Math.max(0, Math.floor(ri.quantityReceived)),
            );
          }
        }
      }

      const received = await prisma.$transaction(
        async (tx) => {
          const shortfallSummaries: string[] = [];

          for (const item of existing.items) {
            if (!item.productId) continue;
            const itemName = item.description || "Product";
            const dispatchedQty =
              item.quantityDispatched || item.quantityRequested;
            const overrideQty =
              receivedOverrideMap.get(item.id) ??
              receivedOverrideMap.get(item.productId);
            const qtyReceived =
              overrideQty !== undefined
                ? Math.min(dispatchedQty, Math.max(0, overrideQty))
                : dispatchedQty;
            const shortfall = Math.max(0, dispatchedQty - qtyReceived);

            if (shortfall > 0) {
              shortfallSummaries.push(
                `${itemName}: dispatched ${dispatchedQty}, received ${qtyReceived} (shortfall ${shortfall})`,
              );
            }

            // A. Destination Type === "AGENT"
            if (destinationType === "AGENT" && toAgentId) {
              const sourceInv = await ensureInventoryItemTx(
                tx,
                item.productId,
                fromCompanyId,
              );

              if (qtyReceived > 0) {
                const existingAgentInv = await tx.agentInventory.findFirst({
                  where: {
                    salesAgentId: toAgentId,
                    inventoryItemId: sourceInv.id,
                  },
                });
                if (existingAgentInv) {
                  await tx.agentInventory.update({
                    where: { id: existingAgentInv.id },
                    data: {
                      quantity: { increment: qtyReceived },
                    },
                  });
                } else {
                  await tx.agentInventory.create({
                    data: {
                      salesAgentId: toAgentId,
                      inventoryItemId: sourceInv.id,
                      quantity: qtyReceived,
                    },
                  });
                }
              }

              await tx.inventoryLog.create({
                data: {
                  inventoryId: sourceInv.id,
                  action: "TRANSFER_IN",
                  quantity: qtyReceived,
                  damaged: shortfall,
                  details: formatLedgerDetails(
                    `Agent received ${qtyReceived}/${dispatchedQty} units via ${existing.transferNumber} at ${destinationName}`,
                    {
                      referenceId: existing.transferNumber,
                      referenceType: "TRANSFER",
                      movementType: "TRANSFER_IN",
                      productId: item.productId,
                      companyId: fromCompanyId,
                      sourceLocation:
                        existing.fromLocationId || "Main Warehouse",
                      destinationLocation: destinationName,
                      previousQuantity: sourceInv.quantity,
                      newQuantity: sourceInv.quantity,
                      delta: qtyReceived,
                      damaged: shortfall,
                      actorId: userId,
                      actorName,
                      reason: `Received by Sales Agent (${existing.transferNumber})`,
                      relatedTransferId: existing.id,
                    },
                  ),
                  ...(userId && /^[0-9a-fA-F]{24}$/.test(userId)
                    ? { userId }
                    : {}),
                },
              });
            }

            // B. Destination Type === "STORE" (Sister Store)
            else if (destinationType === "STORE" && toCompanyId) {
              const sourceProd = await tx.product.findUnique({
                where: { id: item.productId },
              });

              let destProd = await tx.product.findFirst({
                where: {
                  companyId: toCompanyId,
                  OR: [
                    { name: itemName },
                    ...(item.sku ? [{ model: item.sku }] : []),
                  ],
                },
              });

              if (!destProd) {
                destProd = await tx.product.create({
                  data: {
                    companyId: toCompanyId,
                    name: sourceProd?.name || itemName,
                    description:
                      sourceProd?.description ||
                      `Transferred from sister store (${existing.transferNumber})`,
                    category: sourceProd?.category || "General",
                    productCategoryId: sourceProd?.productCategoryId || null,
                    brand: sourceProd?.brand || null,
                    model: sourceProd?.model || item.sku || null,
                    images: (sourceProd?.images as any) || [],
                    costPrice: sourceProd?.costPrice || item.unitCost || 0,
                    sellingPrice:
                      sourceProd?.sellingPrice ||
                      Math.round((item.unitCost || 100) * 1.3),
                    finalPrice:
                      sourceProd?.finalPrice ||
                      sourceProd?.sellingPrice ||
                      Math.round((item.unitCost || 100) * 1.3),
                    quantity: 0,
                    isAvailable: qtyReceived > 0,
                    status: "ACTIVE",
                  },
                });
              }

              const destInv = await ensureInventoryItemTx(
                tx,
                destProd.id,
                toCompanyId,
                destProd.quantity,
              );

              const prevDestQty = Math.max(0, Number(destInv.quantity || 0));
              const newDestQty = prevDestQty + qtyReceived;

              await tx.inventoryItem.update({
                where: { id: destInv.id },
                data: { quantity: newDestQty, updatedAt: new Date() },
              });

              await tx.product.update({
                where: { id: destProd.id },
                data: {
                  quantity: newDestQty,
                  isAvailable: newDestQty > 0,
                  updatedAt: new Date(),
                },
              });

              await syncMarketplaceListingsTx(tx, destProd.id, newDestQty);

              await tx.inventoryLog.create({
                data: {
                  inventoryId: destInv.id,
                  action: "TRANSFER_IN",
                  quantity: qtyReceived,
                  damaged: shortfall,
                  details: formatLedgerDetails(
                    `Received +${qtyReceived} units into ${destinationName} via ${existing.transferNumber} (${prevDestQty} → ${newDestQty})`,
                    {
                      referenceId: existing.transferNumber,
                      referenceType: "TRANSFER",
                      movementType: "TRANSFER_IN",
                      productId: destProd.id,
                      companyId: toCompanyId,
                      sourceLocation: "Source Store",
                      destinationLocation: destinationName,
                      previousQuantity: prevDestQty,
                      newQuantity: newDestQty,
                      delta: qtyReceived,
                      damaged: shortfall,
                      actorId: userId,
                      actorName,
                      reason: `Inbound store transfer ${existing.transferNumber}`,
                      relatedTransferId: existing.id,
                    },
                  ),
                  ...(userId && /^[0-9a-fA-F]{24}$/.test(userId)
                    ? { userId }
                    : {}),
                },
              });
            }

            // C. Destination Type === "LOCATION" (Internal Branch / Warehouse Location within same company)
            else {
              const invItem = await ensureInventoryItemTx(
                tx,
                item.productId,
                fromCompanyId,
              );
              const prevQty = Math.max(0, Number(invItem.quantity || 0));
              const newQty = prevQty + qtyReceived;

              await tx.inventoryItem.update({
                where: { id: invItem.id },
                data: { quantity: newQty, updatedAt: new Date() },
              });

              await tx.product.update({
                where: { id: item.productId },
                data: {
                  quantity: newQty,
                  isAvailable: newQty > 0,
                  ...(toLocationId ? { locationId: toLocationId } : {}),
                  updatedAt: new Date(),
                },
              });

              await syncMarketplaceListingsTx(tx, item.productId, newQty);

              await tx.inventoryLog.create({
                data: {
                  inventoryId: invItem.id,
                  action: "TRANSFER_IN",
                  quantity: qtyReceived,
                  damaged: shortfall,
                  details: formatLedgerDetails(
                    `Received +${qtyReceived} units at branch location "${destinationName}" via ${existing.transferNumber} (${prevQty} → ${newQty})`,
                    {
                      referenceId: existing.transferNumber,
                      referenceType: "TRANSFER",
                      movementType: "TRANSFER_IN",
                      productId: item.productId,
                      companyId: fromCompanyId,
                      locationId: toLocationId,
                      sourceLocation:
                        existing.fromLocationId || "Main Warehouse",
                      destinationLocation: destinationName,
                      previousQuantity: prevQty,
                      newQuantity: newQty,
                      delta: qtyReceived,
                      damaged: shortfall,
                      actorId: userId,
                      actorName,
                      reason: `Received at branch location (${existing.transferNumber})`,
                      relatedTransferId: existing.id,
                    },
                  ),
                  ...(userId && /^[0-9a-fA-F]{24}$/.test(userId)
                    ? { userId }
                    : {}),
                },
              });
            }

            await tx.stockTransferItem.update({
              where: { id: item.id },
              data: { quantityReceived: qtyReceived },
            });
          }

          const updatedCleanNotes = [
            cleanNotes,
            actionNotes,
            shortfallSummaries.length > 0
              ? `Partial Receipt Discrepancies: ${shortfallSummaries.join("; ")}`
              : null,
          ]
            .filter(Boolean)
            .join(" | ");

          return tx.stockTransfer.update({
            where: { id: transferId },
            data: {
              status: "RECEIVED",
              receivedAt: new Date(),
              notes: encodeTransferNotes(updatedCleanNotes, meta),
            },
            include: { items: true },
          });
        },
        { maxWait: 10000, timeout: 25000 },
      );

      await invalidateInventoryCaches(fromCompanyId);
      if (toCompanyId && toCompanyId !== fromCompanyId) {
        await invalidateInventoryCaches(toCompanyId);
      }

      return NextResponse.json({
        success: true,
        transfer: enrichTransferForClient(received),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[STOCK_TRANSFER_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update transfer" },
      { status: 400 },
    );
  }
}
