import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

interface RouteParams {
  params: Promise<{ id?: string; eventId?: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams.id || resolvedParams.eventId;

    if (!eventId) {
      return NextResponse.json({ message: "Event ID is required" }, { status: 400 });
    }

    // Parse runtime query strings
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";

    // Build standard conditional filtering tree
    const whereClause: any = {
      eventId: eventId,
    };

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { ticketCode: { contains: search, mode: "insensitive" } },
      ];
    }

    // Query ticket holders/registrations
    const registrations = await prisma.eventTicketAttendee.findMany({
      where: whereClause,
      include: {
        ticket: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { fullName: "asc" },
    });

    // Map database shape to match the client interface rules explicitly
    const formattedAttendees = registrations.map((reg) => ({
      id: reg.id, // registrationId mapping
      name: reg.fullName,
      email: reg.email,
      ticketCode: reg.ticketCode,
      ticketType: reg.ticket?.name || "General Admission",
      checkedIn: reg.checkInStatus === "CHECKED_IN",
      checkedInAt: reg.checkedInAt?.toISOString() || null,
      checkedInBy: reg.checkedInBy || null,
    }));

    return NextResponse.json(formattedAttendees, { status: 200 });
  } catch (error: any) {
    console.error("[ATTENDEES_FETCH_ERR]:", error);
    return NextResponse.json(
      {
        message:
          "Internal infrastructure processing failure compiling registrations.",
      },
      { status: 500 },
    );
  }
}
