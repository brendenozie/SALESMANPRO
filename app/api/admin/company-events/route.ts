import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- Type Definitions for the Handlers ---

type RouteParams = {
  adminSlug: string;
};

type HandlerContext = {
  params: RouteParams;
  user?: any; // Replace 'any' with your actual User type if defined
};

// --- Core Logic for GET request ---

async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug } = context.params;
  const { searchParams } = new URL(request.url);

  const statusFilter = searchParams.get("status");
  const searchKeyword = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "startDateTime";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  // Retain validation for query parameters
  const validSortBy = ["startDateTime", "title", "eventStatus"];
  if (!validSortBy.includes(sortBy)) {
    return NextResponse.json({ message: "Invalid sortBy parameter" }, { status: 400 });
  }

  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  const whereClause: any = {
    companyId: company.id,
  };

  if (statusFilter) {
    whereClause.eventStatus = statusFilter;
  }

  if (searchKeyword) {
    whereClause.OR = [
      { title: { contains: searchKeyword, mode: 'insensitive' } },
      { description: { contains: searchKeyword, mode: 'insensitive' } },
      { location: { contains: searchKeyword, mode: 'insensitive' } },
    ];
  }

  const [events, totalItems] = await prisma.$transaction([
    prisma.event.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        startDateTime: true,
        endDateTime: true,
        location: true,
        eventStatus: true,
      },
    }),
    prisma.event.count({ where: whereClause }),
  ]);

  const formattedEvents = events.map(event => ({
    ...event,
    date: new Date(event.startDateTime).toLocaleDateString(),
    ticketsSold: Math.floor(Math.random() * 2000)
  }));

  return NextResponse.json({
    events: formattedEvents,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  }, { status: 200 });
}

// --- Core Logic for POST request ---

async function handlePost(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug } = context.params;
  const body = await request.json();

  const {
    title, summary, description, startDateTime, endDateTime,
    location, onlineMeetingLink, imageUrl, videoUrl, eventType,
    eventStatus, organizerId, isRegistrationRequired, maxCapacity,
    isPaid, price, contactPerson, contactEmail, contactPhone, audience,
    targetAcademicLevelIds, targetCourseIds, targetEducatorIds,
    targetStudentIds, targetDepartmentIds, targetParentIds
  } = body;

  if (!title || !startDateTime || !location || !eventType || !eventStatus || !organizerId) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  const organizer = await prisma.user.findUnique({
    where: { id: organizerId },
    select: { id: true, role: true }
  });

  if (!organizer || (organizer.role !== "ADMIN" && organizer.role !== "EDUCATOR")) {
    return NextResponse.json({ message: "Invalid organizer ID or insufficient permissions" }, { status: 403 });
  }

  const newEvent = await prisma.event.create({
    data: {
      companyId: company.id,
      title,
      summary,
      description,
      startDateTime: new Date(startDateTime),
      endDateTime: endDateTime ? new Date(endDateTime) : null,
      location,
      onlineMeetingLink,
      imageUrl,
      videoUrl,
      eventType,
      eventStatus,
      organizerId,
      isRegistrationRequired,
      maxCapacity,
      isPaid,
      price,
      contactPerson,
      contactEmail,
      contactPhone,
      audience,
      targetAcademicLevelIds,
      targetCourseIds,
      targetEducatorIds,
      targetStudentIds,
      targetDepartmentIds,
      targetParentIds,
    },
  });

  return NextResponse.json(
    { message: "Event created successfully", event: newEvent },
    { status: 201 }
  );
}

// --- Exported Route Handlers (Wrapped) ---

/**
 * GET /api/admin/[adminSlug]/events
 * Fetches a list of events with filtering, sorting, and pagination.
 */
export const GET = withApiHandler(handleGet);

/**
 * POST /api/admin/[adminSlug]/events
 * Creates a new event.
 */
export const POST = withApiHandler(handlePost);
