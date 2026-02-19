import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // // app/api/admin/[adminSlug]/tickets/route.ts
// app/api/admin/[adminSlug]/tickets/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// --------------------
// Helpers
// --------------------

const VALID_SORT_BY = ["name", "sellingPrice", "quantity"] as const;
const VALID_SORT_ORDER = ["asc", "desc"] as const;

const toInt = (v: unknown, fallback?: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
};

const toFloat = (v: unknown, fallback?: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

async function getCompanyId(slug: string): Promise<string | null> {

  const cacheKey = `companyId:${slug}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return cached as string;
  } catch (e) {}

  const company = await prisma.company.findUnique({
    where: { slug },
    select: { id: true },
  });

    try {
      if (company?.id) {
        await cacheSet(cacheKey, company.id, 300); // cache for 5 minutes
      }
    } catch (e) {}

  return company?.id ?? null;
}

// --------------------
// GET
// --------------------

export const GET = withApiHandler(async (request, { params }) => {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, toInt(searchParams.get("page"), 1)!);
  const limit = Math.min(50, Math.max(1, toInt(searchParams.get("limit"), 10)!));
  const sortBy = searchParams.get("sortBy") ?? "name";
  const sortOrder = searchParams.get("sortOrder") ?? "asc";
  const search = searchParams.get("search");

  if (!VALID_SORT_BY.includes(sortBy as any)) {
    return formatResponse(false, null, "Invalid sortBy parameter", 400);
  }

  if (!VALID_SORT_ORDER.includes(sortOrder as any)) {
    return formatResponse(false, null, "Invalid sortOrder parameter", 400);
  }

  const companyId = await getCompanyId(adminSlug);
  if (!companyId) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const where: any = {
    companyId,
    productCategory: { name: "Event Tickets" },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  
    const cacheKey = `admin:company-tickets:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const [tickets, totalItems] = await prisma.$transaction([
    prisma.marketplaceListings.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        sellingPrice: true,
        quantity: true,
      },
    }),
    prisma.marketplaceListings.count({ where }),
  ]);

  try {
    if (tickets) {
      await cacheSet(cacheKey, tickets, 60);
    }
  } catch (e) {}

  const formatted = tickets.map(t => {
    const sold = Math.floor(t.quantity * 0.6); // placeholder
    return {
      id: t.id,
      eventName: "Associated Event Name (Needs lookup)",
      type: t.name,
      price: t.sellingPrice,
      quantity: t.quantity,
      sold,
      remaining: t.quantity - sold,
    };
  });

  return formatResponse(true, {
    tickets: formatted,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  });
});

// --------------------
// POST
// --------------------

export const POST = withApiHandler(async (request, { params }) => {
  const { adminSlug } = params;
  const body = await request.json();

  const {
    eventId,
    type,
    description,
    price,
    quantity,
    isAvailable = true,
  } = body;

  if (!eventId || !type || price === undefined || quantity === undefined) {
    return formatResponse(false, null, "Missing required fields", 400);
  }

  const parsedPrice = toFloat(price);
  const parsedQty = toInt(quantity);

  if (parsedPrice === undefined || parsedQty === undefined || parsedQty < 0) {
    return formatResponse(false, null, "Invalid price or quantity", 400);
  }

  const companyId = await getCompanyId(adminSlug);
  if (!companyId) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const ticket = await prisma.$transaction(async (tx) => {
    const category =
      (await tx.productCategory.findFirst({
        where: { name: "Event Tickets", companyId },
        select: { id: true, name: true },
      })) ??
      (await tx.productCategory.create({
        data: {
          name: "Event Tickets",
          slug: "event-tickets",
          description: "Category for all event tickets.",
          longDescription: "Category for all event tickets.",
          seoTitle: "Event Tickets",
          seoDescription: "Event Tickets",
          metaKeywords: ["event", "tickets"],
          sortOrder: 100,
          visible: true,
          createdBy: "admin", // TODO: replace with actual admin user ID
          updatedBy: "admin",
          status: "ACTIVE",
          allBrands: [],
          tags: [],
          subcategories: {},
          imageAlt: "Event Tickets",
          productCount: 0,
          isFeatured: false,
          showInHomepage: false,
          attributes: {},
          localization: {},
          companyId: companyId,
        },
        select: { id: true, name: true },
      }));

    const product = await tx.marketplaceListings.create({
      data: {
        companyId,
        name: type,
        description: description || `Ticket for ${type}`,
        sellingPrice: parsedPrice,
        buyingPrice: parsedPrice,
        finalPrice: parsedPrice,
        quantity: parsedQty,
        isAvailable,
        productCategoryId: category.id,
        category: category.name,
        sellerType: "COMPANY",
        images: [],
        tags: [],
        subCategory: {},
      },
    });

    await tx.productCategory.update({
      where: { id: category.id },
      data: { productCount: { increment: 1 } },
    });

    try { await cacheDel(`admin:company-tickets:${companyId || 'global'}:*`); } catch (e) {}

    return product;
  });

  return formatResponse(true, ticket, "Ticket type created successfully", 201);
});

