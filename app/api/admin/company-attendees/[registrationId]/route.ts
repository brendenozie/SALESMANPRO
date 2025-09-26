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

// --- Core Logic for GET request ---
// This function contains only the business logic.
// The wrapper handles authentication and the try/catch block.
async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug, registrationId } = context.params;

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

  // If a ticketType field exists on your model, you would fetch it here.
  // This line remains as a placeholder for that future logic.
  const ticketType = "General Admission"; 

  return NextResponse.json({
    id: registration.id,
    eventId: registration.eventId,
    userId: registration.userId,
    name: registration.user?.name || 'N/A',
    email: registration.user?.email || 'N/A',
    eventTitle: registration.event?.title || 'N/A',
    ticketType,
    registeredAt: registration.registeredAt,
    status: registration.status,
  }, { status: 200 });
}

// --- Exported Route Handler (Wrapped) ---

/**
 * GET /api/admin/[adminSlug]/attendees/[registrationId]
 * Fetches a single attendee's registration details.
 */
export const GET = withApiHandler(handleGet);
