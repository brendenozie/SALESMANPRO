// app/api/admin/[adminSlug]/events/route.ts (for GET /api/admin/{adminSlug}/events)
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const statusFilter = searchParams.get("status");
  const searchKeyword = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "startDateTime";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  // Validate sort parameters
  const validSortBy = ["startDateTime", "title", "eventStatus"];
  if (!validSortBy.includes(sortBy)) {
    return NextResponse.json({ message: "Invalid sortBy parameter" }, { status: 400 });
  }

  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
  }

  try {
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
          // You'd need to compute ticketsSold for each event if you want it here
          // For simplicity, we'll omit it or fetch separately if needed for dashboard
        },
      }),
      prisma.event.count({ where: whereClause }),
    ]);

    const formattedEvents = events.map(event => ({
      ...event,
      date: new Date(event.startDateTime).toLocaleDateString(), // For display
      // Mock ticketsSold for now, replace with actual computation if needed
      ticketsSold: Math.floor(Math.random() * 2000)
    }));


    return NextResponse.json({
      events: formattedEvents,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST for creating events will be in the same file
export async function POST(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const body = await request.json();

  const {
    title, summary, description, startDateTime, endDateTime,
    location, onlineMeetingLink, imageUrl, videoUrl, eventType,
    eventStatus, organizerId, isRegistrationRequired, maxCapacity,
    isPaid, price, contactPerson, contactEmail, contactPhone, audience,
    targetAcademicLevelIds, targetCourseIds, targetEducatorIds,
    targetStudentIds, targetDepartmentIds, targetParentIds
  } = body;

  // Basic validation
  if (!title || !startDateTime || !location || !eventType || !eventStatus || !organizerId) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Ensure organizerId exists and belongs to the company (or is an admin)
    const organizer = await prisma.user.findUnique({
      where: { id: organizerId },
      select: { id: true, role: true }
    });

    if (!organizer || (organizer.role !== "ADMIN" && organizer.role !== "EDUCATOR")) { // Adjust roles as per your logic
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
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}