// app/api/invoices/[id]/route.ts
import { PrismaClient } from '@prisma/client';

// Incorporate the new imports
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse'; 

// Removed old imports:
// import { NextApiRequest, NextApiResponse } from 'next';
// import { formatResponse } from "@/lib/formatResponse";

// import { request } from 'http';

const prisma = new PrismaClient();

// Type definition for the context object, which includes dynamic parameters
type RouteContext = {
    params: {
        id: string; // The dynamic part of the URL: /invoices/[id]
    };
};

// Helper to access the dynamic 'id' parameter
const getInvoiceId = (context: RouteContext) => context.params.id;


// --- GET Handler Logic ---
const getInvoiceLogic = async (req: Request, context: RouteContext) => {
    const invoiceId = getInvoiceId(context);

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { client: { include: { user: true } } }
    });

    if (!invoice) {
        // Use formatResponse for business-logic failure (404 Not Found)
        return formatResponse(false, null, 'Invoice not found', 404);
    }
    
    // Use formatResponse for success
    return formatResponse(true, invoice, 'Invoice retrieved successfully', 200);
};

// Export the wrapped GET function
export const GET = withApiHandler(getInvoiceLogic);


// --- PUT Handler Logic ---
const putInvoiceLogic = async (req: Request, context: RouteContext) => {
    const invoiceId = getInvoiceId(context);
    const body = await req.json();

    const { clientId, invoiceNumber, amount, issueDate, dueDate, status, notes } = body;

    // Data parsing for Prisma (dates and float)
    const data: any = {
        clientId,
        invoiceNumber,
        status,
        notes,
    };

    if (amount !== undefined) {
        data.amount = parseFloat(amount);
    }
    if (issueDate) {
        data.issueDate = new Date(issueDate);
    }
    if (dueDate) {
        data.dueDate = new Date(dueDate);
    }
    
    const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: data,
    });

    // Use formatResponse for success
    return formatResponse(true, updatedInvoice, 'Invoice updated successfully', 200);
};

// Export the wrapped PUT function
export const PUT = withApiHandler(putInvoiceLogic);


// --- DELETE Handler Logic ---
const deleteInvoiceLogic = async (req: Request, context: RouteContext) => {
    const invoiceId = getInvoiceId(context);

    // Check if the invoice exists before attempting delete to return a proper 404 if needed
    // (though Prisma delete will throw an error if not found, which withApiHandler will catch)
    
    // Attempt to delete
    await prisma.invoice.delete({
        where: { id: invoiceId },
    });
    
    // Use formatResponse for success (no data returned)
    return formatResponse(true, null, 'Invoice deleted successfully', 200);
};

// Export the wrapped DELETE function
export const DELETE = withApiHandler(deleteInvoiceLogic);