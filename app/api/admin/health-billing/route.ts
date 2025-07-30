// app/api/admin/billing/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Assuming this path correctly points to your Prisma client initialization

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus"); // 'PAID', 'PENDING', 'OVERDUE', 'CANCELED', 'All'

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  try {
    const whereClause: any = {
      companyId: companyId,
    };

    if (filterStatus && filterStatus !== 'All') {
      whereClause.status = filterStatus;
    }

    let invoices = await prisma.patientInvoices.findMany({
      where: whereClause,
      include: {
        patient: { select: { name: true } }, // Select patient's name
      },
      orderBy: { invoiceDate: 'desc' }, // Order by most recent invoices
    });

    // Client-side filtering for search term across patient name, invoice ID, and items
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      invoices = invoices.filter(invoice => {
        const itemsString = Array.isArray(invoice.items) ? JSON.stringify(invoice.items).toLowerCase() : (typeof invoice.items === 'string' ? invoice.items.toLowerCase() : '');
        return (
          invoice.patient?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
          invoice.id.toLowerCase().includes(lowerCaseSearchTerm) ||
          itemsString.includes(lowerCaseSearchTerm)
        );
      });
    }

    const enrichedInvoices = await Promise.all(
      invoices.map(async (invoice) => formatInvoiceData(invoice))
    );

    return NextResponse.json(enrichedInvoices);
  } catch (err: any) {
    console.error("GET /api/admin/billing error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { patientId, amount, invoiceDate, dueDate, items, notes, status, companyId } = body;

  if (!patientId || !amount || !invoiceDate || !items || !companyId) {
    return NextResponse.json(
      { error: "Missing required fields: patientId, amount, invoiceDate, items, companyId" },
      { status: 400 }
    );
  }

  try {
    const newInvoice = await prisma.patientInvoices.create({
      data: {
        patientId: patientId,
        companyId: companyId,
        amount: parseFloat(amount), // Ensure amount is a float
        invoiceDate: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        items: JSON.stringify(items), // Store items as a JSON string
        notes: notes,
        status: status || 'PENDING', // Default to PENDING if not provided
      },
      include: {
        patient: { select: { name: true } },
      },
    });

    const formattedNewInvoice = await formatInvoiceData(newInvoice);

    return NextResponse.json(formattedNewInvoice, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/billing error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
