import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- Type Definitions for the Handlers ---

type RouteParams = {
  adminSlug: string;
  eventId: string;
};

type HandlerContext = {
  params: RouteParams;
  user?: any; // Replace with your actual User type if defined
};

// --- Core Logic for GET request ---

async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug, eventId } = context.params;

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId, companyId: company.id },
  });

  if (!event) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event, { status: 200 });
}

// --- Core Logic for PUT request ---

async function handlePut(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug, eventId } = context.params;
  const body = await request.json();

  const {
    title, summary, description, startDateTime, endDateTime,
    location, onlineMeetingLink, imageUrl, videoUrl, eventType,
    eventStatus, isRegistrationRequired, maxCapacity,
    isPaid, price, contactPerson, contactEmail, contactPhone, audience,
    targetAcademicLevelIds, targetCourseIds, targetEducatorIds,
    targetStudentIds, targetDepartmentIds, targetParentIds
  } = body;

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  try {
    const updatedEvent = await prisma.event.update({
      where: { id: eventId, companyId: company.id },
      data: {
        title,
        summary,
        description,
        startDateTime: startDateTime ? new Date(startDateTime) : undefined,
        endDateTime: endDateTime ? new Date(endDateTime) : undefined,
        location,
        onlineMeetingLink,
        imageUrl,
        videoUrl,
        eventType,
        eventStatus,
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
      { message: "Event updated successfully", event: updatedEvent },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("RecordNotFound")) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    throw error;
  }
}

// --- Core Logic for DELETE request ---

async function handleDelete(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug, eventId } = context.params;

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  try {
    await prisma.event.delete({
      where: { id: eventId, companyId: company.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("RecordNotFound")) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    throw error;
  }
}

// --- Exported Route Handlers (Wrapped) ---

/**
 * GET /api/admin/[adminSlug]/events/[eventId]
 * Fetches a single event's details.
 */
export const GET = withApiHandler(handleGet);

/**
 * PUT /api/admin/[adminSlug]/events/[eventId]
 * Updates an existing event.
 */
export const PUT = withApiHandler(handlePut);

/**
 * DELETE /api/admin/[adminSlug]/events/[eventId]
 * Deletes an event.
 */
export const DELETE = withApiHandler(handleDelete);
