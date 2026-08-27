// =========================================================
// app/api/admin/tickets/[id]/route.ts
// =========================================================

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheDel } from "@/lib/cache";

interface Params {
  params: Promise<{ id: string }>;
}

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
// GET SINGLE TICKET
// =========================================================

async function getTicket(request: Request, { params }: Params) {
  const { id } = await params;

  const ticket = await prisma.eventTicket.findUnique({
    where: { id },

    include: {
      event: true,
    },
  });

  if (!ticket) {
    return formatResponse(false, null, "Ticket not found", 404);
  }

  return formatResponse(
    true,
    {
      data: ticket,
    },
    null,
    200,
  );
}

// =========================================================
// UPDATE TICKET
// =========================================================

async function updateTicket(request: Request, { params }: Params) {
  const { id } = await params;

  const body = await request.json();

  const existingTicket = await prisma.eventTicket.findUnique({
    where: { id },
  });

  if (!existingTicket) {
    return formatResponse(false, null, "Ticket not found", 404);
  }

  const updateData: any = {};

  // =========================================================
  // BASIC FIELDS
  // =========================================================

  if (body.name !== undefined) updateData.name = body.name;

  if (body.description !== undefined) updateData.description = body.description;

  if (body.ticketType !== undefined) {
    if (!VALID_TICKET_TYPES.includes(body.ticketType)) {
      return formatResponse(false, null, "Invalid ticket type", 400);
    }

    updateData.ticketType = body.ticketType;
  }

  if (body.price !== undefined) {
    if (typeof body.price !== "number" || body.price < 0) {
      return formatResponse(false, null, "Invalid price", 400);
    }

    updateData.price = body.price;
  }

  if (body.quantityTotal !== undefined) {
    if (
      typeof body.quantityTotal !== "number" ||
      body.quantityTotal < existingTicket.quantitySold
    ) {
      return formatResponse(
        false,
        null,
        "quantityTotal cannot be less than quantitySold",
        400,
      );
    }

    updateData.quantityTotal = body.quantityTotal;
  }

  if (body.currency !== undefined) updateData.currency = body.currency;

  if (body.originalPrice !== undefined)
    updateData.originalPrice = body.originalPrice;

  if (body.discountAmount !== undefined)
    updateData.discountAmount = body.discountAmount;

  if (body.minPerOrder !== undefined) updateData.minPerOrder = body.minPerOrder;

  if (body.maxPerOrder !== undefined) updateData.maxPerOrder = body.maxPerOrder;

  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  if (body.isVisible !== undefined) updateData.isVisible = body.isVisible;

  if (body.perks !== undefined)
    updateData.perks = Array.isArray(body.perks) ? body.perks : [];

  if (body.requiresApproval !== undefined)
    updateData.requiresApproval = body.requiresApproval;

  if (body.colorHex !== undefined) updateData.colorHex = body.colorHex;

  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

  // =========================================================
  // DATE FIELDS
  // =========================================================

  if (body.salesStartDate !== undefined) {
    updateData.salesStartDate = body.salesStartDate
      ? new Date(body.salesStartDate)
      : null;
  }

  if (body.salesEndDate !== undefined) {
    updateData.salesEndDate = body.salesEndDate
      ? new Date(body.salesEndDate)
      : null;
  }

  // =========================================================
  // UPDATE
  // =========================================================

  const updatedTicket = await prisma.eventTicket.update({
    where: { id },

    data: updateData,

    include: {
      event: true,
    },
  });

  try {
    await cacheDel(`admin:event:tickets:${updatedTicket.eventId}`);
  } catch (e) {}

  return formatResponse(
    true,
    {
      data: updatedTicket,
    },
    "Ticket updated successfully",
    200,
  );
}

// =========================================================
// DELETE TICKET
// =========================================================

async function deleteTicket(request: Request, { params }: Params) {
  const { id } = await params;

  const existingTicket = await prisma.eventTicket.findUnique({
    where: { id },
  });

  if (!existingTicket) {
    return formatResponse(false, null, "Ticket not found", 404);
  }

  // Prevent delete if purchases exist
  const purchases = await prisma.eventTicketPurchase.count({
    where: {
      ticketId: id,
    },
  });

  if (purchases > 0) {
    return formatResponse(
      false,
      null,
      "Cannot delete ticket with purchases",
      400,
    );
  }

  await prisma.eventTicket.delete({
    where: { id },
  });

  try {
    await cacheDel(`admin:event:tickets:${existingTicket.eventId}`);
  } catch (e) {}

  return formatResponse(
    true,
    {
      deletedId: id,
    },
    "Ticket deleted successfully",
    200,
  );
}

// =========================================================
// EXPORTS
// =========================================================

export const GET = withApiHandler(getTicket);

export const PATCH = withApiHandler(updateTicket);

export const DELETE = withApiHandler(deleteTicket);
