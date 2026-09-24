// =========================================================
// app/api/admin/attendees/route.ts
// =========================================================

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

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

export const PATCH = withApiHandler(updateAttendeeStatus, { requireAuth: false });
export const PUT = withApiHandler(updateAttendeeStatus, { requireAuth: false });
