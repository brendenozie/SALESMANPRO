// app/api/invoices/route.ts
import { PrismaClient } from '@prisma/client';
// Incorporate the new imports
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse'; 

// Removed old imports:
// import { NextApiRequest, NextApiResponse } from 'next';
// import { verifyAuth } from '@/lib/verifyAuth';
// import { NextResponse } from 'next/server'; // Will be handled by formatResponse

const prisma = new PrismaClient();

// --- GET Handler Logic ---
const getInvoicesLogic = async (req: Request) => {
    // Access query parameters from the Request object    
    const { searchParams } = new URL(req.url);
    
    const companyId = searchParams.get('companyId');

    // Fetch all invoices for the specified company
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
    return formatResponse(true, newInvoice, 'Invoice created successfully', 201);
};

// Export the wrapped POST function
export const POST = withApiHandler(postInvoiceLogic);