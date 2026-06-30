import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { OrderStatus } from "@prisma/client";
// import { CustomerOrderStatus } from "@prisma/client"; // Assuming CustomerOrderStatus enum is available

// Define the expected structure for route parameters
type RouteParams = { params: { adminSlug: string; id: string } };

// --- GET Handler ---

async function handleGetInvoice(request: Request, { params }: RouteParams) {
  const { adminSlug, id } = params;

  const cacheKey = `admin:invoices:${adminSlug || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  try {
    if (company) {
      await cacheSet(cacheKey, company, 60);
    }
  } catch (e) {}

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const invoice = await prisma.customerOrder.findUnique({
    where: {
      id: id,
      companyId: company.id, // Ensure invoice belongs to this company
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      totalPrice: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      paymentOption: true,
      items: {
        select: {
          quantity: true,
          price: true,
          marketplaceListing: { select: { name: true } }
        }
      },
      Payment: {
        select: { transactionId: true, status: true, amount: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1, // Get most recent payment
      }
    },
  });

  if (!invoice) {
    return formatResponse(false, null, "Invoice not found or not associated with this company", 404);
  }

  const formattedInvoice = {
    ...invoice,
    patientName: invoice.name || 'N/A',
    patientEmail: invoice.email || 'N/A',
    patientPhone: invoice.phone || 'N/A',
    date: new Date(invoice.createdAt || '').toISOString().split('T')[0],
    paymentDetails: invoice.Payment.length > 0 ? invoice.Payment[0] : null,
    items: invoice.items.map(item => ({
      name: item.marketplaceListing?.name || 'Item',
      quantity: item.quantity,
      price: item.price,
      subtotal: item.quantity * item.price,
    })),
  };

  try {
    await cacheSet(cacheKey, formattedInvoice, 60);
  } catch (e) {}

  // withApiHandler will wrap this result in formatResponse(true, ...) with status 200
  return formatResponse(true, formattedInvoice, "Invoice fetched successfully", 200);
}

// --- PUT Handler ---

async function handlePutInvoice(request: Request, { params }: RouteParams) {
  const { adminSlug, id } = params;
  const body = await request.json();

  const { status, paymentMethod, amountPaid, notes } = body;

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const invoiceToUpdate = await prisma.customerOrder.findUnique({
    where: {
      id: id,
      companyId: company.id,
    },
    select: { id: true, status: true, totalPrice: true, consumerId: true }
  });

  if (!invoiceToUpdate) {
    return formatResponse(false, null, "Invoice not found or not associated with this company", 404);
  }

  let updateData: any = { updatedAt: new Date() };
  if (status) updateData.status = status;
  if (paymentMethod) updateData.paymentOption = paymentMethod;
  if (notes) updateData.notes = notes; // Assuming notes exists on CustomerOrder

  const updatedInvoice = await prisma.customerOrder.update({
    where: { id: id },
    data: updateData,
  });

  // If status is updated to 'Paid' or 'COMPLETED', create/update Payment record
  const paymentStatuses: OrderStatus[] = ['Paid', 'COMPLETED'] as OrderStatus[];

  if (status && paymentStatuses.includes(status)) {
    // Find or create a user ID to associate the payment with
    const consumer = invoiceToUpdate.consumerId ?
      await prisma.consumer.findUnique({ where: { id: invoiceToUpdate.consumerId }, select: { userId: true } }) :
      null;

    const userIdForPayment = consumer?.userId || 'system_generated_id'; // Default to a system ID if no consumer link

    await prisma.payment.create({
      data: {
        userId: userIdForPayment,
        orderId: id,
        amount: amountPaid || invoiceToUpdate.totalPrice, // Use amountPaid from body or total price
        status: "COMPLETED",
        transactionId: `INV-${id}-${Date.now()}`, // Ensure uniqueness for a new Payment record
      },
    });
    // NOTE: For subsequent payments/updates, you might want to use upsert or findFirst to avoid duplicates
    // This current implementation creates a new payment record every time PUT sets the status to Paid/COMPLETED.
  }

  // withApiHandler will wrap this result in formatResponse(true, ...) with status 200
  
    try { await cacheDel(`admin:invoices:${adminSlug || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedInvoice, "Invoice updated successfully", 200);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(handleGetInvoice);
export const PUT = withApiHandler(handlePutInvoice);
