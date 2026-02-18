import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// Define valid Enum values (must match your Prisma enums)
const VALID_EVENT_TYPES = ["GENERAL", "ACADEMIC", "SPORTS", "CULTURAL", "MEETING", "WORKSHOP", "ORIENTATION", "FUNDRAISER", "OTHER"];
const VALID_EVENT_STATUSES = ["SCHEDULED", "POSTPONED", "CANCELLED", "COMPLETED"];
const VALID_EVENT_AUDIENCES = ["ALL", "ACADEMIC_LEVEL", "COURSE", "EDUCATOR", "STUDENT", "DEPARTMENT", "STAFF", "PARENT"];

// Helper to transform the Prisma event object into the desired API structure
function transformEventResponse(event: any) {
  return {
    id: event.id,
    title: event.title,
    summary: event.summary,
    description: event.description,
    startDateTime: event.startDateTime.toISOString(),
    endDateTime: event.endDateTime?.toISOString() || null,
    location: event.location,
    onlineMeetingLink: event.onlineMeetingLink,
    imageUrl: event.imageUrl,
    videoUrl: event.videoUrl,
    eventType: event.eventType,
    eventStatus: event.eventStatus,
    organizerId: event.organizerId,
    organizerName: event.organizer?.name || 'N/A',
    organizerEmail: event.organizer?.email || 'N/A',
    companyId: event.companyId,
    companyName: event.company?.name || 'N/A',
    audience: event.audience,
    targetAcademicLevelIds: event.targetAcademicLevelIds,
    targetCourseIds: event.targetCourseIds,
    targetEducatorIds: event.targetEducatorIds,
    targetStudentIds: event.targetStudentIds,
    targetDepartmentIds: event.targetDepartmentIds,
    targetParentIds: event.targetParentIds,
    isRegistrationRequired: event.isRegistrationRequired,
    maxCapacity: event.maxCapacity,
    isPaid: event.isPaid,
    price: event.price,
    contactPerson: event.contactPerson,
    contactEmail: event.contactEmail,
    contactPhone: event.contactPhone,
  };
}

