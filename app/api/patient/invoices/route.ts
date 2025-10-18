// app/api/patient/invoices/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function getHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId"); // User.id of patient
  const status = searchParams.get("status"); // 'PAID', 'PENDING', 'OVERDUE', 'CANCELED', 'All'
  const searchTerm = searchParams.get("searchTerm") || "";

  if (!patientId) {
    return formatResponse(false, null, "Missing patientId", 400);
  }

  try {
    const whereClause: any = {
      patientId: patientId,
    };

    if (status && status !== "All") {
      whereClause.status = status;
    }

    let invoices = await prisma.patientInvoices.findMany({
      where: whereClause,
      include: {
        patient: { select: { name: true } },
      },
      orderBy: { invoiceDate: "desc" },
    });

    // Client-side filtering for search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      invoices = invoices.filter((invoice) => {
        const itemsString = Array.isArray(invoice.items)
          ? JSON.stringify(invoice.items).toLowerCase()
          : typeof invoice.items === "string"
          ? (invoice.items as string).toLowerCase()
          : "";
        return (
          invoice.id.toLowerCase().includes(lowerCaseSearchTerm) ||
          itemsString.includes(lowerCaseSearchTerm)
        );
      });
    }

    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      patientId: invoice.patientId,
      patientName: invoice.patient?.name || "N/A",
      amount: invoice.amount,
      date: invoice.invoiceDate
        ? new Date(invoice.invoiceDate).toISOString().split("T")[0]
        : "N/A",
      dueDate: invoice.dueDate
        ? new Date(invoice.dueDate).toISOString().split("T")[0]
        : "N/A",
      status: invoice.status,
      items: Array.isArray(invoice.items)
        ? invoice.items
        : typeof invoice.items === "string"
        ? JSON.parse(invoice.items)
        : [],
      notes: invoice.notes || "N/A",
      createdAt: invoice.createdAt
        ? new Date(invoice.createdAt).toLocaleDateString()
        : "N/A",
    }));

    return formatResponse(true, formattedInvoices);
  } catch (err: any) {
    console.error("GET /api/patient/invoices error:", err);
    return formatResponse(
      false,
      null,
      err.message || "Internal server error",
      500
    );
  }
}

export const GET = withApiHandler(getHandler);
