import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";
import { PurchaseOrderStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");
    const status = searchParams.get("status");

    let targetCompanyId = companyId;
    if (!targetCompanyId && slug) {
      const comp = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId) {
      return formatResponse(false, null, "companyId or slug is required", 400);
    }

    const where: any = { companyId: targetCompanyId };
    if (status && status !== "All") {
      where.status = status as PurchaseOrderStatus;
    }

    const [purchaseOrders, products] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: {
            select: { id: true, name: true, contactPerson: true, phone: true, email: true },
          },
          items: true,
          bills: true,
        },
        orderBy: { issueDate: "desc" },
      }),
      prisma.product.findMany({
        where: { companyId: targetCompanyId },
        select: {
          id: true,
          name: true,
          costPrice: true,
          sellingPrice: true,
          quantity: true,
          model: true,
          supplierId: true,
          supplierName: true,
        },
        orderBy: { name: "asc" },
        take: 300,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: purchaseOrders,
      products,
      message: "Purchase orders and products fetched successfully",
    });
  } catch (error: any) {
    console.error("Fetch purchase orders error:", error);
    return formatResponse(false, null, error?.message || "Failed to fetch purchase orders", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      slug,
      supplierId,
      expectedDate,
      notes,
      items = [],
    } = body;

    let targetCompanyId = companyId;
    if (!targetCompanyId && slug) {
      const comp = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId) {
      return formatResponse(false, null, "companyId or slug is required", 400);
    }
    if (!supplierId) {
      return formatResponse(false, null, "supplierId is required", 400);
    }
    if (!Array.isArray(items) || items.length === 0) {
      return formatResponse(false, null, "At least one item is required in the purchase order", 400);
    }

    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const qty = parseInt(item.quantityOrdered || item.quantity || "1", 10);
      const unitCost = parseFloat(item.unitCost || "0");
      const lineTotal = qty * unitCost;
      subtotal += lineTotal;

      const desc = item.description || item.title || (item.sku ? `Item (${item.sku})` : "PO Item");

      return {
        description: desc,
        quantityOrdered: qty,
        quantityReceived: 0,
        unitCost,
        totalCost: Math.round((lineTotal + Number.EPSILON) * 100) / 100,
        productId: item.productId || null,
        marketplaceListingId: item.marketplaceListingId || null,
      };
    });

    const poNumber = `PO-${Date.now().toString().slice(-6)}`;
    const totalAmount = Math.round((subtotal + Number.EPSILON) * 100) / 100;

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        companyId: targetCompanyId,
        supplierId,
        status: "PENDING_APPROVAL",
        issueDate: new Date(),
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        subtotal,
        totalAmount,
        notes: notes || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    return formatResponse(true, po, "Purchase order created successfully", 201);
  } catch (error: any) {
    console.error("Create purchase order error:", error);
    return formatResponse(false, null, error?.message || "Failed to create purchase order", 500);
  }
}