// import { NextResponse } from "next/server";
//  => {
//   const { adminSlug } = params;
//   const { searchParams } = new URL(request.url);

//   const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
//   const limit = Math.min(100, parseInt(searchParams.get("limit") || "10"));
//   const skip = (page - 1) * limit;
//   const search = searchParams.get("search");
//   const eventId = searchParams.get("eventId");

//   const where = {
//     company: { slug: adminSlug },
//     productCategory: { name: "Event Tickets" },
//     ...(eventId && { eventId }),
//     ...(search && {
//       OR: [
//         { name: { contains: search, mode: 'insensitive' as const } },
//         { description: { contains: search, mode: 'insensitive' as const } },
//       ],
//     }),
//   };

//   const [tickets, totalItems] = await Promise.all([
//     prisma.marketplaceListings.findMany({
//       where,
//       skip,
//       take: limit,
//       orderBy: { [searchParams.get("sortBy") || "name"]: searchParams.get("sortOrder") || "asc" },
//       select: {
//         id: true,
//         name: true,
//         sellingPrice: true,
//         quantity: true,
//         event: { select: { title: true } }, // Resolved TODO: actual event lookup
//         _count: {
//           select: { eventRegistrations: true } // Real sales data
//         }
//       },
//     }),
//     prisma.marketplaceListings.count({ where }),
//   ]);

//   const formatted = tickets.map((t) => {
//     const sold = t._count.eventRegistrations;
//     return {
//       id: t.id,
//       eventName: t.event?.title || "Standalone Ticket",
//       type: t.name,
//       price: t.sellingPrice,
//       quantity: t.quantity,
//       sold: sold,
//       remaining: Math.max(0, t.quantity - sold),
//     };
//   });

//   return formatResponse(true, {
//     tickets: formatted,
//     totalItems,
//     totalPages: Math.ceil(totalItems / limit),
//     currentPage: page,
//   });
// });

// 
// export const POST = withApiHandler(async (request, { params, user }) => {
//   const { adminSlug } = params;
//   const body = await request.json();
//   const { eventId, type, description, price, quantity, isAvailable } = body;

//   if (!eventId || !type || !price || !quantity) {
//     return formatResponse(false, null, "Missing required fields", 400);
//   }

//   // 1. Verify Company and Get/Create Category in one transaction
//   const result = await prisma.$transaction(async (tx) => {
//     const company = await tx.company.findUnique({ 
//       where: { slug: adminSlug },
//       select: { id: true }
//     });
//     if (!company) throw new Error("Company not found");

//     const category = await tx.productCategory.upsert({
//       where: { companyId_name: { companyId: company.id, name: "Event Tickets" } },
//       update: { productCount: { increment: 1 } },
//       create: {
//         name: "Event Tickets",
//         slug: "event-tickets",
//         companyId: company.id,
//         status: "ACTIVE",
//         productCount: 1,
//         createdBy: user?.id || "system",
//       }
//     });

//     return await tx.marketplaceListings.create({
//       data: {
//         companyId: company.id,
//         eventId: eventId,
//         name: type,
//         description: description || `Ticket for ${type}`,
//         sellingPrice: parseFloat(price),
//         buyingPrice: parseFloat(price),
//         finalPrice: parseFloat(price),
//         quantity: parseInt(quantity),
//         isAvailable: isAvailable ?? true,
//         productCategoryId: category.id,
//         category: category.name,
//         sellerType: "COMPANY",
//       },
//     });
//   });

//   return formatResponse(true, result, "Ticket created successfully", 201);
// });
// import { NextResponse } from "next/server";
//  => {
//     const { adminSlug } = params;
//     const { searchParams } = new URL(request.url);

//     const eventIdFilter = searchParams.get("eventId");
//     const searchKeyword = searchParams.get("search");
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const sortBy = searchParams.get("sortBy") || "name";
//     const sortOrder = searchParams.get("sortOrder") || "asc";

//     const validSortBy = ["name", "sellingPrice", "quantity"];
//     if (!validSortBy.includes(sortBy)) {
//       return formatResponse(false, null, "Invalid sortBy parameter", 400);
//     }

