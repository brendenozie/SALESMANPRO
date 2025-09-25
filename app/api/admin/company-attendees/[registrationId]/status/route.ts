// app/api/admin/[adminSlug]/attendees/[registrationId]/status/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string; registrationId: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, registrationId } = params;
  const body = await request.json();
  const { status, notes } = body;

  if (!status) {
    return NextResponse.json({ message: "Status is required" }, { status: 400 });
  }

  // Validate status against your enum
  const validStatuses = ["REGISTERED", "ATTENDED", "CANCELLED", "WAITLISTED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ message: "Invalid status provided" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const updatedRegistration = await prisma.eventRegistration.update({
      where: { id: registrationId, companyId: company.id },
      data: {
        status: status,
        // You might have a 'notes' field on EventRegistration or an associated log model
        // notes: notes,
      },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true } }
      }
    });

    return NextResponse.json(
      {
        message: "Attendee status updated",
        attendee: {
          id: updatedRegistration.id,
          name: updatedRegistration.user?.name || 'N/A',
          status: updatedRegistration.status,
          eventTitle: updatedRegistration.event?.title || 'N/A',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating attendee status:", error);
    if (error instanceof Error && error.message.includes("RecordNotFound")) {
      return NextResponse.json({ message: "Attendee registration not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}