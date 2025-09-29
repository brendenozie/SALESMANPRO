

// app/api/patient/invoices/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId"); // This is the User.id for the patient
  const status = searchParams.get("status"); // 'PAID', 'PENDING', 'OVERDUE', 'CANCELED', 'All'
  const searchTerm = searchParams.get("searchTerm") || "";

  if (!patientId) {
    return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
  }

  try {
    const whereClause: any = {
      patientId: patientId, // Link to the User model
    };

    if (status && status !== 'All') {
      whereClause.status = status;
    }

    let invoices = await prisma.patientInvoices.findMany({
      where: whereClause,
      include: {
        patient: { select: { name: true } }, // Patient's name (for consistency)
      },
      orderBy: { invoiceDate: 'desc' },
    });

    // Client-side filtering for search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      invoices = invoices.filter(invoice => {
        const itemsString = Array.isArray(invoice.items) ? JSON.stringify(invoice.items).toLowerCase() : (typeof invoice.items === 'string' ? invoice.items.toLowerCase() : '');
        return (
          invoice.id.toLowerCase().includes(lowerCaseSearchTerm) ||
          itemsString.includes(lowerCaseSearchTerm)
        );
      });
    }

    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      patientId: invoice.patientId,
      patientName: invoice.patient?.name || 'N/A',
      amount: invoice.amount,
      date: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : 'N/A',
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : 'N/A',
      status: invoice.status,
      items: Array.isArray(invoice.items) ? invoice.items : (typeof invoice.items === 'string' ? JSON.parse(invoice.items) : []),
      notes: invoice.notes || 'N/A',
      createdAt: invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A',
    }));

    return NextResponse.json(formattedInvoices);
  } catch (err: any) {
    console.error("GET /api/patient/invoices error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
