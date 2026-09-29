import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { InvoiceStatus } from "@prisma/client";
import { enforceInvoiceLimit } from "@/lib/subscriptions/enforce-limits";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");
    const filterStatus = searchParams.get("status");
    const searchKeyword = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    let targetCompanyId = companyId;
    if (!targetCompanyId && slug) {
      const comp = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId) {
      return formatResponse(false, null, "Missing companyId or slug parameter", 400);
    }

    const where: any = { companyId: targetCompanyId };

    if (filterStatus && filterStatus !== "All") {
      where.status = filterStatus as InvoiceStatus;
    }

    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.issueDate.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.issueDate.lte = end;
      }
    }

    if (searchKeyword?.trim()) {
      where.OR = [
        { invoiceNumber: { contains: searchKeyword.trim(), mode: "insensitive" } },
        { customerName: { contains: searchKeyword.trim(), mode: "insensitive" } },
        { customerEmail: { contains: searchKeyword.trim(), mode: "insensitive" } },
        { notes: { contains: searchKeyword.trim(), mode: "insensitive" } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          items: true,
          consumer: {
            include: { user: { select: { name: true, email: true, phone: true } } },
          },
          client: {
            include: { user: { select: { name: true, email: true, phone: true } } },
          },
        },
        orderBy: { issueDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    const formatted = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName:
        inv.customerName ||
        inv.consumer?.user?.name ||
        inv.client?.user?.name ||
        "Client",
      customerEmail:
        inv.customerEmail ||
        inv.consumer?.user?.email ||
        inv.client?.user?.email ||
        null,
      customerPhone:
        inv.customerPhone ||
        inv.consumer?.user?.phone ||
        inv.client?.user?.phone ||
        null,
      subtotal: inv.subtotal,
      taxAmount: inv.taxAmount,
      discountAmount: inv.discountAmount,
      amount: inv.amount,
      amountPaid: inv.amountPaid,
      amountDue: inv.amountDue,
      currency: inv.currency,
      issueDate: inv.issueDate.toISOString(),
      dueDate: inv.dueDate.toISOString(),
      status: inv.status,
      notes: inv.notes,
      terms: inv.terms,
      orderId: inv.orderId,
      items: inv.items,
    }));

    // Calculate aggregated metrics
    const [totalBilledAgg, totalDueAgg, totalPaidAgg] = await Promise.all([
      prisma.invoice.aggregate({ where: { companyId: targetCompanyId }, _sum: { amount: true } }),
      prisma.invoice.aggregate({ where: { companyId: targetCompanyId }, _sum: { amountDue: true } }),
      prisma.invoice.aggregate({ where: { companyId: targetCompanyId }, _sum: { amountPaid: true } }),
    ]);

    return formatResponse(
      true,
      {
        invoices: formatted,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        metrics: {
          totalBilled: totalBilledAgg._sum.amount || 0,
          totalOutstanding: totalDueAgg._sum.amountDue || 0,
          totalPaid: totalPaidAgg._sum.amountPaid || 0,
        },
      },
      "Invoices fetched successfully",
      200
    );
  } catch (error: any) {
    console.error("Fetch invoices error:", error);
    return formatResponse(false, null, error?.message || "Failed to fetch invoices", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      slug,
      customerName,
      customerEmail,
      customerPhone,
      clientId,
      consumerId,
      orderId,
      dueDate,
      notes,
      terms,
      currency = "KES",
      items = [],
      status = "PENDING",
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
    if (!dueDate) {
      return formatResponse(false, null, "dueDate is required", 400);
    }

    // --- Subscription Plan Enforcement: Monthly Invoice Limit ---
    const invoiceCheck = await enforceInvoiceLimit(targetCompanyId);
    if (!invoiceCheck.allowed) {
      return formatResponse(false, { upgradeRequired: invoiceCheck.upgradeRequired, currentCount: invoiceCheck.currentCount, limit: invoiceCheck.limit }, invoiceCheck.message, 403);
    }
    if (!Array.isArray(items) || items.length === 0) {
      return formatResponse(false, null, "Invoice must contain at least one line item", 400);
    }

    // Calculate subtotal, tax, discount, total
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    const normalizedItems = items.map((it: any) => {
      const qty = parseInt(it.quantity || "1", 10);
      const unitPrice = parseFloat(it.unitPrice || "0");
      const taxRate = parseFloat(it.taxRate || "0");
      const discount = parseFloat(it.discount || "0");

      const lineGross = qty * unitPrice;
      const lineDiscount = lineGross * (discount / 100);
      const lineNet = lineGross - lineDiscount;
      const lineTax = lineNet * (taxRate / 100);
      const lineTotal = lineNet + lineTax;

      subtotal += lineNet;
      taxAmount += lineTax;
      discountAmount += lineDiscount;

      return {
        description: it.description || "Line item",
        quantity: qty,
        unitPrice,
        taxRate,
        discount,
        totalPrice: Math.round((lineTotal + Number.EPSILON) * 100) / 100,
        productId: it.productId || null,
        marketplaceListingId: it.marketplaceListingId || null,
      };
    });

    const totalAmount = Math.round((subtotal + taxAmount + Number.EPSILON) * 100) / 100;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        companyId: targetCompanyId,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        clientId: clientId || null,
        consumerId: consumerId || null,
        orderId: orderId || null,
        subtotal: Math.round((subtotal + Number.EPSILON) * 100) / 100,
        taxAmount: Math.round((taxAmount + Number.EPSILON) * 100) / 100,
        discountAmount: Math.round((discountAmount + Number.EPSILON) * 100) / 100,
        amount: totalAmount,
        amountPaid: 0,
        amountDue: totalAmount,
        currency,
        issueDate: new Date(),
        dueDate: new Date(dueDate),
        status: status as InvoiceStatus,
        notes: notes || null,
        terms: terms || "Payment due within stated terms.",
        items: {
          create: normalizedItems,
        },
      },
      include: {
        items: true,
      },
    });

    try {
      await cacheDel(`tenant:${targetCompanyId}:invoices:*`);
      await cacheDel(`admin:invoices:*`);
    } catch (e) {}

    return formatResponse(true, newInvoice, "Invoice created successfully", 201);
  } catch (error: any) {
    console.error("Create invoice error:", error);
    return formatResponse(false, null, error?.message || "Failed to create invoice", 500);
  }
}
