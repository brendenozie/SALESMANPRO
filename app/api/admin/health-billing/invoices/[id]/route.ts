// app/api/admin/[adminSlug]/billing/invoices/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const invoice = await prisma.customerOrder.findUnique({
      where: {
        id: id,
        companyId: company.id, // Ensure invoice belongs to this company
      },
      select: {
        id: true,
        name: true, // Patient name on order
        email: true,
        phone: true,
        totalPrice: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        paymentOption: true,
        items: {
          select: {
            quantity: true,
            price: true,
            marketplaceListing: { select: { name: true } }
          }
        },
        Payment: {
          select: { transactionId: true, status: true, amount: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1, // Get most recent payment
        }
      },
    });

    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found or not associated with this company" }, { status: 404 });
    }

    const formattedInvoice = {
      ...invoice,
      patientName: invoice.name || 'N/A',
      patientEmail: invoice.email || 'N/A',
      patientPhone: invoice.phone || 'N/A',
      date: new Date(invoice.createdAt || '').toISOString().split('T')[0],
      paymentDetails: invoice.Payment.length > 0 ? invoice.Payment[0] : null,
      items: invoice.items.map(item => ({
        name: item.marketplaceListing?.name || 'Item',
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      })),
    };

    return NextResponse.json(formattedInvoice, { status: 200 });

  } catch (error) {
    console.error("Error fetching invoice details:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;
  const body = await request.json();

  const { status, paymentMethod, amountPaid, notes } = body;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const invoiceToUpdate = await prisma.customerOrder.findUnique({
        where: {
            id: id,
            companyId: company.id,
        },
        select: { id: true, status: true, totalPrice: true, consumerId: true }
    });

    if (!invoiceToUpdate) {
        return NextResponse.json({ message: "Invoice not found or not associated with this company" }, { status: 404 });
    }

    let updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (paymentMethod) updateData.paymentOption = paymentMethod;
    // Add notes field if it exists on CustomerOrder

    const updatedInvoice = await prisma.customerOrder.update({
      where: { id: id },
      data: updateData,
    });

    // If status is updated to 'Paid' or 'COMPLETED', create/update Payment record
    if (status === 'Paid' || status === 'COMPLETED') {
        // Find or create a user ID to associate the payment with (e.g., the consumer or an admin)
        const userIdForPayment = invoiceToUpdate.consumerId ?
            (await prisma.consumer.findUnique({ where: { id: invoiceToUpdate.consumerId }, select: { userId: true } }))?.userId :
            (await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } }))?.id || 'some_default_admin_id';

        await prisma.payment.upsert({
            where: { transactionId: `INV-${id}-${new Date().getTime()}` }, // Use a unique identifier for upsert
            update: {
                status: "COMPLETED",
                amount: amountPaid || invoiceToUpdate.totalPrice,
                userId: userIdForPayment,
            },
            create: {
                userId: userIdForPayment,
                orderId: id,
                amount: amountPaid || invoiceToUpdate.totalPrice,
                status: "COMPLETED",
                transactionId: `INV-${id}-${Date.now()}`, // Ensure uniqueness
            },
        });
    }


    return NextResponse.json(
      { message: "Invoice updated successfully", invoice: updatedInvoice },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}