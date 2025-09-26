import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- Type Definitions for the Handler ---

type RouteParams = {
  adminSlug: string;
  eventId: string;
};

type HandlerContext = {
  params: RouteParams;
  user?: any; // Replace 'any' with your actual User type if defined
};

// --- Core Logic for GET request ---
// This function contains only the business logic.
// The wrapper handles authentication and the top-level try/catch block.
async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug, eventId } = context.params;
  const { searchParams } = new URL(request.url);
  const searchKeyword = searchParams.get("search");
  const statusFilter = searchParams.get("status");

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  const whereClause: any = {
    eventId: eventId,
    companyId: company.id,
  };

  if (searchKeyword) {
    whereClause.OR = [
      { user: { name: { contains: searchKeyword, mode: 'insensitive' } } },
      { user: { email: { contains: searchKeyword, mode: 'insensitive' } } },
    ];
  }

  if (statusFilter) {
    whereClause.status = statusFilter;
  }

  const attendees = await prisma.eventRegistration.findMany({
    where: whereClause,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { user: { name: 'asc' } }
  });

  const formattedAttendees = attendees.map(reg => ({
    id: reg.id,
    name: reg.user?.name || 'N/A',
    email: reg.user?.email || 'N/A',
    ticketType: "General Admission",
    checkedIn: reg.status === "ATTENDED",
    status: reg.status,
  }));

  return NextResponse.json(formattedAttendees, { status: 200 });
}

// --- Exported Route Handler (Wrapped) ---

/**
 * GET /api/admin/[adminSlug]/events/[eventId]/check-in-attendees
 * Fetches a list of attendees for a specific event, with search and status filters.
 */
export const GET = withApiHandler(handleGet);
