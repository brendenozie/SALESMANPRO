import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

function generateTransferNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  return `ST-${ts}`;
}

// ─── GET /api/stock-transfer?companyId= ──────────────────────────────────────
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  const id = req.nextUrl.searchParams.get("id");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  try {
    if (id) {
      const transfer = await prisma.stockTransfer.findFirst({
        where: { id, companyId },
        include: { items: { include: { product: { select: { title: true, sku: true } } } } },
      });
      return NextResponse.json({ transfer });
    }

    const status = req.nextUrl.searchParams.get("status");
    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = 20;

    const where: any = { companyId };
    if (status) where.status = status;

    const [transfers, total] = await Promise.all([
      prisma.stockTransfer.findMany({
        where,
        include: { items: { select: { quantityRequested: true, quantityReceived: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.stockTransfer.count({ where }),
    ]);

    // Get locations for display
    const locations = await prisma.companyLocation.findMany({
      where: { companyId },
      select: { id: true, name: true, address: true },
    });

    return NextResponse.json({ transfers, total, page, locations });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─── POST /api/stock-transfer ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, fromLocationId, toLocationId, requestedById, notes, items } = body;

    if (!companyId || !items?.length) {
      return NextResponse.json({ error: "companyId and items required" }, { status: 400 });
    }

    const transfer = await prisma.stockTransfer.create({
      data: {
        transferNumber: generateTransferNumber(),
        companyId,
        fromLocationId: fromLocationId ?? null,
        toLocationId: toLocationId ?? null,
        status: "REQUESTED",
        requestedById: requestedById ?? null,
        notes: notes ?? null,
        items: {
          create: items.map((it: any) => ({
            productId: it.productId ?? null,
            description: it.description,
            sku: it.sku ?? null,
            quantityRequested: it.quantityRequested,
            unitCost: it.unitCost ?? 0,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ transfer });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─── PATCH /api/stock-transfer ────────────────────────────────────────────────
// Approve / Dispatch / Receive / Reject
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, companyId, action, approvedById, receivedItems } = body;
    if (!id || !companyId || !action) return NextResponse.json({ error: "id, companyId, action required" }, { status: 400 });

    const transfer = await prisma.stockTransfer.findFirst({ where: { id, companyId }, include: { items: true } });
    if (!transfer) return NextResponse.json({ error: "Transfer not found" }, { status: 404 });

    const statusMap: Record<string, string> = {
      APPROVE: "APPROVED",
      DISPATCH: "IN_TRANSIT",
      RECEIVE: "RECEIVED",
      REJECT: "REJECTED",
      CANCEL: "CANCELLED",
    };

    const newStatus = statusMap[action];
    if (!newStatus) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const updateData: any = { status: newStatus };
    if (action === "APPROVE") updateData.approvedById = approvedById ?? null;
    if (action === "DISPATCH") updateData.dispatchedAt = new Date();
    if (action === "RECEIVE") {
      updateData.receivedAt = new Date();
      // Update item received quantities + auto-update product stock
      if (receivedItems?.length) {
        for (const ri of receivedItems) {
          await prisma.stockTransferItem.update({
            where: { id: ri.itemId },
            data: {
              quantityDispatched: ri.quantityDispatched ?? undefined,
              quantityReceived: ri.quantityReceived,
            },
          });
          // Auto-adjust product stock if productId linked
          if (ri.productId && ri.quantityReceived > 0) {
            await prisma.product.update({
              where: { id: ri.productId },
              data: { quantity: { increment: ri.quantityReceived } },
            }).catch(() => {}); // silently skip if product field doesn't exist
          }
        }
      }
    }

    const updated = await prisma.stockTransfer.update({
      where: { id },
      data: updateData,
      include: { items: { include: { product: { select: { title: true, sku: true } } } } },
    });

    return NextResponse.json({ transfer: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
