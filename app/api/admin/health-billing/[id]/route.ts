// app/api/admin/[adminSlug]/billing/invoices/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";


// Helper function to format invoice data for the frontend
async function formatInvoiceData(invoice: any) {
  const patientName = invoice.patient?.name || 'N/A';
  const itemsArray = Array.isArray(invoice.items) ? invoice.items : (typeof invoice.items === 'string' ? JSON.parse(invoice.items) : []);

  return {
    id: invoice.id,
    patientId: invoice.patientId,
    patientName: patientName,
    amount: invoice.amount,
    date: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : 'N/A',
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : 'N/A',
    status: invoice.status,
    items: itemsArray, // Ensure this is an array of strings/objects
    notes: invoice.notes || 'N/A',
    createdAt: invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A',
  };
}


// app/api/admin/billing/[id]/route.ts
// This file handles GET, PUT, DELETE for a specific invoice by ID

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  

  try {
    const invoice = await prisma.patientInvoices.findUnique({
      where: { id },
      include: {
        patient: { select: { name: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const formattedInvoice = await formatInvoiceData(invoice);
    return NextResponse.json(formattedInvoice);
  } catch (err: any) {
    console.error(`GET /api/admin/billing/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

const { id } = params;
  const body = await request.json();
  const { patientId, amount, invoiceDate, dueDate, items, notes, status } = body;

  try {
    const updatedInvoice = await prisma.patientInvoices.update({
      where: { id },
      data: {
        patientId: patientId, // Allow updating patient if needed
        amount: amount ? parseFloat(amount) : undefined, // Ensure amount is a float if provided
        invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        items: items ? JSON.stringify(items) : undefined, // Store items as a JSON string
        notes: notes,
        status: status,
      },
      include: {
        patient: { select: { name: true } },
      },
    });

    const formattedUpdatedInvoice = await formatInvoiceData(updatedInvoice);

    return NextResponse.json(formattedUpdatedInvoice);
  } catch (err: any) {
    console.error(`PUT /api/admin/billing/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

const { id } = params;

  try {
    await prisma.patientInvoices.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Invoice deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error(`DELETE /api/admin/billing/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
