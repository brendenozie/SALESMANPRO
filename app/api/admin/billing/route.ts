import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function mapInvoiceStatus(status: string, dueDate: Date): 'Paid' | 'Pending' | 'Overdue' | 'Disputed' {
  if (status === 'PAID') return 'Paid';
  if (status === 'CANCELLED' || status === 'CANCELED') return 'Disputed';
  if (new Date() > new Date(dueDate)) return 'Overdue';
  return 'Pending';
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    if (!companyId) {
      return json({ success: false, message: "companyId required" }, 400);
    }

    // 1. Fetch canonical invoices for this company
    const invoices = await prisma.invoice.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { id: true, name: true, delivery: true } },
        client: { select: { name: true } },
        consumer: { select: { name: true } },
      },
    });

    // 2. Fetch completed/paid deliveries to calculate actual delivery revenue
    const deliveries = await prisma.delivery.findMany({
      where: { companyId },
      select: { id: true, totalAmount: true, deliveryFee: true, status: true },
    });

    // 3. Fetch direct operating expenses (fuel and maintenance)
    const [fuelAgg, maintenanceAgg] = await Promise.all([
      prisma.transportFuelLog.aggregate({
        where: { vehicle: { companyId } },
        _sum: { cost: true, quantity: true },
      }),
      prisma.transportMaintenance.aggregate({
        where: { vehicle: { companyId } },
        _sum: { cost: true },
      }),
    ]);

    const mappedInvoices = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.customerName || inv.client?.name || inv.consumer?.name || 'Logistics Client',
      amount: inv.amount,
      dueDate: inv.dueDate.toISOString(),
      status: mapInvoiceStatus(inv.status, inv.dueDate),
      serviceType: inv.notes?.includes('Long Haul') ? 'Long Haul' : inv.notes?.includes('Warehousing') ? 'Warehousing' : 'Last Mile',
      tax: inv.taxAmount || Math.round(inv.amount * 0.16),
    }));

    const totalRevenue = deliveries.reduce((acc, curr) => acc + (curr.totalAmount || curr.deliveryFee || 0), 0) +
      invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);

    const pendingReceivables = invoices.filter(i => i.status !== 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
    const totalFuelCost = fuelAgg._sum.cost || 0;
    const totalMaintenanceCost = maintenanceAgg._sum.cost || 0;
    const directOperatingExpenses = totalFuelCost + totalMaintenanceCost;
    const grossOperationalResult = totalRevenue - directOperatingExpenses;

    return json({
      success: true,
      data: mappedInvoices,
      financialSummary: {
        totalRevenue,
        pendingReceivables,
        totalFuelCost,
        totalMaintenanceCost,
        directOperatingExpenses,
        grossOperationalResult,
      },
    });
  } catch (error: any) {
    console.error("[BILLING_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to fetch billing" }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const {
      companyId,
      customerName,
      customerEmail,
      customerPhone,
      amount,
      serviceType,
      dueDate,
      notes,
      orderId,
    } = body;

    if (!companyId || !amount) {
      return json({ success: false, message: "companyId and amount are required" }, 400);
    }

    const invoiceNumber = `INV-LOG-${Date.now().toString().slice(-6)}`;
    const amt = Number(amount);
    const tax = Math.round(amt * 0.16);

    const newInvoice = await prisma.invoice.create({
      data: {
        companyId,
        invoiceNumber,
        customerName: customerName || "Logistics Client",
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        subtotal: amt - tax,
        taxAmount: tax,
        amount: amt,
        amountDue: amt,
        amountPaid: 0,
        status: "PENDING",
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        notes: notes || `Service: ${serviceType || 'Last Mile Delivery'}`,
        orderId: orderId || null,
      },
    });

    return json({
      success: true,
      message: "Invoice generated successfully",
      data: newInvoice,
    }, 201);
  } catch (error: any) {
    console.error("[BILLING_POST_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to create invoice" }, 500);
  }
}
