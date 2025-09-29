// app/api/events/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Define valid Enum values
const VALID_EVENT_TYPES = ["GENERAL", "ACADEMIC", "SPORTS", "CULTURAL", "MEETING", "WORKSHOP", "ORIENTATION", "FUNDRAISER", "OTHER"];
const VALID_EVENT_STATUSES = ["SCHEDULED", "POSTPONED", "CANCELLED", "COMPLETED"];
const VALID_EVENT_AUDIENCES = ["ALL", "ACADEMIC_LEVEL", "COURSE", "EDUCATOR", "STUDENT", "DEPARTMENT", "STAFF", "PARENT"];

// GET /api/events
async function getEvents(request: Request) {
  try {
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
    const academicLevelId = searchParams.get('academicLevelId');
    const courseId = searchParams.get('courseId');

    const whereClause: any = {};

    if (companyId) whereClause.companyId = companyId;
    if (eventType) {
      if (!VALID_EVENT_TYPES.includes(eventType.toUpperCase()))
        return formatResponse(false, null, `Invalid event type: ${eventType}`, 400);
      whereClause.eventType = eventType.toUpperCase();
    }
    if (eventStatus) {
      if (!VALID_EVENT_STATUSES.includes(eventStatus.toUpperCase()))
        return formatResponse(false, null, `Invalid event status: ${eventStatus}`, 400);
      whereClause.eventStatus = eventStatus.toUpperCase();
    }
    if (audience) {
      if (!VALID_EVENT_AUDIENCES.includes(audience.toUpperCase()))
        return formatResponse(false, null, `Invalid audience: ${audience}`, 400);
      whereClause.audience = audience.toUpperCase();
    }
    if (organizerId) whereClause.organizerId = organizerId;

    if (startAfter || startBefore) {
      whereClause.startDateTime = {};
      if (startAfter) {
        const date = new Date(startAfter);
        if (isNaN(date.getTime())) return formatResponse(false, null, "Invalid startAfter date format", 400);
        whereClause.startDateTime.gte = date;
      }
      if (startBefore) {
        const date = new Date(startBefore);
        if (isNaN(date.getTime())) return formatResponse(false, null, "Invalid startBefore date format", 400);
        whereClause.startDateTime.lte = date;
      }
    }

    if (endAfter || endBefore) {
      whereClause.endDateTime = {};
      if (endAfter) {
        const date = new Date(endAfter);
        if (isNaN(date.getTime())) return formatResponse(false, null, "Invalid endAfter date format", 400);
        whereClause.endDateTime.gte = date;
      }
      if (endBefore) {
        const date = new Date(endBefore);
        if (isNaN(date.getTime())) return formatResponse(false, null, "Invalid endBefore date format", 400);
        whereClause.endDateTime.lte = date;
      }
    }

    if (isRegistrationRequired !== undefined) whereClause.isRegistrationRequired = isRegistrationRequired === 'true';
    if (isPaid !== undefined) whereClause.isPaid = isPaid === 'true';

    if (academicLevelId) whereClause.targetAcademicLevelIds = { has: academicLevelId };
    if (courseId) whereClause.targetCourseIds = { has: courseId };

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { startDateTime: 'asc' },
    });

    const responseData = events.map((event) => ({
      ...event,
      startDateTime: event.startDateTime.toISOString(),
      endDateTime: event.endDateTime?.toISOString() || null,
      organizerName: event.organizer?.name || 'N/A',
      organizerEmail: event.organizer?.email || 'N/A',
      companyName: event.company?.name || 'N/A',
    }));

    return formatResponse(true, responseData, "Events fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return formatResponse(false, null, error.message || "Failed to fetch events", 500);
  }
}

// POST /api/events
async function createEvent(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);

    const body = await request.json();
    const {
      title, summary, description, startDateTime, endDateTime, location, onlineMeetingLink,
      imageUrl, videoUrl, eventType, eventStatus, organizerId, audience,
      targetAcademicLevelIds = [], targetCourseIds = [], targetEducatorIds = [],
      targetStudentIds = [], targetDepartmentIds = [], targetParentIds = [],
      isRegistrationRequired, maxCapacity, isPaid, price, contactPerson, contactEmail, contactPhone
    } = body;

    if (!title || !startDateTime || !eventType || !eventStatus || !organizerId || !audience)
      return formatResponse(false, null, "Required fields missing", 400);

    if (!VALID_EVENT_TYPES.includes(eventType))
      return formatResponse(false, null, `Invalid event type: ${eventType}`, 400);
    if (!VALID_EVENT_STATUSES.includes(eventStatus))
      return formatResponse(false, null, `Invalid event status: ${eventStatus}`, 400);
    if (!VALID_EVENT_AUDIENCES.includes(audience))
      return formatResponse(false, null, `Invalid audience: ${audience}`, 400);

    const existingOrganizer = await prisma.educator.findUnique({ where: { id: organizerId }, select: { companyId: true, userId: true } });
    if (!existingOrganizer || !existingOrganizer.companyId)
      return formatResponse(false, null, "Educator not found or not associated with a company", 404);

    const parsedStart = new Date(startDateTime);
    if (isNaN(parsedStart.getTime())) return formatResponse(false, null, "Invalid startDateTime", 400);
    let parsedEnd: Date | undefined;
    if (endDateTime) {
      parsedEnd = new Date(endDateTime);
      if (isNaN(parsedEnd.getTime())) return formatResponse(false, null, "Invalid endDateTime", 400);
      if (parsedEnd <= parsedStart) return formatResponse(false, null, "End must be after start", 400);
    }

    let finalPrice: number | null = null;
    if (isPaid) {
      if (typeof price !== 'number' || price < 0)
        return formatResponse(false, null, "Price must be non-negative for paid events", 400);
      finalPrice = price;
    }

    const newEvent = await prisma.event.create({
      data: {
        companyId: existingOrganizer.companyId,
        title, summary, description,
        startDateTime: parsedStart, endDateTime: parsedEnd,
        location, onlineMeetingLink, imageUrl, videoUrl,
        eventType, eventStatus, organizerId: existingOrganizer.userId, audience,
        targetAcademicLevelIds, targetCourseIds, targetEducatorIds,
        targetStudentIds, targetDepartmentIds, targetParentIds,
        isRegistrationRequired: Boolean(isRegistrationRequired),
        maxCapacity: typeof maxCapacity === 'number' && maxCapacity > 0 ? maxCapacity : null,
        isPaid: Boolean(isPaid),
        price: finalPrice,
        contactPerson, contactEmail, contactPhone
      },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } },
      },
    });

    const responseData = {
      ...newEvent,
      startDateTime: newEvent.startDateTime.toISOString(),
      endDateTime: newEvent.endDateTime?.toISOString() || null,
      organizerName: newEvent.organizer?.name || 'N/A',
      organizerEmail: newEvent.organizer?.email || 'N/A',
      companyName: newEvent.company?.name || 'N/A',
    };

    return formatResponse(true, responseData, "Event created successfully", 201);
  } catch (error: any) {
    console.error("Error creating event:", error);
    return formatResponse(false, null, error.message || "Failed to create event", 500);
  }
}

export const GET = withApiHandler(getEvents, { requireAuth: true });
export const POST = withApiHandler(createEvent, { requireAuth: true });
