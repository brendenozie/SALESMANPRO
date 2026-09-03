import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { OrderStatus } from "@prisma/client";

// Define the expected structure for route parameters
type RouteParams = { params: { adminSlug: string } };

// --- GET Handler ---

async function handleGetInvoices(request: Request, { params }: RouteParams) {
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
    return formatResponse(false, null, "Invalid sortBy parameter", 400);
  }

  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return formatResponse(false, null, "Invalid sortOrder parameter", 400);
  }

  const cacheKey = buildTenantCacheKey(adminSlug, "invoices", { endDate, limit, page, sortBy, sortOrder, startDate });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const whereClause: any = {
    companyId: company.id,
  };

  if (filterStatus && filterStatus !== 'All') {
    whereClause.status = filterStatus;
  }

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      // Set to the end of the day for inclusive search
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.createdAt.lte = endOfDay;
    }
  }

  if (searchKeyword) {
    const lowerCaseSearch = searchKeyword.toLowerCase();
    // Using string matching for ID and patient name, and nested filtering for item names
    whereClause.OR = [
      { name: { contains: searchKeyword, mode: 'insensitive' } },
      { id: { contains: searchKeyword, mode: 'insensitive' } },
      { items: { some: { marketplaceListing: { name: { contains: searchKeyword, mode: 'insensitive' } } } } },
    ];
  }

  const [invoices, totalItems] = await prisma.$transaction([
    prisma.customerOrder.findMany({
      where: whereClause,
      // NOTE: Using orderBy with case sensitivity requires database index setup.
      // Assuming a simple text field sort is acceptable here.
      orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
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
    patientName: invoice.name || 'N/A',
    amount: invoice.totalPrice,
    date: new Date(invoice.createdAt || '').toISOString().split('T')[0],
    status: invoice.status,
    itemsSummary: invoice.items.map(item => item.marketplaceListing?.name || 'Item').join(', '),
  }));

  // withApiHandler will wrap this result in formatResponse(true, ...) with status 200
  
  try {
    await cacheSet(cacheKey, {
    invoices: formattedInvoices,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
  }, 60);
  } catch (e) {}

  return formatResponse(true, {
    invoices: formattedInvoices,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
  }, "Invoices fetched successfully", 200);
}

// --- POST Handler ---

async function handlePostInvoice(request: Request, { params }: RouteParams) {
  const { adminSlug } = params;
  const body = await request.json();

  const { patientId, items, paymentMethod, amountPaid, status = "PENDING" as OrderStatus, notes } = body;

  if (!items || items.length === 0 || amountPaid === undefined) {
    return formatResponse(false, null, "Missing required fields: items, amountPaid", 400);
  }

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  let consumer = null;
  
  if (patientId) {
    // Assuming patientId here is the User.id linked to a Consumer profile
    consumer = await prisma.consumer.findUnique({
      where: { userId: patientId },
      include : {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });
    if (!consumer) {
      return formatResponse(false, null, "Patient (Consumer) not found", 404);
    }
  }

  const newInvoice = await prisma.customerOrder.create({
    data: {
      companyId: company.id,
      consumerId: consumer?.id || "",
      name: consumer?.user?.name || body.patientName || 'Walk-in Patient',
      email: consumer?.user?.email || body.patientEmail,
      phone: consumer?.user?.phone || body.patientPhone,
      // consumerId: consumer?.id,
      // name: consumer?.name || body.patientName || 'Walk-in Patient',
      // email: consumer?.email || body.patientEmail,
      // phone: consumer?.phone || body.patientPhone,
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
      notes: notes, // Assuming notes exists on CustomerOrder
    },
  });

  // Create a Payment record if status indicates payment was made
  if (status !== "PENDING" && status !== "CANCELED") {
    const userIdForPayment = patientId || (await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } }))?.id || 'system_generated_id';
    await prisma.payment.create({
      data: {
        userId: userIdForPayment,
        orderId: newInvoice.id,
        amount: newInvoice.totalPrice || 0,
        status: status === "Paid" || status === "COMPLETED" ? "COMPLETED" : "PENDING",
        transactionId: `INV-${newInvoice.id}-${Date.now()}`,
      }
    });
  }

  // Return success response with status 201
  
    try {
      await cacheDel(`tenant:${adminSlug}:invoices:*`);
      await cacheDel(`admin:invoices:*`);
    } catch (e) {}
    return formatResponse(true, { message: "Invoice generated successfully", invoice: newInvoice }, null, 201);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(handleGetInvoices);
export const POST = withApiHandler(handlePostInvoice);