//     const validSortOrder = ["asc", "desc"];
//     if (!validSortOrder.includes(sortOrder)) {
//       return formatResponse(false, null, "Invalid sortOrder parameter", 400);
//     }

//     const company = await prisma.company.findUnique({
//       where: { slug: adminSlug },
//       select: { id: true },
//     });

//     if (!company) {
//       return formatResponse(false, null, "Company not found", 404);
//     }

//     const whereClause: any = {
//       companyId: company.id,
//       productCategory: { name: "Event Tickets" }, // adjust if using IDs
//     };

//     if (eventIdFilter) {
//       // TODO: Add filtering logic if marketplaceListings links to events
//       // e.g., whereClause.eventId = eventIdFilter;
//     }

//     if (searchKeyword) {
//       whereClause.OR = [
//         { name: { contains: searchKeyword, mode: "insensitive" } },
//         { description: { contains: searchKeyword, mode: "insensitive" } },
//       ];
//     }

//     const [tickets, totalItems] = await prisma.$transaction([
//       prisma.marketplaceListings.findMany({
//         where: whereClause,
//         orderBy: { [sortBy]: sortOrder },
//         skip: (page - 1) * limit,
//         take: limit,
//         select: {
//           id: true,
//           name: true,
//           sellingPrice: true,
//           quantity: true,
//         },
//       }),
//       prisma.marketplaceListings.count({ where: whereClause }),
//     ]);

//     const formattedTickets = tickets.map((ticket) => ({
//       id: ticket.id,
//       eventName: "Associated Event Name (Needs lookup)", // TODO: link tickets to events
//       type: ticket.name,
//       price: ticket.sellingPrice,
//       quantity: ticket.quantity,
//       sold: Math.floor(ticket.quantity * 0.6), // mocked
//       remaining: ticket.quantity - Math.floor(ticket.quantity * 0.6),
//     }));

//     return formatResponse(true, {
//       tickets: formattedTickets,
//       totalItems,
//       totalPages: Math.ceil(totalItems / limit),
//       currentPage: page,
//     });
//   }
// );

// // POST /api/admin/[adminSlug]/tickets
// export const POST = withApiHandler(
//   async (request, { params }) => {
//     const { adminSlug } = params;
//     const body = await request.json();

//     const { eventId, type, description, price, quantity, isAvailable } = body;

//     if (!eventId || !type || !price || !quantity) {
//       return formatResponse(false, null, "Missing required fields", 400);
//     }

//     const company = await prisma.company.findUnique({
//       where: { slug: adminSlug },
//       select: { id: true },
//     });

//     if (!company) {
//       return formatResponse(false, null, "Company not found", 404);
//     }

//     // Ensure Event Tickets category exists
//     let eventTicketCategory = await prisma.productCategory.findFirst({
//       where: { name: "Event Tickets", companyId: company.id },
//     });

//     if (!eventTicketCategory) {
//       eventTicketCategory = await prisma.productCategory.create({
//         data: {
//           name: "Event Tickets",
//           slug: "event-tickets",
//           description: "Category for all event tickets.",
//           longDescription: "Category for all event tickets.",
//           seoTitle: "Event Tickets",
//           seoDescription: "Event Tickets",
//           metaKeywords: ["event", "tickets"],
//           sortOrder: 100,
//           visible: true,
//           createdBy: "admin", // TODO: replace with actual admin user ID
//           updatedBy: "admin",
//           status: "ACTIVE",
//           allBrands: [],
//           tags: [],
//           subcategories: {},
//           imageAlt: "Event Tickets",
//           productCount: 0,
//           isFeatured: false,
//           showInHomepage: false,
//           attributes: {},
//           localization: {},
//           companyId: company.id,
//         },
//       });
//     }

//     const newTicketProduct = await prisma.marketplaceListings.create({
//       data: {
//         companyId: company.id,
//         name: type,
//         description: description || `Ticket for ${type}`,
//         sellingPrice: parseFloat(price),
//         buyingPrice: parseFloat(price),
//         quantity: parseInt(quantity),
//         isAvailable: isAvailable ?? true,
//         productCategoryId: eventTicketCategory.id,
//         category: eventTicketCategory.name,
//         finalPrice: parseFloat(price),
//         subCategory: {},
//         tags: [],
//         images: [],
//         sellerType: "COMPANY",
//       },
//     });

//     await prisma.productCategory.update({
//       where: { id: eventTicketCategory.id },
//       data: { productCount: { increment: 1 } },
//     });

//     return formatResponse(true, newTicketProduct, "Ticket type created successfully", 201);
//   }
// );
