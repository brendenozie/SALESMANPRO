// pages/api/invoices/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

const prisma = new PrismaClient();


// GET /api/admin/[slug]/experts
// Fetches all experts for a specific company.
export async function GET(request: Request, res: NextApiResponse) {

   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


    const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  try {
   // Find all clients and include their associated user data
     const invoices = await prisma.invoice.findMany({
        where:{companyId},
        include: {
          client: {
            include: { user: { select: { name: true } } }
          },
        },
        orderBy: {
          issueDate: 'desc'
        }
      });
      // res.status(200).json(invoices);
      
      return NextResponse.json({invoices},{ status: 200 });
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      // res.status(500).json({ error: 'Failed to fetch clients' });
      return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
          );
    }
}

// POST /api/admin/[slug]/experts
// Creates a new expert (including a new user with EXPERT role).
export async function POST(request: Request, res: NextApiResponse) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  // const { searchParams } = new URL(request.url);
  // const companyId = searchParams.get('companyId');


  try {
    const body = await request.json();
        
    const { clientId, invoiceNumber, amount, issueDate, dueDate, status, notes,companyId } = body;

    const newInvoice = await prisma.invoice.create({
      data: {
        clientId,
        invoiceNumber,
        amount: parseFloat(amount),
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        status,
        notes,
        companyId
      },
    });

    // res.status(201).json(newInvoice);

      // res.status(201).json({ ...newClient, user: newUser });
      return NextResponse.json(
            // { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { newInvoice },
            { status: 200 }
          );
    
    } catch (error) {
      console.error('Failed to create client:', error);
      // res.status(500).json({ error: 'Failed to create client' });
      return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
          );
    }
    }


