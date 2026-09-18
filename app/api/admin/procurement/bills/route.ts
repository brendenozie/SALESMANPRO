import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";
import { SupplierBillStatus } from "@prisma/client";

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
      where.status = status as SupplierBillStatus;
    }

    const bills = await prisma.supplierBill.findMany({
      where,
      include: {
        supplier: {
          select: { id: true, name: true, phone: true, email: true },
        },
        purchaseOrder: {
          select: { id: true, poNumber: true },
        },
        payments: {
          orderBy: { paidAt: "desc" },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return formatResponse(true, bills, "Supplier bills fetched successfully", 200);
  } catch (error: any) {
    console.error("Fetch bills error:", error);
    return formatResponse(false, null, error?.message || "Failed to fetch bills", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { billId, amount, paymentMethod = "BANK", reference, notes } = body;

    if (!billId || !amount || parseFloat(amount) <= 0) {
      return formatResponse(false, null, "billId and a positive amount are required", 400);
    }

    const paymentAmount = parseFloat(amount);

    const bill = await prisma.supplierBill.findUnique({
      where: { id: billId },
      include: { supplier: true },
    });

    if (!bill) {
      return formatResponse(false, null, "Supplier bill not found", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Supplier Payment
      const payment = await tx.supplierPayment.create({
        data: {
          billId,
          amount: paymentAmount,
          paymentMethod,
          reference: reference || null,
          paidAt: new Date(),
          notes: notes || null,
        },
      });

      // 2. Update Bill amounts & status
      const newAmountPaid = Math.round(((bill.amountPaid || 0) + paymentAmount + Number.EPSILON) * 100) / 100;
      const newAmountDue = Math.max(0, Math.round(((bill.amount - newAmountPaid) + Number.EPSILON) * 100) / 100);
      const newStatus = newAmountDue === 0 ? "PAID" : "PARTIALLY_PAID";

      const updatedBill = await tx.supplierBill.update({
        where: { id: billId },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status: newStatus as SupplierBillStatus,
        },
      });

      // 3. Update Supplier balance
      await tx.supplier.update({
        where: { id: bill.supplierId },
        data: {
          outstandingBalance: {
            decrement: paymentAmount,
          },
        },
      });

      return { payment, updatedBill };
    });

    return formatResponse(true, result, "Supplier payment recorded successfully", 201);
  } catch (error: any) {
    console.error("Record supplier payment error:", error);
    return formatResponse(false, null, error?.message || "Failed to record payment", 500);
  }
}
