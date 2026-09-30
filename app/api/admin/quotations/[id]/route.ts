import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { QuotationStatus, InvoiceStatus } from "@prisma/client";
import { generateDocumentNumber } from "@/lib/documents/numbering";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        items: true,
        company: true,
        consumer: {
          include: { user: { select: { name: true, email: true, phone: true } } },
        },
        client: {
          include: { user: { select: { name: true, email: true, phone: true } } },
        },
      },
    });

    if (!quotation) {
      return formatResponse(false, null, "Quotation not found", 404);
    }

    return formatResponse(true, quotation, "Quotation retrieved successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error?.message || "Failed to retrieve quotation", 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Quotation not found", 404);
    }

    // Action: Convert to Invoice
    if (body.action === "CONVERT_TO_INVOICE") {
      if (existing.status === "CONVERTED" && existing.convertedInvoiceId) {
        return formatResponse(false, null, "Quotation has already been converted to an invoice", 400);
      }

      const invoiceNumber = await generateDocumentNumber(existing.companyId, "INVOICE");
      const dueDate = body.dueDate
        ? new Date(body.dueDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Create linked invoice with exact line items
      const newInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          companyId: existing.companyId,
          quotationId: existing.id,
          customerName: existing.customerName,
          customerEmail: existing.customerEmail,
          customerPhone: existing.customerPhone,
          clientId: existing.clientId,
          consumerId: existing.consumerId,
          subtotal: existing.subtotal,
          taxAmount: existing.taxAmount,
          discountAmount: existing.discountAmount,
          amount: existing.totalAmount,
          amountPaid: 0,
          amountDue: existing.totalAmount,
          currency: existing.currency,
          issueDate: new Date(),
          dueDate,
          status: "PENDING" as InvoiceStatus,
          notes: existing.notes ? `Converted from ${existing.quotationNumber}. ${existing.notes}` : `Converted from ${existing.quotationNumber}`,
          terms: existing.terms,
          items: {
            create: existing.items.map((it) => ({
              description: it.description,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              taxRate: it.taxRate,
              discount: it.discount,
              totalPrice: it.totalPrice,
              productId: it.productId,
              marketplaceListingId: it.marketplaceListingId,
            })),
          },
        },
        include: { items: true },
      });

      // Update Quotation status to CONVERTED
      const updatedQuotation = await prisma.quotation.update({
        where: { id },
        data: {
          status: "CONVERTED" as QuotationStatus,
          convertedInvoiceId: newInvoice.id,
        },
      });

      try {
        await cacheDel(`tenant:${existing.companyId}:quotations:*`);
        await cacheDel(`tenant:${existing.companyId}:invoices:*`);
      } catch (e) {}

      return formatResponse(
        true,
        { quotation: updatedQuotation, invoice: newInvoice },
        "Quotation converted to Invoice successfully",
        200
      );
    }

    // General Quotation Update & in-place line-item editing
    let subtotalUpdate = existing.subtotal;
    let taxAmountUpdate = existing.taxAmount;
    let discountAmountUpdate = existing.discountAmount;
    let totalAmountUpdate = existing.totalAmount;

    if (Array.isArray(body.items) && body.items.length > 0) {
      let sub = 0;
      let tax = 0;
      let disc = 0;

      const normalizedItems = body.items.map((it: any) => {
        const qty = parseInt(it.quantity || "1", 10);
        const unitPrice = parseFloat(it.unitPrice || "0");
        const taxRate = parseFloat(it.taxRate || "0");
        const discount = parseFloat(it.discount || "0");

        const lineGross = qty * unitPrice;
        const lineDiscount = lineGross * (discount / 100);
        const lineNet = lineGross - lineDiscount;
        const lineTax = lineNet * (taxRate / 100);
        const lineTotal = lineNet + lineTax;

        sub += lineNet;
        tax += lineTax;
        disc += lineDiscount;

        return {
          quotationId: id,
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

      subtotalUpdate = Math.round((sub + Number.EPSILON) * 100) / 100;
      taxAmountUpdate = Math.round((tax + Number.EPSILON) * 100) / 100;
      discountAmountUpdate = Math.round((disc + Number.EPSILON) * 100) / 100;
      totalAmountUpdate = Math.round((sub + tax + Number.EPSILON) * 100) / 100;

      // Re-create items transactionally
      await prisma.quotationItem.deleteMany({ where: { quotationId: id } });
      await prisma.quotationItem.createMany({ data: normalizedItems });
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status as QuotationStatus }),
        ...(body.customerName !== undefined && { customerName: body.customerName }),
        ...(body.customerEmail !== undefined && { customerEmail: body.customerEmail }),
        ...(body.customerPhone !== undefined && { customerPhone: body.customerPhone }),
        ...(body.clientId !== undefined && { clientId: body.clientId }),
        ...(body.consumerId !== undefined && { consumerId: body.consumerId }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.terms !== undefined && { terms: body.terms }),
        ...(body.expiryDate && { expiryDate: new Date(body.expiryDate) }),
        ...(Array.isArray(body.items) && body.items.length > 0 && {
          subtotal: subtotalUpdate,
          taxAmount: taxAmountUpdate,
          discountAmount: discountAmountUpdate,
          totalAmount: totalAmountUpdate,
        }),
      },
      include: { items: true },
    });

    try {
      await cacheDel(`tenant:${existing.companyId}:quotations:*`);
    } catch (e) {}

    return formatResponse(true, updated, "Quotation updated successfully", 200);
  } catch (error: any) {
    console.error("Update quotation error:", error);
    return formatResponse(false, null, error?.message || "Failed to update quotation", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) {
      return formatResponse(false, null, "Quotation not found", 404);
    }

    await prisma.quotation.delete({ where: { id } });

    try {
      await cacheDel(`tenant:${existing.companyId}:quotations:*`);
    } catch (e) {}

    return formatResponse(true, null, "Quotation deleted successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error?.message || "Failed to delete quotation", 500);
  }
}
