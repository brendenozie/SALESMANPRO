import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { OrderStatus } from "@prisma/client";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderItemId, appointmentId, status, date, timeSlot, notes, riderId } = body;

    // 1. Updating a CustomerOrderItem or its parent order
    if (orderItemId) {
      const orderItem = await prisma.customerOrderItem.findUnique({
        where: { id: orderItemId },
        include: { order: true },
      });

      if (!orderItem) {
        return NextResponse.json({ success: false, error: "Service order item not found" }, { status: 404 });
      }

      // Update the CustomerOrderItem
      const updatedItem = await prisma.customerOrderItem.update({
        where: { id: orderItemId },
        data: {
          ...(date !== undefined ? { date } : {}),
          ...(timeSlot !== undefined ? { timeSlot } : {}),
          ...(serviceNotesUpdate(notes)),
          ...(riderId !== undefined ? { riderId } : {}),
        },
      });

      // If status is provided, update parent CustomerOrder status
      let updatedOrder = null;
      if (status) {
        const mappedStatus = mapToOrderStatus(status);
        updatedOrder = await prisma.customerOrder.update({
          where: { id: orderItem.orderId },
          data: {
            status: mappedStatus,
            ...(riderId ? { deliveryPersonName: riderId } : {}),
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          item: updatedItem,
          order: updatedOrder || orderItem.order,
          status: updatedOrder?.status || status,
        },
      });
    }

    // 2. Direct CustomerOrder update by order ID
    if (body.orderId) {
      const mappedStatus = status ? mapToOrderStatus(status) : undefined;
      const updatedOrder = await prisma.customerOrder.update({
        where: { id: body.orderId },
        data: {
          ...(mappedStatus ? { status: mappedStatus } : {}),
          ...(notes !== undefined ? { notes } : {}),
          ...(riderId ? { deliveryPersonName: riderId } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          order: updatedOrder,
          status: updatedOrder.status,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Missing orderItemId or orderId" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Calendar Services API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update calendar service" },
      { status: 500 }
    );
  }
}

function serviceNotesUpdate(notes: string | undefined) {
  if (notes === undefined) return {};
  return { serviceNotes: notes };
}

function mapToOrderStatus(status: string): OrderStatus {
  const s = status.toUpperCase();
  if (s === "COMPLETED" || s === "DELIVERED") return OrderStatus.COMPLETED;
  if (s === "PROCESSING") return OrderStatus.PROCESSING;
  if (s === "CANCELLED" || s === "REJECTED") return OrderStatus.CANCELLED;
  if (s === "PAID") return OrderStatus.PAID;
  return OrderStatus.PENDING;
}
