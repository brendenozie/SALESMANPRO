import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
// Note: verifyAuth and NextResponse are no longer needed here, as they are managed by the middleware utilities.

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
    items: itemsArray,
    notes: invoice.notes || 'N/A',
    createdAt: invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A',
  };
}

/**
 * GET Handler: Fetches a list of invoices with filtering and searching.
 */
async function getInvoices(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus");

  // --- Input Validation ---
  if (!companyId) {
    return formatResponse(false, null, "Missing required query parameter: companyId", 400);
  }

  // --- Where Clause Construction ---
  const whereClause: any = {
    companyId: companyId,
  };

  if (filterStatus && filterStatus !== 'All') {
    whereClause.status = filterStatus;
  }

  // --- Data Fetching ---
  // Fetching all relevant data first, as the search filter logic is client-side/in-memory
  let invoices = await prisma.patientInvoices.findMany({
    where: whereClause,
    include: {
      patient: { select: { name: true } },
    },
    orderBy: { invoiceDate: 'desc' },
  });

  // --- In-Memory Search Filtering ---
  if (searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    invoices = invoices.filter(invoice => {
      // Safely parse items for search, checking for both array and string storage
      const rawItems = (invoice as any).items;
      let itemsString = '';

      if (Array.isArray(rawItems)) {
        itemsString = JSON.stringify(rawItems).toLowerCase();
      } else {
        itemsString = String(rawItems ?? '').toLowerCase();
      }

      return (
        invoice.patient?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        String(invoice.id ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
        itemsString.includes(lowerCaseSearchTerm)
      );
    });
  }

  // --- Data Formatting ---
  const enrichedInvoices = await Promise.all(
    invoices.map(async (invoice) => formatInvoiceData(invoice))
  );

  // --- Success Response ---
  return formatResponse(true, enrichedInvoices, "Invoices list fetched successfully", 200);
}

/**
 * POST Handler: Creates a new invoice.
 */
async function createInvoice(request: Request) {
  const body = await request.json();
  const { patientId, amount, invoiceDate, dueDate, items, notes, status, companyId } = body;

  // --- Input Validation ---
  if (!patientId || !amount || !invoiceDate || !items || !companyId) {
    return formatResponse(
      false,
      null,
      "Missing required fields: patientId, amount, invoiceDate, items, companyId",
      400
    );
  }

  // --- Creation Logic ---
  const newInvoice = await prisma.patientInvoices.create({
    data: {
      patientId: patientId,
      companyId: companyId,
      amount: parseFloat(amount),
      invoiceDate: new Date(invoiceDate),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      // Store items as JSON (not as a string) to satisfy Prisma InputJsonValue[] type.
      // Ensure items is parsed if it's a string coming from the client.
      items: (() => {
        if (Array.isArray(items)) return items;
        if (typeof items === 'string') {
          try {
            return JSON.parse(items);
          } catch {
            // fallback: wrap primitive/string in an array
            return [items];
          }
        }
        // fallback to array containing the value or empty array
        return items ? [items] : [];
      })() as any,
      notes: notes,
      status: status || 'PENDING',
    },
    include: {
      patient: { select: { name: true } },
    },
  });

  // --- Success Response ---
  const formattedNewInvoice = await formatInvoiceData(newInvoice);
  return formatResponse(true, formattedNewInvoice, "Invoice created successfully", 201);
}


// Wrap and export all handlers
export const GET = withApiHandler(getInvoices);
export const POST = withApiHandler(createInvoice);