// =======================================================================
// GET /api/events
// Fetches events with optional filters.
// =======================================================================
async function getEvents(request: Request) {
  // Authentication check
  


  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const eventType = searchParams.get('eventType');
  const eventStatus = searchParams.get('eventStatus');
  const audience = searchParams.get('audience');
  const organizerId = searchParams.get('organizerId');
  const startAfter = searchParams.get('startAfter');
  const startBefore = searchParams.get('startBefore');
  const endAfter = searchParams.get('endAfter');
  const endBefore = searchParams.get('endBefore');
  const isRegistrationRequired = searchParams.get('isRegistrationRequired');
  const isPaid = searchParams.get('isPaid');

  const whereClause: any = {};

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required to fetch events.", 400);
  }

  whereClause.companyId = companyId;

  if (eventType) {
    const upperEventType = eventType.toUpperCase();
    if (!VALID_EVENT_TYPES.includes(upperEventType)) {
      return formatResponse(false, null, `Invalid event type: ${eventType}. Must be one of ${VALID_EVENT_TYPES.join(', ')}.`, 400);
    }
    whereClause.eventType = upperEventType;
  }

  if (eventStatus) {
    const upperEventStatus = eventStatus.toUpperCase();
    if (!VALID_EVENT_STATUSES.includes(upperEventStatus)) {
      return formatResponse(false, null, `Invalid event status: ${eventStatus}. Must be one of ${VALID_EVENT_STATUSES.join(', ')}.`, 400);
    }
    whereClause.eventStatus = upperEventStatus;
  }
  if (audience) {
    const upperAudience = audience.toUpperCase();
    if (!VALID_EVENT_AUDIENCES.includes(upperAudience)) {
      return formatResponse(false, null, `Invalid event audience: ${audience}. Must be one of ${VALID_EVENT_AUDIENCES.join(', ')}.`, 400);
    }
    whereClause.audience = upperAudience;
  }

  if (organizerId) {
    whereClause.organizerId = organizerId;
  }

  if (startAfter || startBefore) {
    whereClause.startDateTime = {};
    if (startAfter) {
      const date = new Date(startAfter);
      if (isNaN(date.getTime())) return formatResponse(false, null, "Invalid startAfter date format.", 400);
      whereClause.startDateTime.gte = date;
    }
    if (startBefore) {
      const date = new Date(startBefore);
      if (isNaN(date.getTime())) return formatResponse(false, null, "Invalid startBefore date format.", 400);
      whereClause.startDateTime.lte = date;
    }
  }

  if (endAfter || endBefore) {
    whereClause.endDateTime = {};
    if (endAfter) {
      const date = new Date(endAfter);
      if (isNaN(date.getTime())) return formatResponse(false, null, "Invalid endAfter date format.", 400);
      whereClause.endDateTime.gte = date;
    }
    if (endBefore) {
      const date = new Date(endBefore);
      if (isNaN(date.getTime())) return formatResponse(false, null, "Invalid endBefore date format.", 400);
      whereClause.endDateTime.lte = date;
    }
  }

  if (isRegistrationRequired !== undefined) {
    whereClause.isRegistrationRequired = isRegistrationRequired === 'true';
  }

  if (isPaid !== undefined) {
    whereClause.isPaid = isPaid === 'true';
  }

  
    const cacheKey = `admin:events:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      organizer: {
        select: { id: true, name: true, email: true },
      },
      company: {
        select: { id: true, name: true },
      },
    },
    orderBy: {
      startDateTime: 'asc',
    },
  });

  try {
    if (events) {
      await cacheSet(cacheKey, events, 60);
    }
  } catch (e) {}

  const response = events.map(transformEventResponse);

  return formatResponse(true, { data: response }, null, 200);
}

// =======================================================================
// POST /api/events
// Creates a new Event.
// =======================================================================
async function createEvent(request: Request) {
  // Authentication check
  


  const body = await request.json();
  const {
    companyId,
    title,
    startDateTime,
    endDateTime,
    eventType,
    eventStatus,
    organizerId,
    audience,
    isPaid,
    price,
    // Optional fields
    summary,
    description,
    location,
    onlineMeetingLink,
    imageUrl,
    videoUrl,
    targetAcademicLevelIds = [],
    targetCourseIds = [],
    targetEducatorIds = [],
    targetStudentIds = [],
    targetDepartmentIds = [],
    targetParentIds = [],
    isRegistrationRequired,
    maxCapacity,
    contactPerson,
    contactEmail,
    contactPhone,
  } = body;

  // Basic validation
  if (!companyId || !title || !startDateTime || !eventType || !eventStatus || !organizerId || !audience) {
    return formatResponse(false, null, "Company ID, Title, Start Date/Time, Event Type, Event Status, Organizer ID, and Audience are required to create an event.", 400);
  }

  // Validate Enums
  if (!VALID_EVENT_TYPES.includes(eventType)) {
    return formatResponse(false, null, `Invalid event type: ${eventType}. Must be one of ${VALID_EVENT_TYPES.join(', ')}.`, 400);
  }
  if (!VALID_EVENT_STATUSES.includes(eventStatus)) {
    return formatResponse(false, null, `Invalid event status: ${eventStatus}. Must be one of ${VALID_EVENT_STATUSES.join(', ')}.`, 400);
  }
  if (!VALID_EVENT_AUDIENCES.includes(audience)) {
    return formatResponse(false, null, `Invalid audience: ${audience}. Must be one of ${VALID_EVENT_AUDIENCES.join(', ')}.`, 400);
  }

  // Validate organizerId exists (Assuming organizerId is a SalesAgent ID that links to a User)
  const existingOrganizer = await prisma.salesAgent.findUnique({
    where: { id: organizerId },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
  if (!existingOrganizer) {
    return formatResponse(false, null, "Provided organizerId (Sales Agent) does not exist.", 400);
  }
  const finalOrganizerUserId = existingOrganizer.user?.id; // Use the User ID linked to the Sales Agent

  // Validate companyId exists
  const existingCompany = await prisma.company.findUnique({
    where: { id: companyId },
  });
  if (!existingCompany) {
    return formatResponse(false, null, "Provided companyId does not exist.", 400);
  }

  // Parse date fields
  const parsedStartDateTime = new Date(startDateTime);
  if (isNaN(parsedStartDateTime.getTime())) {
    return formatResponse(false, null, "Invalid startDateTime format.", 400);
  }

  let parsedEndDateTime: Date | null = null;
  if (endDateTime) {
    const date = new Date(endDateTime);
    if (isNaN(date.getTime())) {
      return formatResponse(false, null, "Invalid endDateTime format.", 400);
    }
    parsedEndDateTime = date;
    if (parsedEndDateTime <= parsedStartDateTime) {
      return formatResponse(false, null, "End date/time must be after start date/time.", 400);
    }
  }

  // Handle price if it's a paid event
  let finalPrice: number | null = null;
  const isEventPaid = isPaid === true;
  if (isEventPaid) {
    if (typeof price !== 'number' || price < 0) {
      return formatResponse(false, null, "Price must be a non-negative number for paid events.", 400);
    }
    finalPrice = price;
  }

  const data: any = {
    companyId,
    title,
    summary,
    description,
    startDateTime: parsedStartDateTime,
    endDateTime: parsedEndDateTime,
    location,
    onlineMeetingLink,
    imageUrl,
    videoUrl,
    eventType,
    eventStatus,
    organizerId: finalOrganizerUserId,
    audience,
    targetAcademicLevelIds: Array.isArray(targetAcademicLevelIds) ? targetAcademicLevelIds : [],
    targetCourseIds: Array.isArray(targetCourseIds) ? targetCourseIds : [],
    targetEducatorIds: Array.isArray(targetEducatorIds) ? targetEducatorIds : [],
    targetStudentIds: Array.isArray(targetStudentIds) ? targetStudentIds : [],
    targetDepartmentIds: Array.isArray(targetDepartmentIds) ? targetDepartmentIds : [],
    targetParentIds: Array.isArray(targetParentIds) ? targetParentIds : [],
    isRegistrationRequired: isRegistrationRequired === true,
    maxCapacity: typeof maxCapacity === 'number' && maxCapacity > 0 ? maxCapacity : null,
    isPaid: isEventPaid,
    price: finalPrice,
    contactPerson,
    contactEmail,
    contactPhone,
  };

  const newEvent = await prisma.event.create({
    data,
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      company: { select: { id: true, name: true } },
    },
  });

  const responseData = transformEventResponse(newEvent);

  
    try { await cacheDel(`admin:events:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { data: responseData }, null, 201);
}

// Export the handlers wrapped in the `withApiHandler` utility.
export const GET = withApiHandler(getEvents);
export const POST = withApiHandler(createEvent);
