import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Define valid Enum values (must match your Prisma enums)
const VALID_EVENT_TYPES = ["GENERAL", "ACADEMIC", "SPORTS", "CULTURAL", "MEETING", "WORKSHOP", "ORIENTATION", "FUNDRAISER", "OTHER"];
const VALID_EVENT_STATUSES = ["SCHEDULED", "POSTPONED", "CANCELLED", "COMPLETED"];
const VALID_EVENT_AUDIENCES = ["ALL", "ACADEMIC_LEVEL", "COURSE", "EDUCATOR", "STUDENT", "DEPARTMENT", "STAFF", "PARENT"];

// GET /api/events
// Fetches events, filtered by companyId (required) and various optional criteria.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const eventType = searchParams.get('eventType');
    const eventStatus = searchParams.get('eventStatus');
    const audience = searchParams.get('audience');
    const organizerId = searchParams.get('organizerId');
    const startAfter = searchParams.get('startAfter'); // ISO date string
    const startBefore = searchParams.get('startBefore'); // ISO date string
    const endAfter = searchParams.get('endAfter'); // ISO date string
    const endBefore = searchParams.get('endBefore'); // ISO date string
    const isRegistrationRequired = searchParams.get('isRegistrationRequired'); // "true" or "false"
    const isPaid = searchParams.get('isPaid'); // "true" or "false"

    const whereClause: any = {};

    if (!companyId) {
      return NextResponse.json({ message: "Company ID is required to fetch events." }, { status: 400 });
    }

    whereClause.companyId = companyId;

    // if (eventType) {
    //   if (!VALID_EVENT_TYPES.includes(eventType.toUpperCase())) {
    //     return NextResponse.json({ message: `Invalid event type: ${eventType}. Must be one of ${VALID_EVENT_TYPES.join(', ')}.` }, { status: 400 });
    //   }
    //   whereClause.eventType = eventType.toUpperCase();
    // }

    // if (eventStatus) {
    //   if (!VALID_EVENT_STATUSES.includes(eventStatus.toUpperCase())) {
    //     return NextResponse.json({ message: `Invalid event status: ${eventStatus}. Must be one of ${VALID_EVENT_STATUSES.join(', ')}.` }, { status: 400 });
    //   }
    //   whereClause.eventStatus = eventStatus.toUpperCase();
    // }
    // if (audience) {
    //   if (!VALID_EVENT_AUDIENCES.includes(audience.toUpperCase())) {
    //     return NextResponse.json({ message: `Invalid event audience: ${audience}. Must be one of ${VALID_EVENT_AUDIENCES.join(', ')}.` }, { status: 400 });
    //   }
    //   whereClause.audience = audience.toUpperCase();
    // }

    // if (organizerId) {
    //   whereClause.organizerId = organizerId;
    // }

    // if (startAfter || startBefore) {
    //   whereClause.startDateTime = {};
    //   if (startAfter) {
    //     const date = new Date(startAfter);
    //     if (isNaN(date.getTime())) return NextResponse.json({ message: "Invalid startAfter date format." }, { status: 400 });
    //     whereClause.startDateTime.gte = date;
    //   }
    //   if (startBefore) {
    //     const date = new Date(startBefore);
    //     if (isNaN(date.getTime())) return NextResponse.json({ message: "Invalid startBefore date format." }, { status: 400 });
    //     whereClause.startDateTime.lte = date;
    //   }
    // }

    // if (endAfter || endBefore) {
    //   whereClause.endDateTime = {};
    //   if (endAfter) {
    //     const date = new Date(endAfter);
    //     if (isNaN(date.getTime())) return NextResponse.json({ message: "Invalid endAfter date format." }, { status: 400 });
    //     whereClause.endDateTime.gte = date;
    //   }
    //   if (endBefore) {
    //     const date = new Date(endBefore);
    //     if (isNaN(date.getTime())) return NextResponse.json({ message: "Invalid endBefore date format." }, { status: 400 });
    //     whereClause.endDateTime.lte = date;
    //   }
    // }

    // if (isRegistrationRequired !== undefined) {
    //   whereClause.isRegistrationRequired = isRegistrationRequired === 'true';
    // }
    
    // if (isPaid !== undefined) {
    //   whereClause.isPaid = isPaid === 'true';
    // }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: {
            id: true,
            name: true, 
            email: true 
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDateTime: 'asc', // Order by upcoming events first
      },
    });

    // Transform the data to flatten relations and ensure correct types
    const response = events.map((event) => ({
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
      // createdAt: event.createdAt.toISOString(),
      // updatedAt: event.updatedAt.toISOString(),
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ message: "Failed to fetch events", error: error.message }, { status: 500 });
  }
}

