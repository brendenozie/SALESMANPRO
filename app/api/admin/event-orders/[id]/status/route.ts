// =========================================================
// app/api/admin/event-orders/[id]/status/route.ts
// =========================================================

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface Params {
  params: Promise<{ id: string }>;
}

async function updateOrderStatus(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const validStatuses = ["COMPLETED", "PAID", "PENDING", "REFUNDED", "CANCELLED"];
  if (!status || !validStatuses.includes(status)) {
    return formatResponse(
      false,
      null,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      400
    );
  }

  const purchase = await prisma.eventTicketPurchase.findUnique({
    where: { id },
    include: {
      ticket: true,
    },
  });

  if (!purchase) {
    return formatResponse(false, null, "Order not found", 404);
  }

  const isTransitioningToCancelled =
    (status === "REFUNDED" || status === "CANCELLED") &&
    purchase.paymentStatus !== "REFUNDED" &&
    purchase.paymentStatus !== "CANCELLED";

  const updatedPurchase = await prisma.$transaction(async (tx) => {
    // 1. Update purchase payment status
    const updated = await tx.eventTicketPurchase.update({
      where: { id },
      data: {
        paymentStatus: status,
      },
    });

    // 2. If cancelling or refunding, reinstate ticket inventory & cancel attendee passes
    if (isTransitioningToCancelled && purchase.ticketId) {
      await tx.eventTicket.update({
        where: { id: purchase.ticketId },
        data: {
          quantitySold: {
            decrement: Math.min(purchase.quantity, purchase.ticket?.quantitySold || purchase.quantity),
          },
        },
      });

      await tx.eventTicketAttendee.updateMany({
        where: { purchaseId: id },
        data: {
          checkInStatus: "CANCELLED",
        },
      });
    }

    return updated;
  });

  return formatResponse(
    true,
    {
      order: updatedPurchase,
      newStatus: status,
    },
    `Order status successfully updated to ${status}`,
    200
  );
}

export const PUT = withApiHandler(updateOrderStatus);
export const PATCH = withApiHandler(updateOrderStatus);
