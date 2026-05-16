import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

interface RouteParams {
  params: Promise<{ slug: string; eventId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { eventId } = await params;

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
      ticketType: reg.ticket?.name || "General Admission",
      // checkedIn: reg.checkInStatus === "ATTENDED", // Truthy check matching 'ATTENDED' status
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
