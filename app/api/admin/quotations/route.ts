import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { QuotationStatus } from "@prisma/client";
import { generateDocumentNumber } from "@/lib/documents/numbering";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");
    const filterStatus = searchParams.get("status");
    const searchKeyword = searchParams.get("search");
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
      where.status = filterStatus as QuotationStatus;
    }

    if (searchKeyword?.trim()) {
      where.OR = [
        { quotationNumber: { contains: searchKeyword.trim(), mode: "insensitive" } },
        { customerName: { contains: searchKeyword.trim(), mode: "insensitive" } },
        { customerEmail: { contains: searchKeyword.trim(), mode: "insensitive" } },
        { notes: { contains: searchKeyword.trim(), mode: "insensitive" } },
      ];
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
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
      prisma.quotation.count({ where }),
    ]);

    const formatted = quotations.map((q) => ({
      id: q.id,
      quotationNumber: q.quotationNumber,
      customerName:
        q.customerName ||
        q.consumer?.user?.name ||
        q.client?.user?.name ||
        "Client",
      customerEmail:
        q.customerEmail ||
        q.consumer?.user?.email ||
        q.client?.user?.email ||
        null,
      customerPhone:
        q.customerPhone ||
        q.consumer?.user?.phone ||
        q.client?.user?.phone ||
        null,
      subtotal: q.subtotal,
      taxAmount: q.taxAmount,
      discountAmount: q.discountAmount,
      totalAmount: q.totalAmount,
      currency: q.currency,
      issueDate: q.issueDate.toISOString(),
      expiryDate: q.expiryDate.toISOString(),
      status: q.status,
      convertedInvoiceId: q.convertedInvoiceId,
      notes: q.notes,
      terms: q.terms,
      items: q.items,
    }));

    const [totalQuotedAgg, acceptedAgg] = await Promise.all([
      prisma.quotation.aggregate({ where: { companyId: targetCompanyId }, _sum: { totalAmount: true } }),
      prisma.quotation.aggregate({ where: { companyId: targetCompanyId, status: "ACCEPTED" }, _sum: { totalAmount: true } }),
    ]);

    return formatResponse(
      true,
      {
        quotations: formatted,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        metrics: {
          totalQuoted: totalQuotedAgg._sum.totalAmount || 0,
          totalAccepted: acceptedAgg._sum.totalAmount || 0,
        },
      },
      "Quotations fetched successfully",
      200
    );
  } catch (error: any) {
    console.error("Fetch quotations error:", error);
    return formatResponse(false, null, error?.message || "Failed to fetch quotations", 500);
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
      expiryDate,
      notes,
      terms,
      currency = "KES",
      items = [],
      status = "DRAFT",
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

    if (!expiryDate) {
      return formatResponse(false, null, "expiryDate is required", 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return formatResponse(false, null, "Quotation must contain at least one line item", 400);
    }

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
        description: it.description || "Quotation item",
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
    const quotationNumber = await generateDocumentNumber(targetCompanyId, "QUOTATION");

    const newQuotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        companyId: targetCompanyId,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        clientId: clientId || null,
        consumerId: consumerId || null,
        subtotal: Math.round((subtotal + Number.EPSILON) * 100) / 100,
        taxAmount: Math.round((taxAmount + Number.EPSILON) * 100) / 100,
        discountAmount: Math.round((discountAmount + Number.EPSILON) * 100) / 100,
        totalAmount,
        currency,
        issueDate: new Date(),
        expiryDate: new Date(expiryDate),
        status: status as QuotationStatus,
        notes: notes || null,
        terms: terms || "Standard estimate terms apply. Valid for 30 days.",
        items: {
          create: normalizedItems,
        },
      },
      include: {
        items: true,
      },
    });

    try {
      await cacheDel(`tenant:${targetCompanyId}:quotations:*`);
    } catch (e) {}

    return formatResponse(true, newQuotation, "Quotation created successfully", 201);
  } catch (error: any) {
    console.error("Create quotation error:", error);
    return formatResponse(false, null, error?.message || "Failed to create quotation", 500);
  }
}
