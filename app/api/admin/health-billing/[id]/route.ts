import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


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


async function getInvoice(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { id } = params;

  // --- Data Fetching ---
  
    const cacheKey = `admin:health-billing:${params.adminSlug || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const invoice = await prisma.patientInvoices.findUnique({
    where: { id },
    include: {
      patient: { select: { name: true } },
    },
  });

  try {
    if (invoice) {
      await cacheSet(cacheKey, invoice, 60);
    }
  } catch (e) {}

  if (!invoice) {
    return formatResponse(false, null, "Invoice not found.", 404);
  }

  // --- Success Response ---
  const formattedInvoice = await formatInvoiceData(invoice);
  return formatResponse(true, formattedInvoice, "Invoice retrieved successfully.", 200);
}


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
  
    try { await cacheDel(`admin:health-billing:${params.adminSlug || 'global'}:*`); } catch (e) {}
    return formatResponse(true, formattedUpdatedInvoice, "Invoice updated successfully.", 200);
}


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
  
    try { await cacheDel(`admin:health-billing:${params.adminSlug || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { message: "Invoice deleted successfully" }, "Invoice deleted successfully.", 200);
}


// Wrap and export all handlers
export const GET = withApiHandler(getInvoice);
export const PUT = withApiHandler(updateInvoice);
export const DELETE = withApiHandler(deleteInvoice);
