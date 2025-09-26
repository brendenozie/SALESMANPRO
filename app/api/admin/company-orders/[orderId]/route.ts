import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- Type Definitions for the Handlers ---

type RouteParams = {
  adminSlug: string;
  orderId: string;
};

type HandlerContext = {
  params: RouteParams;
  user?: any; // Replace with your actual User type if defined
};

// --- Core Logic for GET request ---

async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug, orderId } = context.params;

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
            select: { name: true, sellingPrice: true }
          }
        }
      },
      Payment: { select: { transactionId: true, status: true }, take: 1 }
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
      eventName: "Associated Event Name (Needs lookup)",
      quantity: item.quantity,
      price: item.price,
    })),
  };

  return NextResponse.json(formattedOrder, { status: 200 });
}

// --- Core Logic for PUT request ---

async function handlePut(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug, orderId } = context.params;
  const body = await request.json();
  const { status, notes } = body;

  if (!status) {
    return NextResponse.json({ message: "Status is required" }, { status: 400 });
  }

  const validStatuses = ["PENDING", "COMPLETED", "CANCELLED", "SHIPPED", "OUT_FOR_DELIVERY", "REFUNDED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ message: "Invalid status provided" }, { status: 400 });
  }

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
    },
  });

  if (status === "REFUNDED" || status === "CANCELLED") {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: orderId },
      select: { marketplaceListingId: true, quantity: true }
    });

    await prisma.$transaction(
      orderItems.map(item =>
        prisma.marketplaceListings.update({
          where: { id: item.marketplaceListingId || '' },
          data: { quantity: { increment: item.quantity } },
        })
      )
    );

    await prisma.payment.updateMany({
      where: { orderId: orderId },
      data: { status: "REFUNDED" }
    });
  }

  return NextResponse.json(
    { message: "Order status updated", order: updatedOrder },
    { status: 200 }
  );
}

// --- Exported Route Handlers (Wrapped) ---

/**
 * GET /api/admin/[adminSlug]/orders/[orderId]
 * Fetches a single order's details.
 */
export const GET = withApiHandler(handleGet);

/**
 * PUT /api/admin/[adminSlug]/orders/[orderId]
 * Updates an order's status and handles related business logic like refunds.
 */
export const PUT = withApiHandler(handlePut);
