// app/api/admin/[adminSlug]/orders/[orderId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string; orderId: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, orderId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const order = await prisma.customerOrder.findUnique({
      where: { id: orderId, companyId: company.id },
      include: {
        items: {
          include: {
            marketplaceListing: {
              select: { name: true, sellingPrice: true } // Assuming ticket type name and price
            }
          }
        },
        Payment: { select: { transactionId: true, status: true }, take: 1 } // Get first payment
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const formattedOrder = {
      id: order.id,
      consumerId: order.consumerId,
      customerName: order.name || 'N/A',
      customerEmail: order.email || 'N/A',
      phone: order.phone || 'N/A',
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      status: order.status,
      orderSource: order.orderSource,
      paymentMethod: order.paymentOption || 'N/A',
      paymentTransactionId: order.Payment[0]?.transactionId || null,
      items: order.items.map(item => ({
        orderItemId: item.id,
        ticketProductId: item.marketplaceListingId,
        ticketType: item.marketplaceListing?.name || 'N/A',
        eventName: "Associated Event Name (Needs lookup)", // Needs lookup based on ticket product
        quantity: item.quantity,
        price: item.price,
      })),
    };

    return NextResponse.json(formattedOrder, { status: 200 });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string; orderId: string } }
) {
  const { adminSlug, orderId } = params;
  const body = await request.json();
  const { status, notes } = body;

  if (!status) {
    return NextResponse.json({ message: "Status is required" }, { status: 400 });
  }

  // Validate status against your enum
  const validStatuses = ["PENDING", "COMPLETED", "CANCELLED", "SHIPPED", "OUT_FOR_DELIVERY", "REFUNDED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ message: "Invalid status provided" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.customerOrder.update({
      where: { id: orderId, companyId: company.id },
      data: {
        status: status,
        // You might have a 'notes' field on CustomerOrder
        // notes: notes,
      },
    });

    // If status is REFUNDED or CANCELLED, you might need to:
    // 1. Create a refund record in your Payment model or a new Refund model.
    // 2. Revert inventory quantities for associated OrderItems.
    if (status === "REFUNDED" || status === "CANCELLED") {
      // Example: Reverting inventory (simplified)
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: orderId },
        select: { marketplaceListingId: true, quantity: true }
      });

      await prisma.$transaction(
        orderItems.map(item =>
          prisma.marketplaceListings.update({
            where: { id: item.marketplaceListingId },
            data: { quantity: { increment: item.quantity } },
          })
        )
      );
      // You'd also update the Payment status to REFUNDED
      await prisma.payment.updateMany({
        where: { orderId: orderId },
        data: { status: "REFUNDED" }
      });
    }

    return NextResponse.json(
      { message: "Order status updated", order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order status:", error);
    if (error instanceof Error && error.message.includes("RecordNotFound")) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}