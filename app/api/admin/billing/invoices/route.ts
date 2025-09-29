import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- GET /api/admin/[slug]/billing/invoices
export const GET = withApiHandler(async (req, { params, user }) => {
  const companyId = params.slug;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const status = searchParams.get("status")?.toUpperCase();

  const startIndex = (page - 1) * limit;

  const whereClause: any = { companyId };

  if (status) {
    whereClause.status = status;
  }

  // Restrict doctors to invoices for their own patients unless admin
  if (user?.role !== "ADMIN") {
    whereClause.patient = { doctorId: user.id };
  }

  const totalInvoiceItems = await prisma.patientInvoices.count({ where: whereClause });

  const invoices = await prisma.patientInvoices.findMany({
    where: whereClause,
    take: limit,
    skip: startIndex,
    orderBy: { invoiceDate: "desc" },
    include: {
      patient: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const invoicesData = invoices.map((inv) => ({
    id: inv.id,
    userId: inv.patientId,
    userName: inv.patient?.name || "N/A",
    userEmail: inv.patient?.email || "N/A",
    amountDue: inv.amount,
    currency: "USD", // hardcoded for now
    dueDate: inv.dueDate?.toISOString() || "N/A",
    status:
      (inv.status.charAt(0).toUpperCase() +
        inv.status.slice(1).toLowerCase()) as "Paid" | "Unpaid" | "Overdue",
    downloadUrl: `/api/invoices/${companyId}/${inv.id}.pdf`,
    periodStart: new Date(
      new Date(inv.invoiceDate).getTime() - 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    periodEnd: inv.invoiceDate.toISOString(),
    issuedDate: inv.invoiceDate.toISOString(),
    lineItems: inv.items as any,
  }));

  const totalInvoicePages = Math.ceil(totalInvoiceItems / limit);

  return NextResponse.json({
    invoicesData,
    totalInvoiceItems,
    totalInvoicePages,
  });
});
