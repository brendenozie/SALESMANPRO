// app/api/admin/orders/[id]/route.ts
import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { OrderStatus, Prisma } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

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
    // We use a transaction to ensure both the order and items are in sync
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the main Order status
      const updatedOrder = await tx.customerOrder.update({
        where: { id: orderId },
        data: { status: status },
      });

      // 2. Update all Items under this order that belong to THIS company
      await tx.orderItem.updateMany({
        where: {
          orderId: orderId,
          marketplaceListing: { companyId: companyId },
        },
        data: {
          status: status,
          ...(riderId && { riderId: riderId }), // Optionally assign rider to all items
        },
      });

      return updatedOrder;
    });

    // Invalidate caches
    await cacheDel(`admin:orders:${companyId}:*`);

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
