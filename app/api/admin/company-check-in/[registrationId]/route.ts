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
  const { status } = body;

  // Business logic validation remains inside the handler
  if (!status) {
    return NextResponse.json({ message: "Status is required" }, { status: 400 });
  }

  const validToggleStatuses = ["ATTENDED", "REGISTERED"];
  if (!validToggleStatuses.includes(status)) {
    return NextResponse.json({ message: "Invalid status provided for check-in toggle" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  try {
    const updatedRegistration = await prisma.eventRegistration.update({
      where: { id: registrationId, companyId: company.id },
      data: {
        status: status,
      },
      include: {
        user: { select: { name: true, email: true } },
      }
    });

    return NextResponse.json(
      {
        message: `Attendee ${updatedRegistration.user?.name || 'N/A'} has been ${status === "ATTENDED" ? 'checked IN' : 'checked OUT'}.`,
        attendee: {
          id: updatedRegistration.id,
          name: updatedRegistration.user?.name || 'N/A',
          status: updatedRegistration.status,
          checkedIn: updatedRegistration.status === "ATTENDED",
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
 * PUT /api/admin/[adminSlug]/check-in/[registrationId]
 * Toggles the check-in status of an event attendee.
 */
export const PUT = withApiHandler(handlePut);
