import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const PUT = withApiHandler(
  async (req, context) => {
    const companyId = context.companyId;
    const registrationId = context.params?.registrationId;

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

    const body = await req.json().catch(() => null);
    const { status } = body || {}; // Expected: "REGISTERED" or "ATTENDED"

    if (!status || !["REGISTERED", "ATTENDED"].includes(status)) {
      return formatResponse(
        false,
        null,
        "Invalid clearance verification state provided. Must be REGISTERED or ATTENDED.",
        400,
      );
    }

    // Tenant Isolation: Verify attendee exists and belongs to the company's event
    const attendee = await prisma.eventTicketAttendee.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          select: { companyId: true },
        },
      },
    });

    if (!attendee || attendee.event?.companyId !== companyId) {
      return formatResponse(
        false,
        null,
        "Attendee registration not found in this company",
        404,
      );
    }

    const isCheckedIn = status === "ATTENDED";

    // Update attendee check-in state
    const updatedRecord = await prisma.eventTicketAttendee.update({
      where: { id: registrationId },
      data: {
        checkInStatus: isCheckedIn ? "ATTENDED" : "PENDING",
        checkedInAt: isCheckedIn ? new Date() : null,
      },
    });

    const message = isCheckedIn
      ? `Successfully checked in ${updatedRecord.fullName}. Welcome!`
      : `Reverted access tracking for ${updatedRecord.fullName}.`;

    return NextResponse.json({
      success: true,
      message,
      attendee: {
        id: updatedRecord.id,
        fullName: updatedRecord.fullName,
        checkedIn: isCheckedIn,
        checkInStatus: updatedRecord.checkInStatus,
      },
    });
  },
  { requireAuth: true, requireTenant: true },
);
