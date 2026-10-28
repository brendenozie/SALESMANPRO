import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

function generateTransferNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 900 + 100);
  return `ST-${ts}${rand}`;
}

interface TransferMeta {
  destinationType: "STORE" | "AGENT" | "LOCATION";
  toCompanyId?: string;
  toCompanyName?: string;
  toAgentId?: string;
  toAgentName?: string;
  toLocationId?: string;
  toLocationName?: string;
  userNotes?: string;
}

function parseTransferMeta(notes?: string | null): TransferMeta {
  if (!notes) return { destinationType: "LOCATION", userNotes: "" };
  try {
    if (notes.startsWith("{") && notes.endsWith("}")) {
      const parsed = JSON.parse(notes);
      return {
        destinationType: parsed.destinationType || "LOCATION",
        toCompanyId: parsed.toCompanyId,
        toCompanyName: parsed.toCompanyName,
        toAgentId: parsed.toAgentId,
        toAgentName: parsed.toAgentName,
        toLocationId: parsed.toLocationId,
        toLocationName: parsed.toLocationName,
        userNotes: parsed.userNotes || "",
      };
    }
  } catch {}
  return { destinationType: "LOCATION", userNotes: notes };
}

function formatTransferMeta(meta: TransferMeta): string {
  return JSON.stringify(meta);
}

const PRODUCT_ITEM_SELECT = {
  id: true,
  name: true,
  images: true,
  sellingPrice: true,
  costPrice: true,
  model: true,
  isbn: true,
};

