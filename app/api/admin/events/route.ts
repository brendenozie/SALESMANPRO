import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Define valid Enum values (must match your Prisma enums)
const VALID_EVENT_TYPES = [
  "GENERAL",
  "ACADEMIC",
  "SPORTS",
  "CULTURAL",
  "MEETING",
  "WORKSHOP",
  "ORIENTATION",
  "FUNDRAISER",
  "OTHER",
];
const VALID_EVENT_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "POSTPONED",
  "CANCELLED",
  "COMPLETED",
];
const VALID_EVENT_AUDIENCES = [
  "ALL",
  "ACADEMIC_LEVEL",
  "COURSE",
  "EDUCATOR",
  "STUDENT",
  "DEPARTMENT",
  "STAFF",
  "PARENT",
];

// Helper to transform the Prisma event object into the desired API structure
function transformEventResponse(event: any) {
  const ticketsCount = event.tickets?.length || 0;
  const ticketsSold = event.tickets?.reduce(
    (acc: number, t: any) => acc + (t.quantitySold || 0),
    0,
  ) || 0;
  const totalCapacity = event.tickets?.reduce(
    (acc: number, t: any) => acc + (t.quantityTotal || 0),
    0,
  ) || event.maxCapacity || 0;

  return {
    id: event.id,
    title: event.title,
    summary: event.summary,
    description: event.description,
    startDateTime: event.startDateTime ? event.startDateTime.toISOString() : null,
    endDateTime: event.endDateTime?.toISOString() || null,
    location: event.location,
    onlineMeetingLink: event.onlineMeetingLink,
    imageUrl: event.imageUrl,
    videoUrl: event.videoUrl,
    eventType: event.eventType,
    eventStatus: event.eventStatus,
    organizerId: event.organizerId,
    organizerName: event.organizer?.name || "N/A",
    organizerEmail: event.organizer?.email || "N/A",
    companyId: event.companyId,
    companyName: event.company?.name || "N/A",
    audience: event.audience,
    targetAcademicLevelIds: event.targetAcademicLevelIds || [],
    targetCourseIds: event.targetCourseIds || [],
    targetEducatorIds: event.targetEducatorIds || [],
    targetStudentIds: event.targetStudentIds || [],
    targetDepartmentIds: event.targetDepartmentIds || [],
    targetParentIds: event.targetParentIds || [],
    isRegistrationRequired: event.isRegistrationRequired,
    maxCapacity: event.maxCapacity,
    isPaid: event.isPaid,
    price: event.price,
    contactPerson: event.contactPerson,
    contactEmail: event.contactEmail,
    contactPhone: event.contactPhone,
    tickets: event.tickets || [],
    ticketsCount,
    ticketsSold,
    totalCapacity,
    createdAt: event.createdAt?.toISOString() || null,
    updatedAt: event.updatedAt?.toISOString() || null,
  };
}

// =======================================================================
// GET /api/admin/events
// Fetches events with optional filters.
// =======================================================================
async function getEvents(request: Request, context: any) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.companyId;
  const eventType = searchParams.get("eventType");
  const eventStatus = searchParams.get("eventStatus");
  const audience = searchParams.get("audience");
  const organizerId = searchParams.get("organizerId");
  const search = searchParams.get("search")?.trim();

  if (!companyId) {
    return formatResponse(
      false,
      null,
      "Company ID is required to fetch events.",
      400,
    );
  }

  const whereClause: any = { companyId };

  if (eventType && VALID_EVENT_TYPES.includes(eventType.toUpperCase())) {
    whereClause.eventType = eventType.toUpperCase();
  }

  if (eventStatus && VALID_EVENT_STATUSES.includes(eventStatus.toUpperCase())) {
    whereClause.eventStatus = eventStatus.toUpperCase();
  }

  if (audience && VALID_EVENT_AUDIENCES.includes(audience.toUpperCase())) {
    whereClause.audience = audience.toUpperCase();
  }

  if (organizerId) {
    whereClause.organizerId = organizerId;
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  const cacheKey = buildTenantCacheKey(companyId, "events", {
    eventType,
    eventStatus,
    audience,
    organizerId,
    search,
  });

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
      tickets: true,
    },
    orderBy: {
      startDateTime: "asc",
    },
  });

  const response = events.map(transformEventResponse);

  try {
    if (events) {
      await cacheSet(cacheKey, response, 60);
    }
  } catch (e) {}

  return formatResponse(true, response, null, 200);
}

