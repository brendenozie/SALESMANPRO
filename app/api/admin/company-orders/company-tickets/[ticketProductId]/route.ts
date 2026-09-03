import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// // // app/api/admin/[adminSlug]/tickets/[ticketProductId]/route.ts

// app/api/admin/[adminSlug]/tickets/[ticketProductId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// --------------------
// Helpers
// --------------------

async function getCompanyId(adminSlug: string): Promise<string | null> {

  const cacheKey = `companyId:${adminSlug}`;

  const cachedCompanyId = await cacheGet(cacheKey);

  if (cachedCompanyId) {
    return cachedCompanyId as string;
  }

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (company) {
    await cacheSet(cacheKey, company.id);
  }

  return company?.id ?? null;
}

const toFloat = (value: unknown) =>
  value !== undefined && value !== null ? Number(value) : undefined;

const toInt = (value: unknown) =>
  value !== undefined && value !== null ? parseInt(value as string, 10) : undefined;

// --------------------
// GET
// --------------------

export const GET = withApiHandler(async (_, { params }) => {
  const { adminSlug, ticketProductId } = params;

  const companyId = await getCompanyId(adminSlug);
  if (!companyId) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const cacheKey = `admin:company-tickets:${companyId}:${ticketProductId}`;

  const cached = await cacheGet(cacheKey);

  if (cached) {
    return formatResponse(true, JSON.parse(cached as string));
  }

  const ticket = await prisma.marketplaceListings.findFirst({
    where: {
      id: ticketProductId,
      companyId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      sellingPrice: true,
      quantity: true,
      isAvailable: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!ticket) {
    return formatResponse(false, null, "Ticket type not found", 404);
  }

  // TODO: Replace with real aggregation once event linkage exists
  const sold = Math.floor(ticket.quantity * 0.6);

  await cacheSet(cacheKey, JSON.stringify({
    id: ticket.id,
    eventName: "Associated Event Name (Needs lookup)",
    type: ticket.name,
    description: ticket.description,
    price: ticket.sellingPrice,
    quantity: ticket.quantity,
    sold,
    remaining: ticket.quantity - sold,
    isAvailable: ticket.isAvailable,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  }));

  return formatResponse(true, {
    eventName: "Associated Event Name (Needs lookup)",
    ...ticket,
  });

});

// --------------------
// PUT
// --------------------

export const PUT = withApiHandler(async (request, { params }) => {
  const { adminSlug, ticketProductId } = params;
  const body = await request.json();

  const { type, description, price, quantity, isAvailable } = body;

  const companyId = await getCompanyId(adminSlug);
  if (!companyId) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const updateData = {
    ...(type && { name: type }),
    ...(description !== undefined && { description }),
    ...(price !== undefined && {
      sellingPrice: toFloat(price),
      buyingPrice: toFloat(price),
    }),
    ...(quantity !== undefined && { quantity: toInt(quantity) }),
    ...(isAvailable !== undefined && { isAvailable }),
  };

  if (Object.keys(updateData).length === 0) {
    return formatResponse(false, null, "No valid fields provided for update", 400);
  }

  const updatedTicket = await prisma.marketplaceListings.updateMany({
    where: {
      id: ticketProductId,
      companyId,
    },
    data: updateData,
  });

  if (updatedTicket.count === 0) {
    return formatResponse(false, null, "Ticket type not found", 404);
  }

  
    try {
      await cacheDel(`tenant:${companyId}:company-tickets:*`);
      await cacheDel(`admin:company-tickets:*`);
    } catch (e) {}
    return formatResponse(true, null, "Ticket type updated successfully");
});

// --------------------
// DELETE
// --------------------

export const DELETE = withApiHandler(async (_, { params }) => {
  const { adminSlug, ticketProductId } = params;

  const companyId = await getCompanyId(adminSlug);
  if (!companyId) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const deleted = await prisma.marketplaceListings.deleteMany({
    where: {
      id: ticketProductId,
      companyId,
    },
  });

  if (deleted.count === 0) {
    return formatResponse(false, null, "Ticket type not found", 404);
  }

    try {
      await cacheDel(`tenant:${companyId}:company-tickets:*`);
      await cacheDel(`admin:company-tickets:*`);
    } catch (e) {}

  return new NextResponse(null, { status: 204 });
});

// import { NextResponse } from "next/server";
//  => {
//   const { adminSlug, ticketProductId } = params;

//   const ticketProduct = await prisma.marketplaceListings.findFirst({
//     where: { 
//       id: ticketProductId, 
//       company: { slug: adminSlug } 
//     },
//     select: {
//       id: true,
//       name: true,
//       description: true,
//       sellingPrice: true,
//       quantity: true,
//       isAvailable: true,
//       createdAt: true,
//       updatedAt: true,
//       event: { select: { title: true } }, // Resolves TODO: actual event lookup
//       _count: {
//         select: { eventRegistrations: true } // Actual sold count
//       }
//     },
//   });

//   if (!ticketProduct) {
//     return formatResponse(false, null, "Ticket type not found", 404);
//   }

//   const sold = ticketProduct._count.eventRegistrations;

//   return formatResponse(true, {
//     id: ticketProduct.id,
//     eventName: ticketProduct.event?.title || "N/A",
//     type: ticketProduct.name,
//     description: ticketProduct.description,
//     price: ticketProduct.sellingPrice,
//     totalInventory: ticketProduct.quantity,
//     sold: sold,
//     remaining: Math.max(0, ticketProduct.quantity - sold),
//     isAvailable: ticketProduct.isAvailable,
//     createdAt: ticketProduct.createdAt,
//     updatedAt: ticketProduct.updatedAt,
//   });
// });

// 
// export const PUT = withApiHandler(async (request, { params }) => {
//   const { adminSlug, ticketProductId } = params;
//   const body = await request.json();
//   const { type, description, price, quantity, isAvailable } = body;

//   try {
//     const updated = await prisma.marketplaceListings.update({
//       where: { 
//         id: ticketProductId, 
//         company: { slug: adminSlug } 
//       },
//       data: {
//         name: type,
//         description,
//         sellingPrice: price !== undefined ? parseFloat(price) : undefined,
//         quantity: quantity !== undefined ? parseInt(quantity) : undefined,
//         isAvailable: isAvailable ?? undefined,
//       },
//     });

//     return formatResponse(true, updated, "Ticket type updated successfully");
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Ticket type not found or unauthorized", 404);
//     }
//     throw error;
//   }
// });

// 
// export const DELETE = withApiHandler(async (request, { params }) => {
//   const { adminSlug, ticketProductId } = params;

//   try {
//     await prisma.marketplaceListings.delete({
//       where: { 
//         id: ticketProductId, 
//         company: { slug: adminSlug } 
//       },
//     });

//     return new NextResponse(null, { status: 204 });
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Ticket type not found", 404);
//     }
//     throw error;
//   }
// });
// import { NextResponse } from "next/server";
//  => {
//     const { adminSlug, ticketProductId } = params;

//     const company = await prisma.company.findUnique({
//       where: { slug: adminSlug },
//       select: { id: true },
//     });

//     if (!company) {
//       return formatResponse(false, null, "Company not found", 404);
//     }

//     const ticketProduct = await prisma.marketplaceListings.findUnique({
//       where: { id: ticketProductId, companyId: company.id },
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         sellingPrice: true,
//         quantity: true,
//         isAvailable: true,
//         productCategory: { select: { name: true } },
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     if (!ticketProduct) {
//       return formatResponse(false, null, "Ticket type not found", 404);
//     }

//     const eventName = "Associated Event Name (Needs lookup)"; // TODO: fetch actual event

//     return formatResponse(true, {
//       id: ticketProduct.id,
//       eventName,
//       type: ticketProduct.name,
//       description: ticketProduct.description,
//       price: ticketProduct.sellingPrice,
//       quantity: ticketProduct.quantity,
//       sold: Math.floor(ticketProduct.quantity * 0.6), // mock
//       remaining: ticketProduct.quantity - Math.floor(ticketProduct.quantity * 0.6), // mock
//       isAvailable: ticketProduct.isAvailable,
//       createdAt: ticketProduct.createdAt,
//       updatedAt: ticketProduct.updatedAt,
//     });
//   }
// );

// // PUT /api/admin/[adminSlug]/tickets/[ticketProductId]
// export const PUT = withApiHandler(
//   async (request, { params }) => {
//     const { adminSlug, ticketProductId } = params;
//     const body = await request.json();

//     const { type, description, price, quantity, isAvailable } = body;

//     const company = await prisma.company.findUnique({
//       where: { slug: adminSlug },
//       select: { id: true },
//     });

//     if (!company) {
//       return formatResponse(false, null, "Company not found", 404);
//     }

//     const updatedTicketProduct = await prisma.marketplaceListings.update({
//       where: { id: ticketProductId, companyId: company.id },
//       data: {
//         name: type,
//         description,
//         sellingPrice: price ? parseFloat(price) : undefined,
//         buyingPrice: price ? parseFloat(price) : undefined,
//         quantity: quantity ? parseInt(quantity) : undefined,
//         isAvailable: isAvailable ?? undefined,
//       },
//     });

//     return formatResponse(true, updatedTicketProduct, "Ticket type updated successfully");
//   }
// );

// // DELETE /api/admin/[adminSlug]/tickets/[ticketProductId]
// export const DELETE = withApiHandler(
//   async (request, { params }) => {
//     const { adminSlug, ticketProductId } = params;

//     const company = await prisma.company.findUnique({
//       where: { slug: adminSlug },
//       select: { id: true },
//     });

//     if (!company) {
//       return formatResponse(false, null, "Company not found", 404);
//     }

//     await prisma.marketplaceListings.delete({
//       where: { id: ticketProductId, companyId: company.id },
//     });

//     return new NextResponse(null, { status: 204 });
//   }
// );
