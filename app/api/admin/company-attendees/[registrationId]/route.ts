// app/api/admin/[adminSlug]/attendees/[registrationId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string; registrationId: string } }
) {
  const { adminSlug, registrationId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId, companyId: company.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { title: true } },
      },
    });

    if (!registration) {
      return NextResponse.json({ message: "Attendee registration not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: registration.id,
      eventId: registration.eventId,
      userId: registration.userId,
      name: registration.user?.name || 'N/A',
      email: registration.user?.email || 'N/A',
      eventTitle: registration.event?.title || 'N/A',
      ticketType: "General Admission", // Mocking, needs actual lookup
      registeredAt: registration.registeredAt,
      status: registration.status,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendee registration:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}