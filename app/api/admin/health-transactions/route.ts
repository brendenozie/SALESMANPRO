// app/api/admin/[adminSlug]/pos/transactions/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function POST(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  const { adminSlug } = params;
  const body = await request.json();

  const { patientId, items, paymentMethod, amountPaid, notes } = body;

  if (!items || items.length === 0 || !paymentMethod || amountPaid === undefined) {
    return NextResponse.json({ message: "Missing required fields: items, paymentMethod, amountPaid" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Optional: Find the consumer if patientId is provided
    let consumer = null;
    if (patientId) {
      consumer = await prisma.consumer.findUnique({
        where: { userId: patientId }, // Assuming patientId is a userId
        select: { id: true }
      });
      if (!consumer) {
        // If patientId is provided but no consumer profile found, you might want to create one
        // Or return an error if patient must exist as a consumer
        console.warn(`Patient with userId ${patientId} not found as a Consumer. Creating order without direct consumer link.`);
      }
    }

    // Create the CustomerOrder
    const newOrder = await prisma.customerOrder.create({
      data: {
        companyId: company.id,
        consumerId: consumer ? consumer.id : undefined, // Link to consumer if found
        totalPrice: amountPaid,
        orderSource: "IN_PERSON", // Mark as POS transaction
        status: "COMPLETED", // Assuming POS transactions are immediately completed
        paymentOption: paymentMethod,
        // You might want to add more details like payment gateway transaction ID here
        // For simplicity, we'll just use the amountPaid
        items: {
          create: items.map((item: any) => ({
            marketplaceListingId: item.productId,
            quantity: item.quantity,
            price: item.unitPrice,
            status: "COMPLETED", // Order item status
          })),
        },
        // Optional: Add patient contact info if not linked to existing user
        name: patientId ? undefined : (body.patientName || 'Walk-in Customer'),
        email: patientId ? undefined : (body.patientEmail || 'N/A'),
        phone: patientId ? undefined : (body.patientPhone || 'N/A'),
      },
    });

    // Create a Payment record for the order
    await prisma.payment.create({
      data: {
        userId: patientId || (await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } }))?.id || 'some_default_admin_id', // Link to the user who processed it or a default admin
        orderId: newOrder.id,
        amount: amountPaid,
        status: "COMPLETED",
        transactionId: `POS-${newOrder.id}-${Date.now()}`, // Generate a unique transaction ID
      },
    });

    // Update inventory for each item (decrement quantity)
    for (const item of items) {
      await prisma.marketplaceListings.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
      // You might also want to create an InventoryLog entry here
    }

    return NextResponse.json(
      {
        message: "POS transaction processed successfully",
        orderId: newOrder.id,
        totalAmount: newOrder.totalPrice,
        status: newOrder.status,
        timestamp: newOrder.createdAt,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error processing POS transaction:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
