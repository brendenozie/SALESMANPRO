import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { ROLES } from "@prisma/client";

// --- Type Definitions for the Handler ---

type RouteParams = {
  adminSlug: string;
};

type HandlerContext = {
  params: RouteParams;
  user?: any; // Replace with your actual User type if defined
};

// --- Core Logic for POST request ---
// This function contains only the business logic, with the wrapper handling
// authentication and the top-level try/catch.
async function handlePost(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug } = context.params;
  const body = await request.json();

  const { eventId, customerName, customerEmail, paymentMethod, items, notes } = body;

  if (!eventId || !customerName || !customerEmail || !paymentMethod || !items || items.length === 0) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId, companyId: company.id },
  });

  if (!event) {
    return NextResponse.json({ message: "Event not found or does not belong to this company" }, { status: 404 });
  }

  let totalOrderPrice = 0;
  interface OrderItemData {
    marketplaceListingId: string;
    quantity: number;
    price: number;
  }
  const orderItemsData: OrderItemData[] = [];
  const inventoryUpdates: Promise<any>[] = [];

  for (const item of items) {
    const ticketProduct = await prisma.marketplaceListings.findUnique({
      where: { id: item.ticketProductId },
      select: { id: true, name: true, sellingPrice: true, quantity: true },
    });

    if (!ticketProduct) {
      return NextResponse.json({ message: `Ticket product ${item.ticketProductId} not found` }, { status: 404 });
    }
    if (ticketProduct.quantity < item.quantity) {
      return NextResponse.json({ message: `Insufficient stock for ${ticketProduct.name}` }, { status: 400 });
    }

    totalOrderPrice += ticketProduct.sellingPrice * item.quantity;
    orderItemsData.push({
      marketplaceListingId: ticketProduct.id,
      quantity: item.quantity,
      price: ticketProduct.sellingPrice,
    });

    inventoryUpdates.push(prisma.marketplaceListings.update({
      where: { id: ticketProduct.id },
      data: { quantity: { decrement: item.quantity } },
    }));
  }

  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Find or create the consumer first
    // Find the user by email first to get the userId
    const existingUser = await tx.user.findUnique({
      where: { email: customerEmail },
      select: { id: true }
    });

    // Find or create the user first
    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const newUser = await tx.user.create({
        data: {
          email: customerEmail,
          name: customerName,
          role: "CONSUMER" as ROLES,
        },
      });
      userId = newUser.id;
    }

    const consumer = await tx.consumer.upsert({
      where: { userId },
      update: {},
      create: {
        companyId: company.id,
        userId: userId,
      },
      include: { user: true }
    });

    const newOrder = await tx.customerOrder.create({
      data: {
        consumerId: consumer.id,
        companyId: company.id,
        name: customerName,
        email: customerEmail,
        totalPrice: totalOrderPrice,
        status: "COMPLETED",
        paymentOption: paymentMethod,
        orderSource: "IN_PERSON",
        notes: notes,
        items: {
          create: orderItemsData,
        },
      },
    });

    await tx.payment.create({
      data: {
        userId: consumer.id,
        orderId: newOrder.id,
        amount: totalOrderPrice,
        status: "COMPLETED",
        transactionId: `POS-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      },
    });

    await Promise.all(inventoryUpdates);

    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        await tx.eventRegistration.create({
          data: {
            eventId: event.id,
            userId: consumer.id,
            status: "REGISTERED",
            companyId: company.id,
          },
        });
      }
    }

    return newOrder;
  });

  return NextResponse.json(
    {
      message: "Sale processed successfully",
      orderId: result.id,
      totalAmount: result.totalPrice,
      status: result.status,
    },
    { status: 201 }
  );
}

// --- Exported Route Handler (Wrapped) ---

/**
 * POST /api/admin/[adminSlug]/pos/sale
 * Processes a point-of-sale transaction for an event.
 */
export const POST = withApiHandler(handlePost);
