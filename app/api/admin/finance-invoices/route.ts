import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/invoices/route.ts

// Incorporate the new imports
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse'; 

import prisma from "@/server/db/prismadb";

// --- GET Handler Logic ---
const getInvoicesLogic = async (req: Request) => {
    // Access query parameters from the Request object    
    const { searchParams } = new URL(req.url);
    
    const companyId = searchParams.get('companyId');

    // Fetch all invoices for the specified company
    
    const cacheKey = `admin:finance-invoices:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const invoices = await prisma.invoice.findMany({
        where: { companyId: companyId || undefined },
        include: {
            client: {
                include: { user: { select: { name: true } } }
            },
        },
        orderBy: {
            issueDate: 'desc'
        }
    });

  try {
    if (invoices) {
      await cacheSet(cacheKey, invoices, 60);
    }
  } catch (e) {}

    // Use formatResponse for success
    return formatResponse(true, invoices, 'Invoices retrieved successfully', 200);
};

// Export the wrapped GET function
export const GET = withApiHandler(getInvoicesLogic);


// --- POST Handler Logic ---
const postInvoiceLogic = async (req: Request) => {
    const body = await req.json();
    const { clientId, invoiceNumber, amount, issueDate, dueDate, status, notes, companyId } = body;

    const newInvoice = await prisma.invoice.create({
        data: {
            clientId,
            invoiceNumber,
            amount: parseFloat(amount),
            issueDate: new Date(issueDate),
            dueDate: new Date(dueDate),
            status,
            notes,
            companyId,
        },
    });

    // Use formatResponse for success
    
    try { await cacheDel(`admin:finance-invoices:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newInvoice, 'Invoice created successfully', 201);
};

// Export the wrapped POST function
export const POST = withApiHandler(postInvoiceLogic);