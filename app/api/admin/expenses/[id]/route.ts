import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return formatResponse(false, null, "Expense not found", 404);
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(body.category && { category: body.category }),
        ...(body.description && { description: body.description }),
        ...(body.vendor && { vendor: body.vendor }),
        ...(body.amount !== undefined && { amount: parseFloat(body.amount) }),
        ...(body.taxAmount !== undefined && { taxAmount: parseFloat(body.taxAmount) }),
        ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
        ...(body.reference !== undefined && { reference: body.reference }),
        ...(body.status && { status: body.status }),
        ...(body.approvedBy !== undefined && { approvedBy: body.approvedBy }),
        ...(body.date && { date: new Date(body.date) }),
        ...(body.receiptUrl !== undefined && { receiptUrl: body.receiptUrl }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    try {
      await cacheDel(`tenant:${existing.companyId}:expenses:*`);
      await cacheDel(`admin:expenses:*`);
    } catch (e) {}

    return formatResponse(true, updated, "Expense updated successfully", 200);
  } catch (error: any) {
    console.error("Update expense error:", error);
    return formatResponse(false, null, error?.message || "Failed to update expense", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return formatResponse(false, null, "Expense not found", 404);
    }

    await prisma.expense.delete({
      where: { id },
    });

    try {
      await cacheDel(`tenant:${existing.companyId}:expenses:*`);
      await cacheDel(`admin:expenses:*`);
    } catch (e) {}

    return formatResponse(true, null, "Expense deleted successfully", 200);
  } catch (error: any) {
    console.error("Delete expense error:", error);
    return formatResponse(false, null, error?.message || "Failed to delete expense", 500);
  }
}