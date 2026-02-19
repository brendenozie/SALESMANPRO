import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { Prisma } from "@prisma/client";

// --------------------
// Types
// --------------------

type RouteParams = {
  adminSlug: string;
};

type HandlerContext = {
  params: RouteParams;
  user?: {
    id: string;
    role?: string;
  };
};

const SORTABLE_FIELDS = ["createdAt", "totalPrice", "status"] as const;
type SortBy = (typeof SORTABLE_FIELDS)[number];

const SORT_ORDER = ["asc", "desc"] as const;
type SortOrder = (typeof SORT_ORDER)[number];

// --------------------
// Helpers
// --------------------

const toInt = (value: string | null, fallback: number) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback;

async function getCompanyId(slug: string): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { slug },
    select: { id: true },
  });
  return company?.id ?? null;
}

const escapeCSV = (value: unknown) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
};

// --------------------
// GET Handler
// --------------------

async function handleGet(
  request: Request,
  { params }: HandlerContext
): Promise<NextResponse> {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const page = Math.max(1, toInt(searchParams.get("page"), 1));
  const limit = Math.min(50, Math.max(1, toInt(searchParams.get("limit"), 10)));

  const sortBy = searchParams.get("sortBy") as SortBy | null;
  const sortOrder = searchParams.get("sortOrder") as SortOrder | null;

  if (sortBy && !SORTABLE_FIELDS.includes(sortBy)) {
    return NextResponse.json({ message: "Invalid sortBy parameter" }, { status: 400 });
  }

  if (sortOrder && !SORT_ORDER.includes(sortOrder)) {
    return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
  }

  const companyId = await getCompanyId(adminSlug);
  if (!companyId) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  const where: Prisma.CustomerOrderWhereInput = {
    companyId,
    // ...(status && { status }),
    ...(search && {
      OR: [
        { id: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [orders, totalItems] = await prisma.$transaction([
    prisma.customerOrder.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy ?? "createdAt"]: sortOrder ?? "desc",
      },
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
    prisma.customerOrder.count({ where }),
  ]);

  const formattedOrders = orders.map(order => ({
    id: order.id,
    customerName: order.name ?? "N/A",
    customerEmail: order.email ?? "N/A",
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    status: order.status,
    paymentMethod: order.paymentOption ?? "N/A",
    itemCount: order._count.items,
  }));

  // --------------------
  // CSV Export
  // --------------------

  if (searchParams.get("export") === "csv") {
    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Email",
      "Total Price",
      "Date",
      "Status",
      "Payment Method",
      "Item Count",
    ];

    const rows = formattedOrders.map(order => [
      escapeCSV(order.id),
      escapeCSV(order.customerName),
      escapeCSV(order.customerEmail),
      escapeCSV(order.totalPrice?.toFixed(2)),
      escapeCSV(order.createdAt?.toISOString()),
      escapeCSV(order.status),
      escapeCSV(order.paymentMethod),
      escapeCSV(order.itemCount),
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="orders.csv"',
      },
    });
  }

  return NextResponse.json(
    {
      orders: formattedOrders,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
    { status: 200 }
  );
}

// --------------------
// Export
// --------------------

export const GET = withApiHandler(handleGet);

// import { NextResponse } from "next/server";
//  {
//   const { adminSlug } = context.params;
//   const { searchParams } = new URL(request.url);

//   // 1. Parameter Parsing & Validation
//   const isExport = searchParams.get("export") === "csv";
//   const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
//   const limit = isExport ? 1000 : Math.min(100, parseInt(searchParams.get("limit") || "10"));
  
//   const search = searchParams.get("search");
//   const status = searchParams.get("status");
//   const sortBy = searchParams.get("sortBy") || "createdAt";
//   const sortOrder = (searchParams.get("sortOrder") || "desc") as 'asc' | 'desc';

//   // 2. Atomic Where Clause
//   const where = {
//     Company: { slug: adminSlug }, // Security & Scope in one check
//     ...(status && { status }),
//     ...(search && {
//       OR: [
//         { id: { contains: search, mode: 'insensitive' as const } },
//         { name: { contains: search, mode: 'insensitive' as const } },
//         { email: { contains: search, mode: 'insensitive' as const } },
//       ],
//     }),
//   };

//   try {
//     // 3. Concurrent Execution
//     const [orders, totalItems] = await Promise.all([
//       prisma.customerOrder.findMany({
//         where,
//         orderBy: { [sortBy]: sortOrder },
//         skip: isExport ? 0 : (page - 1) * limit,
//         take: limit,
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           totalPrice: true,
//           createdAt: true,
//           status: true,
//           paymentOption: true,
//           _count: { select: { items: true } },
//         },
//       }),
//       prisma.customerOrder.count({ where }),
//     ]);

//     const formatted = orders.map(order => ({
//       id: order.id,
//       customerName: order.name || 'N/A',
//       customerEmail: order.email || 'N/A',
//       totalPrice: order.totalPrice,
//       createdAt: order.createdAt,
//       status: order.status,
//       paymentMethod: order.paymentOption || 'N/A',
//       itemCount: order._count.items,
//     }));

//     // 4. Optimized CSV Response
//     if (isExport) {
//       const headers = "Order ID,Customer,Email,Total,Date,Status,Payment,Items\n";
//       const rows = formatted.map(o => 
//         `"${o.id}","${o.customerName}","${o.customerEmail}",${o.totalPrice},"${o.createdAt.toISOString()}",${o.status},"${o.paymentMethod}",${o.itemCount}`
//       ).join("\n");

//       return new NextResponse(headers + rows, {
//         headers: {
//           'Content-Type': 'text/csv',
//           'Content-Disposition': `attachment; filename="orders-${adminSlug}.csv"`,
//         },
//       });
//     }

//     return NextResponse.json({
//       orders: formatted,
//       totalItems,
//       totalPages: Math.ceil(totalItems / limit),
//       currentPage: page,
//     });

//   } catch (error: any) {
//     throw error; // Caught by withApiHandler
//   }
// }

// export const GET = withApiHandler(handleGet);
// import { NextResponse } from "next/server";

//   }

//   const validSortOrder = ["asc", "desc"];
//   if (!validSortOrder.includes(sortOrder)) {
//     return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
//   }

//   const company = await prisma.company.findUnique({
//     where: { slug: adminSlug },
//     select: { id: true }
//   });

//   if (!company) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   const whereClause: any = {
//     companyId: company.id,
//   };

//   if (statusFilter) {
//     whereClause.status = statusFilter;
//   }

//   if (searchKeyword) {
//     whereClause.OR = [
//       { id: { contains: searchKeyword, mode: 'insensitive' } },
//       { name: { contains: searchKeyword, mode: 'insensitive' } },
//       { email: { contains: searchKeyword, mode: 'insensitive' } },
//     ];
//   }

//   const [orders, totalItems] = await prisma.$transaction([
//     prisma.customerOrder.findMany({
//       where: whereClause,
//       orderBy: { [sortBy]: sortOrder },
//       skip: (page - 1) * limit,
//       take: limit,
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         totalPrice: true,
//         createdAt: true,
//         status: true,
//         paymentOption: true,
//         _count: {
//           select: { items: true },
//         },
//       },
//     }),
//     prisma.customerOrder.count({ where: whereClause }),
//   ]);

//   const formattedOrders = orders.map(order => ({
//     id: order.id,
//     customerName: order.name || 'N/A',
//     customerEmail: order.email || 'N/A',
//     totalPrice: order.totalPrice,
//     createdAt: order.createdAt,
//     status: order.status,
//     paymentMethod: order.paymentOption || 'N/A',
//     itemCount: order._count.items,
//   }));

//   // Handle CSV export if requested
//   if (searchParams.get("export") === "csv") {
//     const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Total Price', 'Date', 'Status', 'Payment Method', 'Item Count'];
//     const rows = formattedOrders.map(order => [
//       order.id,
//       order.customerName,
//       order.customerEmail,
//       order.totalPrice?.toFixed(2),
//       order.createdAt?.toISOString(),
//       order.status,
//       order.paymentMethod,
//       order.itemCount
//     ]);
//     const csvContent = [
//       headers.join(','),
//       ...rows.map(row => row.join(','))
//     ].join('\n');

//     return new NextResponse(csvContent, {
//       status: 200,
//       headers: {
//         'Content-Type': 'text/csv',
//         'Content-Disposition': 'attachment; filename="orders.csv"',
//       },
//     });
//   }

//   return NextResponse.json({
//     orders: formattedOrders,
//     totalItems,
//     totalPages: Math.ceil(totalItems / limit),
//     currentPage: page,
//   }, { status: 200 });
// }

// // --- Exported Route Handler (Wrapped) ---

// 
// export const GET = withApiHandler(handleGet);