// POST /api/events
// Creates a new Event.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyId,
      title,
      summary,
      description,
      startDateTime, // ISO date string
      endDateTime,   // ISO date string (optional)
      location,
      onlineMeetingLink,
      imageUrl,
      videoUrl,
      eventType,     // EventType enum string
      eventStatus,   // EventStatus enum string
      organizerId,
      audience,      // EventAudience enum string
      targetAcademicLevelIds = [],
      targetCourseIds = [],
      targetEducatorIds = [],
      targetStudentIds = [],
      targetDepartmentIds = [],
      targetParentIds = [],
      isRegistrationRequired,
      maxCapacity,
      isPaid,
      price,
      contactPerson,
      contactEmail,
      contactPhone,
    } = body;

    // Basic validation
    if (!companyId || !title || !startDateTime || !eventType || !eventStatus || !organizerId || !audience) {
      return NextResponse.json({ message: "Company ID, Title, Start Date/Time, Event Type, Event Status, Organizer ID, and Audience are required to create an event." }, { status: 400 });
    }

    // Validate Enums
    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ message: `Invalid event type: ${eventType}. Must be one of ${VALID_EVENT_TYPES.join(', ')}.` }, { status: 400 });
    }
    if (!VALID_EVENT_STATUSES.includes(eventStatus)) {
      return NextResponse.json({ message: `Invalid event status: ${eventStatus}. Must be one of ${VALID_EVENT_STATUSES.join(', ')}.` }, { status: 400 });
    }
    if (!VALID_EVENT_AUDIENCES.includes(audience)) {
      return NextResponse.json({ message: `Invalid audience: ${audience}. Must be one of ${VALID_EVENT_AUDIENCES.join(', ')}.` }, { status: 400 });
    }

    // Validate organizerId exists
    const existingOrganizer = await prisma.salesAgent.findUnique({
      where: { id: organizerId },
      include:{
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    if (!existingOrganizer) {
      return NextResponse.json({ message: "Provided organizerId does not exist." }, { status: 400 });
    }

    // Validate companyId exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!existingCompany) {
      return NextResponse.json({ message: "Provided companyId does not exist." }, { status: 400 });
    }

    // Parse date fields
    const parsedStartDateTime = new Date(startDateTime);
    if (isNaN(parsedStartDateTime.getTime())) {
      return NextResponse.json({ message: "Invalid startDateTime format." }, { status: 400 });
    }

    let parsedEndDateTime: Date | undefined = undefined;
    if (endDateTime) {
      parsedEndDateTime = new Date(endDateTime);
      if (isNaN(parsedEndDateTime.getTime())) {
        return NextResponse.json({ message: "Invalid endDateTime format." }, { status: 400 });
      }
      if (parsedEndDateTime <= parsedStartDateTime) {
        return NextResponse.json({ message: "End date/time must be after start date/time." }, { status: 400 });
      }
    }

    // Handle price if it's a paid event
    let finalPrice: number | null = null;
    if (isPaid === true) {
      if (typeof price !== 'number' || price < 0) {
        return NextResponse.json({ message: "Price must be a non-negative number for paid events." }, { status: 400 });
      }
      finalPrice = price;
    } else if (isPaid === false) {
      finalPrice = null; // Ensure price is null if not paid
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
      organizerId: existingOrganizer.user.id,
      audience,
      targetAcademicLevelIds: Array.isArray(targetAcademicLevelIds) ? targetAcademicLevelIds : [],
      targetCourseIds: Array.isArray(targetCourseIds) ? targetCourseIds : [],
      targetEducatorIds: Array.isArray(targetEducatorIds) ? targetEducatorIds : [],
      targetStudentIds: Array.isArray(targetStudentIds) ? targetStudentIds : [],
      targetDepartmentIds: Array.isArray(targetDepartmentIds) ? targetDepartmentIds : [],
      targetParentIds: Array.isArray(targetParentIds) ? targetParentIds : [],
      isRegistrationRequired: isRegistrationRequired === true, // Ensure boolean
      maxCapacity: typeof maxCapacity === 'number' && maxCapacity > 0 ? maxCapacity : null, // Ensure positive number or null
      isPaid: isPaid === true, // Ensure boolean
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

    // Transform response
    const responseData = {
      id: newEvent.id,
      title: newEvent.title,
      summary: newEvent.summary,
      description: newEvent.description,
      startDateTime: newEvent.startDateTime.toISOString(),
      endDateTime: newEvent.endDateTime?.toISOString() || null,
      location: newEvent.location,
      onlineMeetingLink: newEvent.onlineMeetingLink,
      imageUrl: newEvent.imageUrl,
      videoUrl: newEvent.videoUrl,
      eventType: newEvent.eventType,
      eventStatus: newEvent.eventStatus,
      organizerId: newEvent.organizerId,
      organizerName: newEvent.organizer?.name || 'N/A',
      organizerEmail: newEvent.organizer?.email || 'N/A',
      companyId: newEvent.companyId,
      companyName: newEvent.company?.name || 'N/A',
      audience: newEvent.audience,
      targetAcademicLevelIds: newEvent.targetAcademicLevelIds,
      targetCourseIds: newEvent.targetCourseIds,
      targetEducatorIds: newEvent.targetEducatorIds,
      targetStudentIds: newEvent.targetStudentIds,
      targetDepartmentIds: newEvent.targetDepartmentIds,
      targetParentIds: newEvent.targetParentIds,
      isRegistrationRequired: newEvent.isRegistrationRequired,
      maxCapacity: newEvent.maxCapacity,
      isPaid: newEvent.isPaid,
      price: newEvent.price,
      contactPerson: newEvent.contactPerson,
      contactEmail: newEvent.contactEmail,
      contactPhone: newEvent.contactPhone,
      // createdAt: newEvent.createdAt.toISOString(),
      // updatedAt: newEvent.updatedAt.toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json({ message: "Failed to create event", error: error.message }, { status: 500 });
  }
}
