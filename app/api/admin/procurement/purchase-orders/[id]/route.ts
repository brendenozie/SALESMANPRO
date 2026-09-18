import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: true,
        bills: { include: { payments: true } },
      },
    });

    if (!po) {
      return formatResponse(false, null, "Purchase order not found", 404);
    }

    return formatResponse(true, po, "Purchase order retrieved successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error?.message || "Failed to retrieve purchase order", 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true, supplier: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Purchase order not found", 404);
    }

    // 1. Approval action
    if (body.action === "APPROVE") {
      const updated = await prisma.purchaseOrder.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedBy: body.approvedBy || "Manager",
        },
      });
      return formatResponse(true, updated, "Purchase order approved", 200);
    }

    // 2. Receive Goods Action: Updates PO, increments stock, creates SupplierBill
    if (body.action === "RECEIVE_GOODS") {
      if (existing.status === "RECEIVED") {
        return formatResponse(false, null, "Goods have already been received for this PO", 400);
      }

      // Execute within transaction
      const result = await prisma.$transaction(async (tx) => {
        // A. Update PO status & item received quantities
        const updatedPO = await tx.purchaseOrder.update({
          where: { id },
          data: {
            status: "RECEIVED",
            receivedDate: new Date(),
          },
        });

        // B. Stock increment loop
        for (const item of existing.items) {
          await tx.purchaseOrderItem.update({
            where: { id: item.id },
            data: { quantityReceived: item.quantityOrdered },
          });

          // Increment catalog inventory
          if (item.marketplaceListingId) {
            await tx.marketplaceListings.update({
              where: { id: item.marketplaceListingId },
              data: {
                quantity: { increment: item.quantityOrdered },
                isAvailable: true,
                ...(item.unitCost > 0 ? { buyingPrice: item.unitCost } : {}),
              },
            }).catch(() => null);
          }

          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                quantity: { increment: item.quantityOrdered },
                ...(item.unitCost > 0 ? { costPrice: item.unitCost } : {}),
              },
            }).catch(() => null);
          }
        }

        // C. Generate SupplierBill in Accounts Payable
        const billNumber = `BILL-${Date.now().toString().slice(-6)}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // Default Net 30

        const bill = await tx.supplierBill.create({
          data: {
            billNumber,
            companyId: existing.companyId,
            supplierId: existing.supplierId,
            purchaseOrderId: existing.id,
            amount: existing.totalAmount,
            amountPaid: 0,
            amountDue: existing.totalAmount,
            issueDate: new Date(),
            dueDate,
            status: "PENDING",
            notes: `Auto-generated bill from received Purchase Order #${existing.poNumber}`,
          },
        });

        // D. Update supplier outstanding balance & total purchases
        await tx.supplier.update({
          where: { id: existing.supplierId },
          data: {
            outstandingBalance: { increment: existing.totalAmount },
            totalPurchases: { increment: existing.totalAmount },
          },
        });

        return { updatedPO, bill };
      });

      return formatResponse(
        true,
        result,
        "Goods received into stock and supplier bill generated in Accounts Payable",
        200
      );
    }

    // 3. General update
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    return formatResponse(true, updated, "Purchase order updated", 200);
  } catch (error: any) {
    console.error("PO action error:", error);
    return formatResponse(false, null, error?.message || "Failed to update purchase order", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.purchaseOrder.delete({ where: { id } });
    return formatResponse(true, null, "Purchase order deleted", 200);
  } catch (error: any) {
    return formatResponse(false, null, error?.message || "Failed to delete purchase order", 500);
  }
}
