// app/api/admin/[adminSlug]/pos/sale/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function POST(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const body = await request.json();

  const { eventId, customerName, customerEmail, paymentMethod, items, notes } = body;

  if (!eventId || !customerName || !customerEmail || !paymentMethod || !items || items.length === 0) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  try {
    // Find the company associated with the adminSlug
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Validate event and ticket products
    const event = await prisma.event.findUnique({
      where: { id: eventId, companyId: company.id },
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found or does not belong to this company" }, { status: 404 });
    }

    let totalOrderPrice = 0;
    const orderItemsData = [];
    const inventoryUpdates = [];

    for (const item of items) {
      const ticketProduct = await prisma.marketplaceListings.findUnique({ // Assuming tickets are marketplaceListings
        where: { id: item.ticketProductId },
        select: { id: true, name: true, sellingPrice: true, quantity: true }, // Assuming quantity is on marketplaceListings
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
        // You might need to link to EventRegistration here if each ticket is a separate registration
        // For simplicity, we'll create registrations after the order
      });

      // Prepare inventory update
      inventoryUpdates.push(prisma.marketplaceListings.update({
        where: { id: ticketProduct.id },
        data: { quantity: { decrement: item.quantity } },
      }));
    }

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create CustomerOrder
      const newOrder = await tx.customerOrder.create({
        data: {
          consumer: {
            connectOrCreate: {
              where: { email: customerEmail },
              create: {
                email: customerEmail,
                name: customerName,
                companyId: company.id,
                // You might need to link to a User here if Consumer is a separate profile
                user: {
                  connectOrCreate: {
                    where: { email: customerEmail },
                    create: { email: customerEmail, name: customerName, role: "CONSUMER" }
                  }
                }
              },
            },
          },
          companyId: company.id,
          name: customerName,
          email: customerEmail,
          totalPrice: totalOrderPrice,
          status: "COMPLETED", // Assuming POS sales are completed immediately
          paymentOption: paymentMethod,
          orderSource: "IN_PERSON",
          notes: notes,
          items: {
            create: orderItemsData,
          },
        },
      });

      // 2. Create Payment record
      await tx.payment.create({
        data: {
          userId: newOrder.consumerId, // Assuming consumerId is the userId for payment
          orderId: newOrder.id,
          amount: totalOrderPrice,
          status: "COMPLETED",
          transactionId: `POS-${Date.now()}-${Math.random().toString(36).substring(7)}`, // Generate unique ID
        },
      });

      // 3. Update Inventory
      await Promise.all(inventoryUpdates);

      // 4. Create EventRegistrations for each ticket sold
      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          await tx.eventRegistration.create({
            data: {
              eventId: event.id,
              userId: newOrder.consumerId, // The user who bought the ticket
              status: "REGISTERED", // Initially registered, can be checked in later
              companyId: company.id,
              // If you need to link to a specific ticket type, you might add a field here
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
  } catch (error) {
    console.error("Error processing POS sale:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}