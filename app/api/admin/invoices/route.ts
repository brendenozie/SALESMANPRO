// app/api/admin/[adminSlug]/billing/invoices/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const filterStatus = searchParams.get("status");
  const searchKeyword = searchParams.get("search");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const validSortBy = ["createdAt", "totalPrice", "status"];
  if (!validSortBy.includes(sortBy)) {
    return NextResponse.json({ message: "Invalid sortBy parameter" }, { status: 400 });
  }

  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const whereClause: any = {
      companyId: company.id,
    };

    if (filterStatus && filterStatus !== 'All') {
      whereClause.status = filterStatus;
    }

    if (startDate) {
      whereClause.createdAt = { ...whereClause.createdAt, gte: new Date(startDate) };
    }
    if (endDate) {
      whereClause.createdAt = { ...whereClause.createdAt, lte: new Date(endDate) };
    }

    if (searchKeyword) {
      whereClause.OR = [
        { name: { contains: searchKeyword, mode: 'insensitive' } }, // Patient name on order
        { id: { contains: searchKeyword, mode: 'insensitive' } }, // Invoice ID
        { items: { some: { marketplaceListing: { name: { contains: searchKeyword, mode: 'insensitive' } } } } }, // Item name
      ];
    }

    const [invoices, totalItems] = await prisma.$transaction([
      prisma.customerOrder.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true, // Patient name on order
          totalPrice: true,
          createdAt: true,
          status: true,
          items: {
            select: {
              marketplaceListing: { select: { name: true } }
            }
          }
        },
      }),
      prisma.customerOrder.count({ where: whereClause }),
    ]);

    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      patientName: invoice.name || 'N/A', // Use name from order, or link to consumer/user
      amount: invoice.totalPrice,
      date: new Date(invoice.createdAt || '').toISOString().split('T')[0],
      status: invoice.status,
      itemsSummary: invoice.items.map(item => item.marketplaceListing?.name || 'Item').join(', '),
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  const { adminSlug } = params;
  const body = await request.json();

  const { patientId, items, paymentMethod, amountPaid, status = "PENDING", notes } = body;

  if (!items || items.length === 0 || amountPaid === undefined) {
    return NextResponse.json({ message: "Missing required fields: items, amountPaid" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    let consumer = null;
    if (patientId) {
      consumer = await prisma.consumer.findUnique({
        where: { userId: patientId },
        select: { id: true, name: true, email: true, phone: true }
      });
      if (!consumer) {
        return NextResponse.json({ message: "Patient (Consumer) not found" }, { status: 404 });
      }
    }

    const newInvoice = await prisma.customerOrder.create({
      data: {
        companyId: company.id,
        consumerId: consumer?.id,
        name: consumer?.name || body.patientName || 'Walk-in Patient',
        email: consumer?.email || body.patientEmail,
        phone: consumer?.phone || body.patientPhone,
        totalPrice: parseFloat(amountPaid),
        orderSource: "IN_PERSON", // Or "ADMIN_GENERATED"
        status,
        paymentOption: paymentMethod || "Cash",
        items: {
          create: items.map((item: any) => ({
            marketplaceListingId: item.marketplaceListingId,
            quantity: item.quantity,
            price: item.price,
            status: "PENDING", // Order item status
          })),
        },
        // Add notes field if it exists on CustomerOrder
      },
    });

    // Create a Payment record if status is not PENDING
    if (status !== "PENDING") {
        await prisma.payment.create({
            data: {
                userId: patientId || (await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } }))?.id || 'some_default_admin_id',
                orderId: newInvoice.id,
                amount: newInvoice.totalPrice,
                status: status === "Paid" ? "COMPLETED" : "PENDING", // Map 'Paid' to 'COMPLETED'
                transactionId: `INV-${newInvoice.id}-${Date.now()}`, // Generate a unique transaction ID
            }
        });
    }


    return NextResponse.json(
      { message: "Invoice generated successfully", invoice: newInvoice },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}