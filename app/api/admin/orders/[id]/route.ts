// app/api/admin/orders/[id]/route.ts
import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { OrderStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { restoreOrderInventoryOnCancellation } from "@/lib/inventory/inventory-service";

type RouteParams = { params: Promise<{ id: string }> };

async function handleUpdateWholeOrder(req: Request, { params }: RouteParams) {
  const { id: orderId } = await params;
  const { searchParams } = new URL(req.url);

  const status = searchParams.get("status") as OrderStatus;
  const companyId = searchParams.get("companyId");
  const riderId = searchParams.get("riderId");

  if (!orderId || !status || !companyId) {
    return formatResponse(
      false,
      null,
      "Missing orderId, status, or companyId",
      400,
    );
  }

  try {
    const existingOrder = await prisma.customerOrder.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.customerOrder.update({
        where: { id: orderId },
        data: { status: status },
      });

      await tx.orderItem.updateMany({
        where: {
          orderId: orderId,
          marketplaceListing: { companyId: companyId },
        },
        data: {
          status: status,
          ...(riderId && { riderId: riderId }),
        },
      });

      return updatedOrder;
    });

    // If order transitioned to CANCELLED, restore deducted inventory
    if (
      String(existingOrder?.status || "").toUpperCase() !== "CANCELLED" &&
      String(status).toUpperCase() === "CANCELLED"
    ) {
      await restoreOrderInventoryOnCancellation(orderId, companyId, "admin");
    }

    await cacheDel(`tenant:${companyId}:orders:*`);
    await cacheDel(`admin:orders:*`);

    return formatResponse(
      true,
      result,
      "Order and items updated successfully",
      200,
    );
  } catch (error) {
    console.error("Update Error:", error);
    return formatResponse(false, null, "Failed to update order", 500);
  }
}

export const PUT = withApiHandler(handleUpdateWholeOrder);
