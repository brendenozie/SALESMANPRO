// app/api/admin/[adminSlug]/tickets/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/[adminSlug]/tickets
export const GET = withApiHandler(
  async (request, { params }) => {
    const { adminSlug } = params;
    const { searchParams } = new URL(request.url);

    const eventIdFilter = searchParams.get("eventId");
    const searchKeyword = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const validSortBy = ["name", "sellingPrice", "quantity"];
    if (!validSortBy.includes(sortBy)) {
      return formatResponse(false, null, "Invalid sortBy parameter", 400);
    }

    const validSortOrder = ["asc", "desc"];
    if (!validSortOrder.includes(sortOrder)) {
      return formatResponse(false, null, "Invalid sortOrder parameter", 400);
    }

    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return formatResponse(false, null, "Company not found", 404);
    }

    const whereClause: any = {
      companyId: company.id,
      productCategory: { name: "Event Tickets" }, // adjust if using IDs
    };

    if (eventIdFilter) {
      // TODO: Add filtering logic if marketplaceListings links to events
      // e.g., whereClause.eventId = eventIdFilter;
    }

    if (searchKeyword) {
      whereClause.OR = [
        { name: { contains: searchKeyword, mode: "insensitive" } },
        { description: { contains: searchKeyword, mode: "insensitive" } },
      ];
    }

    const [tickets, totalItems] = await prisma.$transaction([
      prisma.marketplaceListings.findMany({
        where: whereClause,
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
      prisma.marketplaceListings.count({ where: whereClause }),
    ]);

    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      eventName: "Associated Event Name (Needs lookup)", // TODO: link tickets to events
      type: ticket.name,
      price: ticket.sellingPrice,
      quantity: ticket.quantity,
      sold: Math.floor(ticket.quantity * 0.6), // mocked
      remaining: ticket.quantity - Math.floor(ticket.quantity * 0.6),
    }));

    return formatResponse(true, {
      tickets: formattedTickets,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  }
);

// POST /api/admin/[adminSlug]/tickets
export const POST = withApiHandler(
  async (request, { params }) => {
    const { adminSlug } = params;
    const body = await request.json();

    const { eventId, type, description, price, quantity, isAvailable } = body;

    if (!eventId || !type || !price || !quantity) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return formatResponse(false, null, "Company not found", 404);
    }

    // Ensure Event Tickets category exists
    let eventTicketCategory = await prisma.productCategory.findFirst({
      where: { name: "Event Tickets", companyId: company.id },
    });

    if (!eventTicketCategory) {
      eventTicketCategory = await prisma.productCategory.create({
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
          companyId: company.id,
        },
      });
    }

    const newTicketProduct = await prisma.marketplaceListings.create({
      data: {
        companyId: company.id,
        name: type,
        description: description || `Ticket for ${type}`,
        sellingPrice: parseFloat(price),
        buyingPrice: parseFloat(price),
        quantity: parseInt(quantity),
        isAvailable: isAvailable ?? true,
        productCategoryId: eventTicketCategory.id,
        category: eventTicketCategory.name,
        finalPrice: parseFloat(price),
        subCategory: {},
        tags: [],
        images: [],
        sellerType: "COMPANY",
      },
    });

    await prisma.productCategory.update({
      where: { id: eventTicketCategory.id },
      data: { productCount: { increment: 1 } },
    });

    return formatResponse(true, newTicketProduct, "Ticket type created successfully", 201);
  }
);
