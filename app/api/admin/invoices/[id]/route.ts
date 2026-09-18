import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { InvoiceStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        company: {
          select: { id: true, name: true, phone: true, email: true, currency: true },
        },
        consumer: {
          include: { user: { select: { name: true, email: true, phone: true } } },
        },
        client: {
          include: { user: { select: { name: true, email: true, phone: true } } },
        },
      },
    });

    if (!invoice) {
      return formatResponse(false, null, "Invoice not found", 404);
    }

    return formatResponse(true, invoice, "Invoice retrieved successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error?.message || "Failed to retrieve invoice", 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return formatResponse(false, null, "Invoice not found", 404);
    }

    // Payment recording flow
    if (body.action === "RECORD_PAYMENT") {
      const paymentAmount = parseFloat(body.amountPaid || "0");
      if (paymentAmount <= 0) {
        return formatResponse(false, null, "Payment amount must be greater than 0", 400);
      }

      const newAmountPaid = Math.round(((existing.amountPaid || 0) + paymentAmount + Number.EPSILON) * 100) / 100;
      const newAmountDue = Math.max(0, Math.round(((existing.amount - newAmountPaid) + Number.EPSILON) * 100) / 100);
      const newStatus = newAmountDue === 0 ? "PAID" : "PARTIALLY_PAID";

      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status: newStatus as InvoiceStatus,
        },
        include: { items: true },
      });

      // Also record payment in payment ledger if orderId exists
      if (existing.orderId) {
        await prisma.payment.create({
          data: {
            orderId: existing.orderId,
            companyId: existing.companyId,
            amount: paymentAmount,
            provider: body.paymentMethod || "CASH",
            status: "COMPLETED",
            transactionId: `PAY-INV-${existing.invoiceNumber}-${Date.now().toString().slice(-4)}`,
            internalReference: existing.invoiceNumber,
            paidAt: new Date(),
          },
        }).catch(() => null);
      }

      return formatResponse(true, updatedInvoice, "Payment recorded successfully", 200);
    }

    // General update
    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status as InvoiceStatus }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.terms !== undefined && { terms: body.terms }),
        ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
      },
      include: { items: true },
    });

    try {
      if (existing.companyId) {
        await cacheDel(`tenant:${existing.companyId}:invoices:*`);
        await cacheDel(`admin:invoices:*`);
      }
    } catch (e) {}

    return formatResponse(true, updated, "Invoice updated successfully", 200);
  } catch (error: any) {
    console.error("Update invoice error:", error);
    return formatResponse(false, null, error?.message || "Failed to update invoice", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return formatResponse(false, null, "Invoice not found", 404);
    }

    await prisma.invoice.delete({ where: { id } });

    return formatResponse(true, null, "Invoice deleted successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error?.message || "Failed to delete invoice", 500);
  }
}
