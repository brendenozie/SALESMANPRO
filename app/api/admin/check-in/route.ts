import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const PUT = withApiHandler(
  async (req, context) => {
    const companyId = context.companyId;
    const body = await req.json().catch(() => null);
    const { registrationId, status } = body || {};

    if (!registrationId) {
      return formatResponse(
        false,
        null,
        "Attendee registration ID is required",
        400,
      );
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const isCheckedIn = status === "ATTENDED" || status === "CHECKED_IN";

    if (attendee.checkInStatus === "CANCELLED") {
      return formatResponse(
        false,
        null,
        "This ticket has been cancelled or refunded and cannot be checked in.",
        400
      );
    }

    const updatedRecord = await prisma.eventTicketAttendee.update({
      where: { id: registrationId },
      data: {
        checkInStatus: isCheckedIn ? "CHECKED_IN" : "PENDING",
        checkedInAt: isCheckedIn ? new Date() : null,
      },
    });

    const message = isCheckedIn
      ? `Successfully checked in ${updatedRecord.fullName}. Welcome!`
      : `Reverted check-in tracking for ${updatedRecord.fullName}.`;

    return NextResponse.json({
      success: true,
      message,
      attendee: {
        id: updatedRecord.id,
        fullName: updatedRecord.fullName,
        checkedIn: isCheckedIn,
        checkInStatus: updatedRecord.checkInStatus,
        checkedInAt: updatedRecord.checkedInAt,
        checkedInBy: updatedRecord.checkedInBy,
      },
    });
  },
  { requireAuth: true, requireTenant: true },
);

export const PATCH = PUT;
