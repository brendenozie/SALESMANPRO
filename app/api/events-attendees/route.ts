import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const eventId = searchParams.get("eventId");
    const search = searchParams.get("search")?.toLowerCase();

    if (!companyId) {
      return NextResponse.json(
        { error: "Company identity token is missing" },
        { status: 400 },
      );
    }

    // Dynamic filtration object
    const whereClause: any = { companyId };

    if (eventId) {
      whereClause.eventId = eventId;
    }

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { ticketCode: { contains: search, mode: "insensitive" } },
        { purchase: { buyerName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const attendees = await prisma.eventTicketAttendee.findMany({
      where: whereClause,
      include: {
        ticket: {
          select: {
            name: true,
            ticketType: true,
            price: true,
            currency: true,
          },
        },
        event: {
          select: {
            title: true,
          },
        },
        purchase: {
          select: {
            paymentStatus: true,
            paymentMethod: true,
            buyerName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: attendees });
  } catch (error: any) {
    console.error("[ATTENDEES_INDEX_CRASH]:", error);
    return NextResponse.json(
      { error: "Failed to pull attendee list contexts." },
      { status: 500 },
    );
  }
}

// Inline Check-In Status Action
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { attendeeId, checkInStatus } = body;

    if (!attendeeId || !checkInStatus) {
      return NextResponse.json(
        { error: "Missing tracking attributes" },
        { status: 400 },
      );
    }

    const updatedAttendee = await prisma.eventTicketAttendee.update({
      where: { id: attendeeId },
      data: {
        checkInStatus,
        checkedInAt: checkInStatus === "CHECKED_IN" ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: updatedAttendee });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Status swap failure" },
      { status: 500 },
    );
  }
}