// =======================================================================
// POST /api/admin/events
// Creates a new Event.
// =======================================================================
async function createEvent(request: Request, context: any) {
  const body = await request.json().catch(() => ({}));
  const {
    companyId: rawCompanyId,
    title,
    startDateTime,
    endDateTime,
    eventType = "GENERAL",
    eventStatus = "SCHEDULED",
    organizerId: rawOrganizerId,
    audience = "ALL",
    isPaid = false,
    price,
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
    isRegistrationRequired = false,
    maxCapacity,
    contactPerson,
    contactEmail,
    contactPhone,
  } = body;

  const companyId = rawCompanyId || context.companyId;

  // Basic validation
  if (!companyId || !title || !startDateTime) {
    return formatResponse(
      false,
      null,
      "Company ID, Title, and Start Date/Time are required to create an event.",
      400,
    );
  }

  // Validate companyId exists
  const existingCompany = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, userId: true },
  });
  if (!existingCompany) {
    return formatResponse(
      false,
      null,
      "Provided companyId does not exist.",
      400,
    );
  }

  // Validate Enums safely with fallbacks
  const finalEventType = VALID_EVENT_TYPES.includes(eventType)
    ? eventType
    : "GENERAL";
  const finalEventStatus = VALID_EVENT_STATUSES.includes(eventStatus)
    ? eventStatus
    : "SCHEDULED";
  const finalAudience = VALID_EVENT_AUDIENCES.includes(audience)
    ? audience
    : "ALL";

  // Validate organizerId exists with robust fallback
  let finalOrganizerUserId: string | undefined;

  if (rawOrganizerId && rawOrganizerId !== "organizerId") {
    const directUser = await prisma.user.findUnique({
      where: { id: rawOrganizerId },
      select: { id: true },
    });
    if (directUser) {
      finalOrganizerUserId = directUser.id;
    } else {
      const existingOrganizer = await prisma.salesAgent.findUnique({
        where: { id: rawOrganizerId },
        include: { user: { select: { id: true } } },
      });
      if (existingOrganizer?.user?.id) {
        finalOrganizerUserId = existingOrganizer.user.id;
      } else {
        const staffMember = await prisma.staff.findUnique({
          where: { id: rawOrganizerId },
          select: { userId: true },
        });
        if (staffMember?.userId) {
          finalOrganizerUserId = staffMember.userId;
        }
      }
    }
  }

  // Fallback 1: Authenticated session user
  if (!finalOrganizerUserId && context.user?.id) {
    finalOrganizerUserId = context.user.id;
  }

  // Fallback 2: Company owner userId
  if (!finalOrganizerUserId && existingCompany.userId) {
    finalOrganizerUserId = existingCompany.userId;
  }

  // Fallback 3: First admin user of company
  if (!finalOrganizerUserId) {
    const fallbackUser = await prisma.user.findFirst({
      where: { companyId },
      select: { id: true },
    });
    finalOrganizerUserId = fallbackUser?.id;
  }

  if (!finalOrganizerUserId) {
    return formatResponse(
      false,
      null,
      "Unable to identify a valid Organizer/User for this event.",
      400,
    );
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
      return formatResponse(
        false,
        null,
        "End date/time must be after start date/time.",
        400,
      );
    }
  }

  // Handle price if it's a paid event
  let finalPrice: number | null = null;
  const isEventPaid = Boolean(isPaid);
  if (isEventPaid) {
    if (typeof price !== "number" || price < 0) {
      return formatResponse(
        false,
        null,
        "Price must be a non-negative number for paid events.",
        400,
      );
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
    eventType: finalEventType,
    eventStatus: finalEventStatus,
    organizerId: finalOrganizerUserId,
    audience: finalAudience,
    targetAcademicLevelIds: Array.isArray(targetAcademicLevelIds)
      ? targetAcademicLevelIds
      : [],
    targetCourseIds: Array.isArray(targetCourseIds) ? targetCourseIds : [],
    targetEducatorIds: Array.isArray(targetEducatorIds)
      ? targetEducatorIds
      : [],
    targetStudentIds: Array.isArray(targetStudentIds) ? targetStudentIds : [],
    targetDepartmentIds: Array.isArray(targetDepartmentIds)
      ? targetDepartmentIds
      : [],
    targetParentIds: Array.isArray(targetParentIds) ? targetParentIds : [],
    isRegistrationRequired: Boolean(isRegistrationRequired),
    maxCapacity:
      typeof maxCapacity === "number" && maxCapacity > 0 ? maxCapacity : null,
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
      tickets: true,
    },
  });

  const responseData = transformEventResponse(newEvent);

  try {
    await cacheDel(`tenant:${companyId}:events:*`);
    await cacheDel(`admin:events:*`);
  } catch (e) {}

  return formatResponse(true, responseData, "Event created successfully", 201);
}

export const GET = withApiHandler(getEvents);
export const POST = withApiHandler(createEvent);
