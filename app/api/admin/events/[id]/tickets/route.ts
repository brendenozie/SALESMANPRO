// =========================================================
// app/api/admin/events/[id]/tickets/route.ts
// =========================================================

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

// =========================================================
// VALID ENUMS
// =========================================================

const VALID_TICKET_TYPES = [
  "REGULAR",
  "VIP",
  "VVIP",
  "EARLY_BIRD",
  "STUDENT",
  "GROUP",
  "BACKSTAGE",
  "ONLINE",
  "FREE",
];

// =========================================================
// TYPES
// =========================================================

interface Params {
  params: Promise<{ id: string }>;
}

// =========================================================
// TRANSFORM RESPONSE
// =========================================================

function transformTicket(ticket: any) {
  const remainingTickets = ticket.quantityTotal - ticket.quantitySold;

  return {
    id: ticket.id,

    eventId: ticket.eventId,

    companyId: ticket.companyId,

    name: ticket.name,
    description: ticket.description,

    ticketType: ticket.ticketType,

    price: ticket.price,
    currency: ticket.currency,

    originalPrice: ticket.originalPrice,
    discountAmount: ticket.discountAmount,

    quantityTotal: ticket.quantityTotal,
    quantitySold: ticket.quantitySold,

    remainingTickets,
    isSoldOut: remainingTickets <= 0,

    minPerOrder: ticket.minPerOrder,
    maxPerOrder: ticket.maxPerOrder,

    salesStartDate: ticket.salesStartDate?.toISOString() || null,

    salesEndDate: ticket.salesEndDate?.toISOString() || null,

    isActive: ticket.isActive,
    isVisible: ticket.isVisible,

    perks: ticket.perks || [],

    requiresApproval: ticket.requiresApproval,

    colorHex: ticket.colorHex,
    imageUrl: ticket.imageUrl,

    event: ticket.event
      ? {
          id: ticket.event.id,
          title: ticket.event.title,
          startDateTime: ticket.event.startDateTime?.toISOString(),
        }
      : null,

    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

// =========================================================
// GET TICKETS
// GET /api/admin/events/[id]/tickets
// =========================================================

async function getTickets(request: Request, { params }: Params) {
  const { id: eventId } = await params;

  const { searchParams } = new URL(request.url);

  let resolvedCompanyId = companyId;
  if (!resolvedCompanyId) {
    const parentEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { companyId: true },
    });
    if (parentEvent?.companyId) {
      resolvedCompanyId = parentEvent.companyId;
    }
  }

  const cacheKey = `admin:event:tickets:${eventId}`;

  try {
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return formatResponse(true, cached, "Fetched (Cached)", 200);
    }
  } catch (e) {}

  const whereClause: any = { eventId };
  if (resolvedCompanyId) {
    whereClause.companyId = resolvedCompanyId;
  }

  const tickets = await prisma.eventTicket.findMany({
    where: whereClause,

    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDateTime: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const response = tickets.map(transformTicket);

  try {
    await cacheSet(cacheKey, response, 60);
  } catch (e) {}

  return formatResponse(true, response, null, 200);
}

// =========================================================
// CREATE TICKET
// POST /api/admin/events/[id]/tickets
// =========================================================

async function createTicket(request: Request, { params }: Params) {
  const { id: eventId } = await params;

  const body = await request.json();

  const {
    companyId,

    name,
    description,

    ticketType,

    price,
    currency,

    originalPrice,
    discountAmount,

    quantityTotal,

    minPerOrder,
    maxPerOrder,

    salesStartDate,
    salesEndDate,

    isActive,
    isVisible,

    perks,

    requiresApproval,

    colorHex,
    imageUrl,
  } = body;

  // =========================================================
  // VALIDATE EVENT
  // =========================================================

  const existingEvent = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
  });

  if (!existingEvent) {
    return formatResponse(false, null, "Event not found", 404);
  }

  const effectiveCompanyId = companyId || existingEvent.companyId;
  if (!effectiveCompanyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  // =========================================================
  // VALIDATION
  // =========================================================

  if (!name) {
    return formatResponse(false, null, "Ticket name is required", 400);
  }

  if (!ticketType) {
    return formatResponse(false, null, "ticketType is required", 400);
  }

  if (!VALID_TICKET_TYPES.includes(ticketType)) {
    return formatResponse(
      false,
      null,
      `Invalid ticket type. Allowed: ${VALID_TICKET_TYPES.join(", ")}`,
      400,
    );
  }

  if (typeof quantityTotal !== "number" || quantityTotal <= 0) {
    return formatResponse(
      false,
      null,
      "quantityTotal must be greater than 0",
      400,
    );
  }

  if (ticketType !== "FREE" && (typeof price !== "number" || price < 0)) {
    return formatResponse(false, null, "Valid ticket price is required", 400);
  }

  // =========================================================
  // DATE VALIDATION
  // =========================================================

  let parsedSalesStartDate: Date | null = null;
  let parsedSalesEndDate: Date | null = null;

  if (salesStartDate) {
    parsedSalesStartDate = new Date(salesStartDate);

    if (isNaN(parsedSalesStartDate.getTime())) {
      return formatResponse(false, null, "Invalid salesStartDate", 400);
    }
  }

  if (salesEndDate) {
    parsedSalesEndDate = new Date(salesEndDate);

    if (isNaN(parsedSalesEndDate.getTime())) {
      return formatResponse(false, null, "Invalid salesEndDate", 400);
    }
  }

  if (
    parsedSalesStartDate &&
    parsedSalesEndDate &&
    parsedSalesEndDate <= parsedSalesStartDate
  ) {
    return formatResponse(
      false,
      null,
      "salesEndDate must be after salesStartDate",
      400,
    );
  }

  // =========================================================
  // CREATE
  // =========================================================

  const newTicket = await prisma.eventTicket.create({
    data: {
      companyId: effectiveCompanyId,

      eventId,

      name,
      description,

      ticketType,

      price: ticketType === "FREE" ? 0 : price,

      currency: currency || "KES",

      originalPrice,
      discountAmount,

      quantityTotal,

      quantitySold: 0,

      minPerOrder: minPerOrder || 1,

      maxPerOrder,

      salesStartDate: parsedSalesStartDate,

      salesEndDate: parsedSalesEndDate,

      isActive: typeof isActive === "boolean" ? isActive : true,

      isVisible: typeof isVisible === "boolean" ? isVisible : true,

      perks: Array.isArray(perks) ? perks : [],

      requiresApproval: requiresApproval === true,

      colorHex,
      imageUrl,
    },

    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDateTime: true,
        },
      },
    },
  });

  try {
    await cacheDel(`admin:event:tickets:${eventId}`);
  } catch (e) {}

  return formatResponse(
    true,
    {
      data: transformTicket(newTicket),
    },
    "Ticket created successfully",
    201,
  );
}

// =========================================================
// EXPORTS
// =========================================================

export const GET = withApiHandler(getTickets);

export const POST = withApiHandler(createTicket);
