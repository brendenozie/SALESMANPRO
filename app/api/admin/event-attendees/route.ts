// =========================================================
// app/api/admin/event-attendees/route.ts
// =========================================================

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function getAttendees(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const eventId = searchParams.get("eventId");
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  const whereClause: any = {};

  if (companyId) {
    whereClause.event = { companyId };
  }

  if (eventId) {
    whereClause.eventId = eventId;
  }

  if (status) {
    whereClause.checkInStatus = status;
  }

  if (search && search.trim()) {
    const term = search.trim();
    whereClause.OR = [
      { fullName: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { ticketCode: { contains: term, mode: "insensitive" } },
    ];
  }

  const attendees = await prisma.eventTicketAttendee.findMany({
    where: whereClause,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDateTime: true,
          location: true,
          companyId: true,
        },
      },
      ticket: {
        select: {
          id: true,
          name: true,
          ticketType: true,
          price: true,
        },
      },
      purchase: {
        select: {
          id: true,
          paymentStatus: true,
          paymentMethod: true,
          totalAmount: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
    take: 500,
  });

  return formatResponse(true, attendees, "Attendees fetched successfully", 200);
}

async function updateAttendeeStatus(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { attendeeId, id, checkInStatus } = body;
  const targetId = attendeeId || id;

  if (!targetId) {
    return formatResponse(false, null, "Attendee ID is required", 400);
  }

  const validStatuses = ["PENDING", "CHECKED_IN", "CANCELLED"];
  if (checkInStatus && !validStatuses.includes(checkInStatus)) {
    return formatResponse(
      false,
      null,
      `Invalid checkInStatus. Allowed: ${validStatuses.join(", ")}`,
      400
    );
  }

  const isCheckedIn = checkInStatus === "CHECKED_IN";

  const updated = await prisma.eventTicketAttendee.update({
    where: { id: targetId },
    data: {
      checkInStatus: checkInStatus || (isCheckedIn ? "CHECKED_IN" : "PENDING"),
      checkedInAt: isCheckedIn ? new Date() : null,
    },
    include: {
      event: true,
      ticket: true,
    },
  });

  return formatResponse(true, updated, "Attendee check-in status updated", 200);
}

export const GET = withApiHandler(getAttendees, { requireAuth: false });
export const PATCH = withApiHandler(updateAttendeeStatus, { requireAuth: false });
export const PUT = withApiHandler(updateAttendeeStatus, { requireAuth: false });
