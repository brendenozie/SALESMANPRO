import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * Helper function to format invoice data for the frontend.
 * This is crucial for handling the stored JSON string 'items'.
 */
async function formatInvoiceData(invoice: any) {
  const patientName = invoice.patient?.name || 'N/A';
  // Safely parse the 'items' field, which is stored as a JSON string in Prisma.
  const itemsArray = typeof invoice.items === 'string'
    ? JSON.parse(invoice.items)
    : (Array.isArray(invoice.items) ? invoice.items : []);

  return {
    id: invoice.id,
    patientId: invoice.patientId,
    patientName: patientName,
    amount: invoice.amount,
    date: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : 'N/A',
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : 'N/A',
    status: invoice.status,
    items: itemsArray, // Returns the parsed array
    notes: invoice.notes || 'N/A',
    createdAt: invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A',
  };
}

/**
 * GET Handler: Retrieves a single invoice by ID.
 */
async function getInvoice(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { id } = params;

  // --- Data Fetching ---
  const invoice = await prisma.patientInvoices.findUnique({
    where: { id },
    include: {
      patient: { select: { name: true } },
    },
  });

  if (!invoice) {
    return formatResponse(false, null, "Invoice not found.", 404);
  }

  // --- Success Response ---
  const formattedInvoice = await formatInvoiceData(invoice);
  return formatResponse(true, formattedInvoice, "Invoice retrieved successfully.", 200);
}

/**
 * PUT Handler: Updates an existing invoice.
 */
async function updateInvoice(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { id } = params;
  const body = await request.json();
  const { patientId, amount, invoiceDate, dueDate, items, notes, status } = body;

  // --- Update Data Preparation ---
  const updateData: any = {
    patientId: patientId,
    amount: amount !== undefined ? parseFloat(amount) : undefined,
    invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    // CRITICAL: Stringify the items array for storage
    items: items !== undefined ? JSON.stringify(items) : undefined,
    notes: notes,
    status: status,
  };

  // --- Update Logic ---
  const updatedInvoice = await prisma.patientInvoices.update({
    where: { id },
    data: updateData,
    include: {
      patient: { select: { name: true } },
    },
  });

  // --- Success Response ---
  const formattedUpdatedInvoice = await formatInvoiceData(updatedInvoice);
  return formatResponse(true, formattedUpdatedInvoice, "Invoice updated successfully.", 200);
}

/**
 * DELETE Handler: Deletes an invoice.
 */
async function deleteInvoice(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { id } = params;

  // --- Deletion Logic ---
  // Check if the invoice exists before attempting delete
  const existingInvoice = await prisma.patientInvoices.findUnique({ where: { id }, select: { id: true } });
  if (!existingInvoice) {
      return formatResponse(false, null, "Invoice not found.", 404);
  }

  await prisma.patientInvoices.delete({
    where: { id },
  });

  // --- Success Response ---
  return formatResponse(true, { message: "Invoice deleted successfully" }, "Invoice deleted successfully.", 200);
}


// Wrap and export all handlers
export const GET = withApiHandler(getInvoice);
export const PUT = withApiHandler(updateInvoice);
export const DELETE = withApiHandler(deleteInvoice);
