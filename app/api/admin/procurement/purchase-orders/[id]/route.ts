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

        // B. Stock increment loop: Atomic physical inventory and catalog updates
        for (const item of existing.items) {
          await tx.purchaseOrderItem.update({
            where: { id: item.id },
            data: { quantityReceived: item.quantityOrdered },
          });

          let targetProductId = item.productId;

          // 1. If not directly attached, attempt resolving by SKU or exact title
          if (!targetProductId && item.description) {
            const matched = await tx.product.findFirst({
              where: {
                companyId: existing.companyId,
                OR: [
                  { name: { equals: item.description, mode: "insensitive" } },
                  { model: { equals: item.description, mode: "insensitive" } },
                ],
              },
            });
            if (matched) {
              targetProductId = matched.id;
              await tx.purchaseOrderItem.update({
                where: { id: item.id },
                data: { productId: matched.id },
              });
            }
          }

          // 2. If still unlinked, auto-create catalog product for received one-off items
          if (!targetProductId && item.description) {
            const autoSku = `SKU-PO-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
            const newProduct = await tx.product.create({
              data: {
                companyId: existing.companyId,
                name: item.description,
                model: autoSku,
                costPrice: item.unitCost,
                sellingPrice: Math.round(item.unitCost * 1.35 * 100) / 100,
                finalPrice: Math.round(item.unitCost * 1.35 * 100) / 100,
                quantity: item.quantityOrdered,
                supplierId: existing.supplierId,
                supplierName: existing.supplier?.name || null,
              },
            });
            targetProductId = newProduct.id;
            await tx.purchaseOrderItem.update({
              where: { id: item.id },
              data: { productId: newProduct.id },
            });
          }

          // 3. Atomically increment catalog Product and physical InventoryItem
          if (targetProductId) {
            await tx.product.update({
              where: { id: targetProductId },
              data: {
                quantity: { increment: item.quantityOrdered },
                ...(item.unitCost > 0 ? { costPrice: item.unitCost } : {}),
                ...(existing.supplierId ? { supplierId: existing.supplierId } : {}),
                ...(existing.supplier?.name ? { supplierName: existing.supplier.name } : {}),
              },
            }).catch(() => null);

            let invItem = await tx.inventoryItem.findFirst({
              where: { productId: targetProductId, companyId: existing.companyId },
            });

            if (!invItem) {
              invItem = await tx.inventoryItem.create({
                data: {
                  productId: targetProductId,
                  companyId: existing.companyId,
                  quantity: item.quantityOrdered,
                  reorderThreshold: 10,
                },
              });
            } else {
              invItem = await tx.inventoryItem.update({
                where: { id: invItem.id },
                data: {
                  quantity: { increment: item.quantityOrdered },
                  updatedAt: new Date(),
                },
              });
            }

            // Create InventoryLog entry for transparent audit trail
            await tx.inventoryLog.create({
              data: {
                inventoryId: invItem.id,
                action: "RESTOCK",
                quantity: item.quantityOrdered,
                damaged: 0,
              },
            }).catch(() => null);
          }

          // 4. Increment marketplace listing if attached
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
