// import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { PlanStatus, SubscriptionStatus, BillingCycle } from '@prisma/client'; // Import the new enums


// app/api/admin/[slug]/billing/invoices/route.ts
import {BillingInvoiceStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Initialize Prisma Client
// const prisma = new PrismaClient();

// This API route handles fetching paginated and filtered invoices for a company.
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const companyId = params.slug;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status")?.toUpperCase() as BillingInvoiceStatus;

    const startIndex = (page - 1) * limit;

    // Define the filter conditions
    const whereClause: any = {
      companyId: companyId,
    };

    if (status) {
      whereClause.status = status;
    }

    // Fetch total count of invoices for pagination
    const totalInvoiceItems = await prisma.patientInvoices.count({
      where: whereClause,
    });

    // Fetch invoices with pagination, filtering, and including user data
    const invoices = await prisma.patientInvoices.findMany({
      where: whereClause,
      take: limit,
      skip: startIndex,
      orderBy: { issuedDate: "desc" },
      include: {
        patient: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Map Prisma results to the InvoiceItem interface
    const invoicesData = invoices.map((inv) => ({
      id: inv.id,
      userId: inv.patientId,
      userName: inv.patient?.name || "N/A",
      userEmail: inv.patient?.email || "N/A",
      amountDue: inv.amount,
      currency: "USD", // Assuming USD for now
      dueDate: inv.dueDate?.toISOString() || "N/A",
      status: inv.status.charAt(0) + inv.status.slice(1).toLowerCase() as "Paid" | "Unpaid" | "Overdue",
      downloadUrl: `/api/invoices/${companyId}/${inv.id}.pdf`, // Dynamic dummy URL for now
      periodStart: new Date(new Date(inv.invoiceDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices", details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
