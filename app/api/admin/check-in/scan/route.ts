// =========================================================
// app/api/admin/check-in/scan/route.ts
// Fast QR Code & Ticket Code Validation Endpoint
// =========================================================

import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const POST = withApiHandler(
  async (req, context) => {
    const body = await req.json().catch(() => ({}));
    let { code, ticketCode, eventId, companyId, autoCheckIn = true } = body;

    // Support either code or ticketCode
    const rawCode = (code || ticketCode || "").trim();

    if (!rawCode) {
      return formatResponse(false, null, "Ticket code or QR token is required", 400);
    }

    // Parse potential JSON QR payload (e.g. { ticketCode: "...", eventId: "..." })
    let parsedTicketCode = rawCode;
    try {
      if (rawCode.startsWith("{") && rawCode.endsWith("}")) {
        const parsed = JSON.parse(rawCode);
        if (parsed.ticketCode) {
          parsedTicketCode = parsed.ticketCode;
        }
        if (parsed.eventId && !eventId) {
          eventId = parsed.eventId;
        }
      }
    } catch (e) {}

    // Look up attendee by ticketCode or attendee id
    const attendee = await prisma.eventTicketAttendee.findFirst({
      where: {
        OR: [
          { ticketCode: parsedTicketCode },
          { id: parsedTicketCode },
        ],
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            companyId: true,
            startDateTime: true,
            location: true,
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
            buyerName: true,
            buyerEmail: true,
            totalAmount: true,
          },
        },
      },
    });

    if (!attendee) {
      return formatResponse(
        false,
        { code: parsedTicketCode, status: "INVALID" },
        "Invalid Ticket: No matching ticket record found",
        404
      );
    }

    // Validate Event match if eventId is specified
    if (eventId && attendee.eventId !== eventId) {
      return formatResponse(
        false,
        {
          code: parsedTicketCode,
          status: "WRONG_EVENT",
          expectedEvent: attendee.event?.title,
        },
        `Invalid Ticket: This ticket is for "${attendee.event?.title}", not this event.`,
        400
      );
    }

    // Validate Tenant match if companyId is provided
    const targetCompanyId = companyId || context.companyId;
    if (targetCompanyId && attendee.event?.companyId !== targetCompanyId) {
      return formatResponse(
        false,
        { code: parsedTicketCode, status: "TENANT_MISMATCH" },
        "Unauthorized: Ticket belongs to a different company organization.",
        403
      );
    }

    // Check cancellation
    if ((attendee.checkInStatus as string) === "CANCELLED" || attendee.purchase?.paymentStatus === "CANCELLED" || attendee.purchase?.paymentStatus === "REFUNDED") {
      return formatResponse(
        false,
        {
          code: parsedTicketCode,
          status: "CANCELLED",
          attendee: {
            id: attendee.id,
            name: attendee.fullName,
            email: attendee.email,
            ticketType: attendee.ticket?.name,
          },
        },
        "This ticket has been cancelled or refunded and is not valid for entry.",
        400
      );
    }

    // Check if already checked in
    if ((attendee.checkInStatus as string) === "CHECKED_IN") {
      return formatResponse(
        false,
        {
          code: parsedTicketCode,
          status: "ALREADY_CHECKED_IN",
          checkedInAt: attendee.checkedInAt?.toISOString() || null,
          checkedInBy: (attendee as any).checkedInBy || "Staff",
          attendee: {
            id: attendee.id,
            name: attendee.fullName,
            email: attendee.email,
            ticketType: attendee.ticket?.name,
            eventTitle: attendee.event?.title,
          },
        },
        `ALREADY CHECKED IN at ${attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleTimeString() : "earlier"} by ${(attendee as any).checkedInBy || "Staff"}`,
        409
      );
    }

    // Valid ticket! If autoCheckIn is true, perform atomic check-in
    let finalStatus: string = attendee.checkInStatus;
    let checkedInAt = attendee.checkedInAt;
    const operator = body.operatorName || context.user?.name || context.user?.email || "Check-in Scanner";

    if (autoCheckIn) {
      const updated = await prisma.eventTicketAttendee.update({
        where: { id: attendee.id },
        data: {
          checkInStatus: "CHECKED_IN",
          checkedInAt: new Date(),
          checkedInBy: operator,
        } as any,
      });
      finalStatus = updated.checkInStatus;
      checkedInAt = updated.checkedInAt;
    }

    return formatResponse(
      true,
      {
        valid: true,
        checkedIn: autoCheckIn,
        checkInStatus: finalStatus,
        checkedInAt: checkedInAt?.toISOString(),
        checkedInBy: operator,
        attendee: {
          id: attendee.id,
          name: attendee.fullName,
          email: attendee.email,
          phone: attendee.phone,
          ticketCode: attendee.ticketCode,
          ticketType: attendee.ticket?.name || "General Admission",
          eventTitle: attendee.event?.title,
          paymentStatus: attendee.purchase?.paymentStatus,
        },
      },
      autoCheckIn
        ? `SUCCESS: Checked in ${attendee.fullName} (${attendee.ticket?.name || "General Admission"})`
        : `VALID TICKET for ${attendee.fullName}`,
      200
    );
  },
  { requireAuth: false }
);
