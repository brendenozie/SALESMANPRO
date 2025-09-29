import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Define the expected structure for route parameters (adminSlug)
type POSTParams = { params: { adminSlug: string } };

/**
 * POST Handler: Processes a new Point of Sale transaction.
 */
async function handlePostTransaction(request: Request, { params }: POSTParams) {
  const { adminSlug } = params;
  const body = await request.json();

  const { patientId, items, paymentMethod, amountPaid, notes } = body;

  if (!items || items.length === 0 || paymentMethod === undefined || amountPaid === undefined) {
    return formatResponse(false, null, "Missing required fields: items, paymentMethod, amountPaid", 400);
  }

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const companyId = company.id;

  // 1. Find or verify Consumer/Patient
  let consumer = null;
  if (patientId) {
    consumer = await prisma.consumer.findUnique({
      where: { userId: patientId }, // Assuming patientId is a userId
      select: { id: true }
    });
    if (!consumer) {
      console.warn(`Patient with userId ${patientId} not found as a Consumer. Proceeding as a walk-in/unlinked customer.`);
    }
  }

  // 2. Create the CustomerOrder (Transaction)
  const orderData: any = {
    companyId: companyId,
    totalPrice: amountPaid,
    orderSource: "IN_PERSON", // Mark as POS transaction
    status: "COMPLETED", // Assuming POS transactions are immediately completed
    paymentOption: paymentMethod,
    name: patientId ? undefined : (body.patientName || 'Walk-in Customer'),
    email: patientId ? undefined : (body.patientEmail || 'N/A'),
    phone: patientId ? undefined : (body.patientPhone || 'N/A'),
    notes: notes,
    items: {
      create: items.map((item: any) => ({
        marketplaceListingId: item.productId,
        quantity: item.quantity,
        price: item.unitPrice,
        status: "COMPLETED",
        // The order item must link to an actual order item model, not just a service/product.
        // Assuming 'price' here is the final amount paid for that item instance.
      })),
    },
  };
  if (consumer) {
    orderData.consumerId = consumer.id;
  }

  const newOrder = await prisma.customerOrder.create({
    data: orderData,
  });

  // 3. Create a Payment record for the order
  // NOTE: This links the payment to the order and the user who processed the order (auth.user.id)
  const processorUserId = (request as any).auth?.user?.id || 'default_admin_id';
  
  await prisma.payment.create({
    data: {
      userId: processorUserId,
      orderId: newOrder.id,
      amount: amountPaid,
      status: "COMPLETED",
      transactionId: `POS-${newOrder.id}-${Date.now()}`,
    },
  });

  // 4. Update inventory for each item (decrement quantity)
  // NOTE: This should likely be a transaction or use a safer inventory logic in a real app
  for (const item of items) {
    await prisma.marketplaceListings.update({
      where: { id: item.productId },
      data: {
        quantity: {
          decrement: item.quantity,
        },
      },
    });
  }

  // Return success response with status 201
  const responseData = {
    message: "POS transaction processed successfully",
    orderId: newOrder.id,
    totalAmount: newOrder.totalPrice,
    status: newOrder.status,
    timestamp: newOrder.createdAt,
  };

  return formatResponse(true, responseData, "Transaction successful", 201);
}

// Wrap the core logic with the API handler middleware
export const POST = withApiHandler(handlePostTransaction);