// ─── GET /api/stock-transfer?companyId= ──────────────────────────────────────
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  const id = req.nextUrl.searchParams.get("id");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  try {
    // 1. Single Transfer Detail
    if (id) {
      const transfer = await prisma.stockTransfer.findFirst({
        where: { id, companyId },
        include: {
          company: { select: { id: true, name: true, slug: true, currency: true } },
          items: {
            include: {
              product: {
                select: PRODUCT_ITEM_SELECT,
              },
            },
          },
        },
      });

      if (!transfer) {
        return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
      }

      const meta = parseTransferMeta(transfer.notes);
      return NextResponse.json({
        transfer: {
          ...transfer,
          meta,
        },
      });
    }

    const status = req.nextUrl.searchParams.get("status");
    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10);
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "50", 10), 100);

    const where: any = { companyId };
    if (status && status !== "ALL") where.status = status;

    // 2. Load Current Company info
    const currentCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, slug: true, userId: true, currency: true },
    });

    // 3. Parallel Queries: Transfers list, Count, Sister Stores, Sales Agents, Locations, Real Products
    const [
      transfersRaw,
      total,
      sisterStores,
      salesAgentsRaw,
      locationsRaw,
      productsRaw,
    ] = await Promise.all([
      prisma.stockTransfer.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, slug: true, currency: true } },
          items: {
            include: {
              product: {
                select: PRODUCT_ITEM_SELECT,
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.stockTransfer.count({ where }),

      // Available sister stores owned by the store admin
      currentCompany?.userId
        ? prisma.company.findMany({
            where: {
              userId: currentCompany.userId,
              id: { not: companyId },
            },
            select: { id: true, name: true, slug: true, site: true, address: true },
          })
        : Promise.resolve([]),

      // Available sales agents / staff of this store
      prisma.salesAgent.findMany({
        where: { companyId, isActive: true },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      }),

      // Company locations / branches
      prisma.companyLocation.findMany({
        where: { companyId },
        include: {
          location: {
            select: { id: true, name: true, address: true, city: true },
          },
        },
      }),

      // Real Inventory Products with live warehouse stock levels
      prisma.product.findMany({
        where: { companyId },
        select: {
          id: true,
          name: true,
          costPrice: true,
          sellingPrice: true,
          quantity: true,
          images: true,
          model: true,
          isbn: true,
          vin: true,
          inventoryItems: {
            select: { id: true, quantity: true },
          },
        },
        orderBy: { name: "asc" },
        take: 200,
      }),
    ]);

    // Format transfers with parsed destination meta
    const transfers = transfersRaw.map((t) => ({
      ...t,
      meta: parseTransferMeta(t.notes),
    }));

    // Format sales agents
    const salesAgents = salesAgentsRaw.map((a: any) => ({
      id: a.id,
      name: a.user?.name || a.loginCode || a.phoneNumber || "Field Sales Agent",
      phone: a.phoneNumber || a.user?.phone || "",
      email: a.user?.email || "",
      loginCode: a.loginCode || "",
    }));

    // Format locations
    const locations = locationsRaw.map((cl) => ({
      id: cl.id,
      name: cl.displayName || cl.location?.name || "Main Warehouse",
      address:
        cl.addressLine1Override ||
        cl.location?.address ||
        cl.location?.city ||
        "Warehouse Location",
    }));

    // Format real inventory products with actual stock
    const products = productsRaw.map((p) => {
      const stock =
        p.inventoryItems && p.inventoryItems.length > 0
          ? p.inventoryItems.reduce((acc, inv) => acc + (inv.quantity || 0), 0)
          : p.quantity || 0;

      const trueSku =
        p.isbn ||
        p.vin ||
        (p.model ? `MOD-${p.model}` : `SKU-${p.id.slice(-8).toUpperCase()}`);

      return {
        id: p.id,
        name: p.name,
        sku: trueSku,
        barcode: trueSku,
        costPrice: p.costPrice || 0,
        sellingPrice: p.sellingPrice || 0,
        stock,
        image: p.images?.[0] || null,
      };
    });

    return NextResponse.json({
      transfers,
      total,
      page,
      limit,
      company: currentCompany,
      destinations: {
        stores: sisterStores,
        agents: salesAgents,
        locations: locations,
      },
      products,
    });
  } catch (e: any) {
    console.error("[STOCK_TRANSFER_GET_ERROR]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─── POST /api/stock-transfer ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyId,
      destinationType = "LOCATION",
      toCompanyId,
      toCompanyName,
      toAgentId,
      toAgentName,
      toLocationId,
      toLocationName,
      requestedById,
      notes,
      items,
    } = body;

    if (!companyId || !items?.length) {
      return NextResponse.json(
        { error: "companyId and items are required" },
        { status: 400 }
      );
    }

    // Resolve unified destination ID to store on transfer
    const resolvedTargetId =
      destinationType === "STORE"
        ? toCompanyId
        : destinationType === "AGENT"
        ? toAgentId
        : toLocationId || null;

    const meta: TransferMeta = {
      destinationType,
      toCompanyId: toCompanyId || undefined,
      toCompanyName: toCompanyName || undefined,
      toAgentId: toAgentId || undefined,
      toAgentName: toAgentName || undefined,
      toLocationId: toLocationId || undefined,
      toLocationName: toLocationName || undefined,
      userNotes: notes || "",
    };

    const transfer = await prisma.stockTransfer.create({
      data: {
        transferNumber: generateTransferNumber(),
        companyId,
        fromLocationId: companyId,
        toLocationId: resolvedTargetId,
        status: "REQUESTED",
        requestedById: requestedById ?? null,
        notes: formatTransferMeta(meta),
        items: {
          create: items.map((it: any) => ({
            productId: it.productId ?? null,
            description: it.description || it.name || "Inventory Product",
            sku: it.sku ?? null,
            quantityRequested: Math.max(1, parseInt(it.quantityRequested, 10) || 1),
            unitCost: Number(it.unitCost) || 0,
          })),
        },
      },
      include: {
        company: { select: { id: true, name: true, slug: true, currency: true } },
        items: {
          include: {
            product: {
              select: PRODUCT_ITEM_SELECT,
            },
          },
        },
      },
    });

    return NextResponse.json({
      transfer: {
        ...transfer,
        meta,
      },
    });
  } catch (e: any) {
    console.error("[STOCK_TRANSFER_POST_ERROR]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─── PATCH /api/stock-transfer ────────────────────────────────────────────────
// Atomic Transitions: APPROVE, DISPATCH, RECEIVE, REJECT, CANCEL
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, companyId, action, approvedById, receivedItems } = body;

    if (!id || !companyId || !action) {
      return NextResponse.json(
        { error: "id, companyId, and action are required" },
        { status: 400 }
      );
    }

    const transfer = await prisma.stockTransfer.findFirst({
      where: { id, companyId },
      include: {
        company: { select: { id: true, name: true } },
        items: true,
      },
    });

    if (!transfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }

    const meta = parseTransferMeta(transfer.notes);

    // ─── 1. APPROVE ──────────────────────────────────────────────────────────
    if (action === "APPROVE") {
      const updated = await prisma.stockTransfer.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedById: approvedById ?? null,
        },
        include: {
          company: { select: { id: true, name: true, slug: true, currency: true } },
          items: {
            include: {
              product: { select: PRODUCT_ITEM_SELECT },
            },
          },
        },
      });

      return NextResponse.json({ transfer: { ...updated, meta } });
    }

    // ─── 2. DISPATCH (Atomic Physical Inventory Deduction) ───────────────────
    if (action === "DISPATCH") {
      const updated = await prisma.$transaction(async (tx) => {
        // Deduct from current store's inventory
        for (const item of transfer.items) {
          if (item.productId && item.quantityRequested > 0) {
            // Find or update InventoryItem for current company
            const invItem = await tx.inventoryItem.findFirst({
              where: { productId: item.productId, companyId },
            });

            if (invItem) {
              await tx.inventoryItem.update({
                where: { id: invItem.id },
                data: {
                  quantity: { decrement: item.quantityRequested },
                },
              });

              await tx.inventoryLog.create({
                data: {
                  inventoryId: invItem.id,
                  action: "STOCK_TRANSFER_DISPATCH",
                  quantity: item.quantityRequested,
                  details: `Dispatched in ${transfer.transferNumber} to ${meta.destinationType} (${meta.toCompanyName || meta.toAgentName || "Destination"})`,
                },
              });
            }

            // Also decrement base Product quantity field
            await tx.product.update({
              where: { id: item.productId },
              data: {
                quantity: { decrement: item.quantityRequested },
              },
            }).catch(() => {});

            // Record dispatched quantity on item
            await tx.stockTransferItem.update({
              where: { id: item.id },
              data: {
                quantityDispatched: item.quantityRequested,
              },
            });
          }
        }

        return tx.stockTransfer.update({
          where: { id },
          data: {
            status: "IN_TRANSIT",
            dispatchedAt: new Date(),
          },
          include: {
            company: { select: { id: true, name: true, slug: true, currency: true } },
            items: {
              include: {
                product: { select: PRODUCT_ITEM_SELECT },
              },
            },
          },
        });
      });

      return NextResponse.json({ transfer: { ...updated, meta } });
    }

    // ─── 3. RECEIVE (Atomic Recipient Stock Ingestion) ────────────────────────
    if (action === "RECEIVE") {
      const updated = await prisma.$transaction(async (tx) => {
        const receivedMap: Record<string, number> = {};
        if (receivedItems && Array.isArray(receivedItems)) {
          receivedItems.forEach((ri: any) => {
            receivedMap[ri.itemId] = Number(ri.quantityReceived) || 0;
          });
        }

        for (const item of transfer.items) {
          const qtyReceived =
            receivedMap[item.id] !== undefined
              ? receivedMap[item.id]
              : item.quantityDispatched || item.quantityRequested;

          // Update transfer item record
          await tx.stockTransferItem.update({
            where: { id: item.id },
            data: {
              quantityReceived: qtyReceived,
            },
          });

          if (!item.productId || qtyReceived <= 0) continue;

          // A. Destination is Another Store Owned by Admin
          if (meta.destinationType === "STORE" && meta.toCompanyId) {
            let destInv = await tx.inventoryItem.findFirst({
              where: { productId: item.productId, companyId: meta.toCompanyId },
            });

            if (!destInv) {
              destInv = await tx.inventoryItem.create({
                data: {
                  productId: item.productId,
                  companyId: meta.toCompanyId,
                  quantity: qtyReceived,
                  reorderThreshold: 10,
                },
              });
            } else {
              await tx.inventoryItem.update({
                where: { id: destInv.id },
                data: {
                  quantity: { increment: qtyReceived },
                },
              });
            }

            await tx.inventoryLog.create({
              data: {
                inventoryId: destInv.id,
                action: "STOCK_TRANSFER_RECEIVE",
                quantity: qtyReceived,
                details: `Received from ${transfer.company.name} (${transfer.transferNumber})`,
              },
            });
          }

          // B. Destination is a Sales Agent / Staff
          else if (meta.destinationType === "AGENT" && meta.toAgentId) {
            // Find origin InventoryItem to connect to AgentInventory
            let originInv = await tx.inventoryItem.findFirst({
              where: { productId: item.productId, companyId },
            });

            if (!originInv) {
              originInv = await tx.inventoryItem.create({
                data: {
                  productId: item.productId,
                  companyId,
                  quantity: 0,
                },
              });
            }

            let agentInv = await tx.agentInventory.findFirst({
              where: {
                salesAgentId: meta.toAgentId,
                inventoryItemId: originInv.id,
              },
            });

            if (!agentInv) {
              agentInv = await tx.agentInventory.create({
                data: {
                  salesAgentId: meta.toAgentId,
                  inventoryItemId: originInv.id,
                  quantity: qtyReceived,
                },
              });
            } else {
              await tx.agentInventory.update({
                where: { id: agentInv.id },
                data: {
                  quantity: { increment: qtyReceived },
                },
              });
            }

            await tx.agentInventoryLog.create({
              data: {
                agentInventoryId: agentInv.id,
                action: "TRANSFER_RECEIVE",
                quantity: qtyReceived,
                totalPrice: (item.unitCost || 0) * qtyReceived,
              },
            });
          }
        }

        return tx.stockTransfer.update({
          where: { id },
          data: {
            status: "RECEIVED",
            receivedAt: new Date(),
          },
          include: {
            company: { select: { id: true, name: true, slug: true, currency: true } },
            items: {
              include: {
                product: { select: PRODUCT_ITEM_SELECT },
              },
            },
          },
        });
      });

      return NextResponse.json({ transfer: { ...updated, meta } });
    }

    // ─── 4. CANCEL / REJECT (Restores Stock if Dispatched) ─────────────────────
    if (action === "CANCEL" || action === "REJECT") {
      const updated = await prisma.$transaction(async (tx) => {
        // If it was already dispatched / in transit, rollback stock back to origin store
        if (transfer.status === "IN_TRANSIT") {
          for (const item of transfer.items) {
            const qtyToReturn = item.quantityDispatched || item.quantityRequested;
            if (item.productId && qtyToReturn > 0) {
              const originInv = await tx.inventoryItem.findFirst({
                where: { productId: item.productId, companyId },
              });

              if (originInv) {
                await tx.inventoryItem.update({
                  where: { id: originInv.id },
                  data: {
                    quantity: { increment: qtyToReturn },
                  },
                });

                await tx.inventoryLog.create({
                  data: {
                    inventoryId: originInv.id,
                    action: "STOCK_TRANSFER_RESTORE",
                    quantity: qtyToReturn,
                    details: `Restored due to ${action} on ${transfer.transferNumber}`,
                  },
                });
              }

              await tx.product.update({
                where: { id: item.productId },
                data: {
                  quantity: { increment: qtyToReturn },
                },
              }).catch(() => {});
            }
          }
        }

        return tx.stockTransfer.update({
          where: { id },
          data: {
            status: action === "CANCEL" ? "CANCELLED" : "REJECTED",
          },
          include: {
            company: { select: { id: true, name: true, slug: true, currency: true } },
            items: {
              include: {
                product: { select: PRODUCT_ITEM_SELECT },
              },
            },
          },
        });
      });

      return NextResponse.json({ transfer: { ...updated, meta } });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    console.error("[STOCK_TRANSFER_PATCH_ERROR]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
