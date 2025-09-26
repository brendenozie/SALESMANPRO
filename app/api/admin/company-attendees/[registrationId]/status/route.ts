import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- Type Definitions for the Handler ---

type RouteParams = {
  adminSlug: string;
  registrationId: string;
};

type HandlerContext = {
  params: RouteParams;
  user?: any; // Replace 'any' with your actual User type if defined
};

// --- Core Logic for PUT request ---
// This function contains only the business logic, with no
// manual auth check or top-level try/catch block.
async function handlePut(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug, registrationId } = context.params;
  const body = await request.json();
  const { status, notes } = body;

  // Business logic validation remains inside the handler
  if (!status) {
    return NextResponse.json({ message: "Status is required" }, { status: 400 });
  }

  // Validate status against your enum
  const validStatuses = ["REGISTERED", "ATTENDED", "CANCELLED", "WAITLISTED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ message: "Invalid status provided" }, { status: 400 });
  }

  // The wrapper's try/catch will handle the update logic's errors
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  // We wrap the Prisma update in its own try/catch to handle the specific
  // case of RecordNotFound and return a custom message.
  try {
    const updatedRegistration = await prisma.eventRegistration.update({
      where: { id: registrationId, companyId: company.id },
      data: {
        status: status,
        // notes: notes, // Uncomment if you have a notes field
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
    // Check for the specific Prisma "RecordNotFound" error
    if (error instanceof Error && error.message.includes("RecordNotFound")) {
      return NextResponse.json({ message: "Attendee registration not found" }, { status: 404 });
    }
    // For any other error, re-throw it so the withApiHandler wrapper can handle it generically
    throw error;
  }
}

// --- Exported Route Handler (Wrapped) ---

/**
 * PUT /api/admin/[adminSlug]/attendees/[registrationId]/status
 * Updates the registration status of a single attendee.
 */
export const PUT = withApiHandler(handlePut);
