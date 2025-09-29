import { NextRequest } from "next/server"; // Use NextRequest for better handler typing
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// Define valid Enum values (must match your Prisma enums)
const VALID_REGISTRATION_STATUSES = ["REGISTERED", "ATTENDED", "CANCELLED", "WAITLISTED"];

// =======================================================================
// GET /api/event-registrations
// Fetches event registrations based on filters.
// =======================================================================
async function getRegistrations(request: Request) {
  // Authentication check
  


  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const userId = searchParams.get('userId');
  const studentId = searchParams.get('studentId');
  const status = searchParams.get('status');

  const whereClause: any = {};

  // Require at least one specific filter for security and performance
  if (!eventId && !userId) {
    return formatResponse(false, null, "Either Event ID or User ID is required to fetch event registrations.", 400);
  }

  if (eventId) {
    whereClause.eventId = eventId;
  }
  if (userId) {
    whereClause.userId = userId;
  }
  if (studentId) {
    whereClause.studentId = studentId;
  }
  if (status) {
    const upperStatus = status.toUpperCase();
    if (!VALID_REGISTRATION_STATUSES.includes(upperStatus)) {
      return formatResponse(false, null, `Invalid registration status: ${status}. Must be one of ${VALID_REGISTRATION_STATUSES.join(', ')}.`, 400);
    }
    whereClause.status = upperStatus;
  }

  const registrations = await prisma.eventRegistration.findMany({
    where: whereClause,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDateTime: true,
          endDateTime: true,
          location: true,
          companyId: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      student: {
        select: {
          id: true,
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
    orderBy: {
      registeredAt: 'desc',
    },
  });

  // Transform the data to flatten relations
  const response = registrations.map((registration) => ({
    id: registration.id,
    eventId: registration.eventId,
    eventTitle: registration.event?.title || 'N/A',
    eventStartDateTime: registration.event?.startDateTime.toISOString() || null,
    eventEndDateTime: registration.event?.endDateTime?.toISOString() || null,
    eventLocation: registration.event?.location || null,
    eventCompanyId: registration.event?.companyId || 'N/A',
    userId: registration.userId,
    userName: registration.user?.name || 'N/A',
    userEmail: registration.user?.email || 'N/A',
    studentId: registration.studentId,
    studentName: registration.student?.user?.name || null,
    studentEmail: registration.student?.user?.email || null,
    registeredAt: registration.registeredAt.toISOString(),
    status: registration.status,
  }));

  return formatResponse(true, { data: response }, null, 200);
}

// =======================================================================
// POST /api/event-registrations
// Creates a new Event Registration.
// =======================================================================
async function createRegistration(request: Request) {
  // Authentication check
  


  const body = await request.json();
  const {
    eventId,
    userId,
    studentId,
    status = "REGISTERED",
  } = body;

  // Basic validation
  if (!eventId || !userId) {
    return formatResponse(false, null, "Event ID and User ID are required for registration.", 400);
  }

  // Validate Event exists
  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!existingEvent) {
    return formatResponse(false, null, "Event not found.", 404);
  }

  // Validate User exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    return formatResponse(false, null, "Registering user not found.", 400);
  }

  // Validate Student exists if provided
  if (studentId) {
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!existingStudent) {
      return formatResponse(false, null, "Target student not found.", 400);
    }
  }

  // Check for duplicate registration (unique constraint eventId + userId)
  const existingRegistration = await prisma.eventRegistration.findUnique({
    where: {
      eventId_userId: {
        eventId: eventId,
        userId: userId,
      },
    },
  });
  if (existingRegistration) {
    return formatResponse(false, null, "User is already registered for this event.", 409);
  }

  // Validate status enum
  if (!VALID_REGISTRATION_STATUSES.includes(status)) {
    return formatResponse(false, null, `Invalid status: ${status}. Must be one of ${VALID_REGISTRATION_STATUSES.join(', ')}.`, 400);
  }

  const newRegistration = await prisma.eventRegistration.create({
    data: {
      eventId,
      userId,
      studentId,
      status,
    },
    include: {
      event: { select: { id: true, title: true, startDateTime: true, endDateTime: true, location: true, companyId: true } },
      user: { select: { id: true, name: true, email: true } },
      student: { select: { id: true, user: { select: { name: true, email: true } } } },
    },
  });

  // Transform response
  const responseData = {
    id: newRegistration.id,
    eventId: newRegistration.eventId,
    eventTitle: newRegistration.event?.title || 'N/A',
    eventStartDateTime: newRegistration.event?.startDateTime.toISOString() || null,
    eventEndDateTime: newRegistration.event?.endDateTime?.toISOString() || null,
    eventLocation: newRegistration.event?.location || null,
    eventCompanyId: newRegistration.event?.companyId || 'N/A',
    userId: newRegistration.userId,
    userName: newRegistration.user?.name || 'N/A',
    userEmail: newRegistration.user?.email || 'N/A',
    studentId: newRegistration.studentId,
    studentName: newRegistration.student?.user?.name || null,
    studentEmail: newRegistration.student?.user?.email || null,
    registeredAt: newRegistration.registeredAt.toISOString(),
    status: newRegistration.status,
  };

  return formatResponse(true, { data: responseData }, null, 201);
}

// Export the handlers wrapped in the `withApiHandler` utility.
export const GET = withApiHandler(getRegistrations);
export const POST = withApiHandler(createRegistration);
