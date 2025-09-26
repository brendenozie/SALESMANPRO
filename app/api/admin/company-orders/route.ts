import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- Type Definitions for the Handlers ---
type RouteParams = {
  adminSlug: string;
};

type HandlerContext = {
  params: RouteParams;
  user?: any; // Replace with your actual User type if defined
};

// --- Core Logic for GET request ---
async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug } = context.params;
  const { searchParams } = new URL(request.url);

  const statusFilter = searchParams.get("status");
  const searchKeyword = searchParams.get("search");
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

  if (statusFilter) {
    whereClause.status = statusFilter;
  }

  if (searchKeyword) {
    whereClause.OR = [
      { id: { contains: searchKeyword, mode: 'insensitive' } },
      { name: { contains: searchKeyword, mode: 'insensitive' } },
      { email: { contains: searchKeyword, mode: 'insensitive' } },
    ];
  }

  const [orders, totalItems] = await prisma.$transaction([
    prisma.customerOrder.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        totalPrice: true,
        createdAt: true,
        status: true,
        paymentOption: true,
        _count: {
          select: { items: true },
        },
      },
    }),
    prisma.customerOrder.count({ where: whereClause }),
  ]);

  const formattedOrders = orders.map(order => ({
    id: order.id,
    customerName: order.name || 'N/A',
    customerEmail: order.email || 'N/A',
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    status: order.status,
    paymentMethod: order.paymentOption || 'N/A',
    itemCount: order._count.items,
  }));

  // Handle CSV export if requested
  if (searchParams.get("export") === "csv") {
    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Total Price', 'Date', 'Status', 'Payment Method', 'Item Count'];
    const rows = formattedOrders.map(order => [
      order.id,
      order.customerName,
      order.customerEmail,
      order.totalPrice.toFixed(2),
      order.createdAt?.toISOString(),
      order.status,
      order.paymentMethod,
      order.itemCount
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="orders.csv"',
      },
    });
  }

  return NextResponse.json({
    orders: formattedOrders,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  }, { status: 200 });
}

// --- Exported Route Handler (Wrapped) ---

/**
 * GET /api/admin/[adminSlug]/orders
 * Fetches a paginated and filterable list of orders.
 */
export const GET = withApiHandler(handleGet);
