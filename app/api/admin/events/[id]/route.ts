

import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Define valid Enum values (must match your Prisma enums)
const VALID_EVENT_TYPES = ["GENERAL", "ACADEMIC", "SPORTS", "CULTURAL", "MEETING", "WORKSHOP", "ORIENTATION", "FUNDRAISER", "OTHER"];
const VALID_EVENT_STATUSES = ["SCHEDULED", "POSTPONED", "CANCELLED", "COMPLETED"];
const VALID_EVENT_AUDIENCES = ["ALL", "ACADEMIC_LEVEL", "COURSE", "EDUCATOR", "STUDENT", "DEPARTMENT", "STAFF", "PARENT"];

// Define the type for the dynamic segment 'id' from the URL
interface Params {
  params: { id: string };
}

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
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

// =======================================================================
// GET /api/events/[id]
// Fetches a single Event by its ID.
// =======================================================================
async function getEvent(request: Request, { params }: Params) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      company: { select: { id: true, name: true } },
    },
  });

  if (!event) {
    return formatResponse(false, null, "Event not found", 404);
  }

  const responseData = transformEventResponse(event);
  return formatResponse(true, { data: responseData }, null, 200);
}

// =======================================================================
// PATCH /api/events/[id]
// Updates an existing Event by ID.
// =======================================================================
async function updateEvent(request: Request, { params }: Params) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const body = await request.json();
  const {
    title, summary, description, startDateTime, endDateTime, location, onlineMeetingLink, imageUrl,
    videoUrl, eventType, eventStatus, organizerId, audience, targetAcademicLevelIds,
    targetCourseIds, targetEducatorIds, targetStudentIds, targetDepartmentIds, targetParentIds,
    isRegistrationRequired, maxCapacity, isPaid, price, contactPerson, contactEmail, contactPhone,
    companyId, // Ignored, cannot be changed
    ...rest
  } = body;

  if (Object.keys(rest).length > 0) {
    console.warn("Unexpected fields in PATCH request for event:", rest);
  }

  const existingEvent = await prisma.event.findUnique({
    where: { id },
  });

  if (!existingEvent) {
    return formatResponse(false, null, "Event not found", 404);
  }

  const updateData: any = {};

  if (title !== undefined) updateData.title = title;
  if (summary !== undefined) updateData.summary = summary;
  if (description !== undefined) updateData.description = description;
  if (location !== undefined) updateData.location = location;
  if (onlineMeetingLink !== undefined) updateData.onlineMeetingLink = onlineMeetingLink;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (videoUrl !== undefined) updateData.videoUrl = videoUrl;

  // Validate and update enums
  if (eventType !== undefined) {
    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return formatResponse(false, null, `Invalid event type: ${eventType}. Must be one of ${VALID_EVENT_TYPES.join(', ')}.`, 400);
    }
    updateData.eventType = eventType;
  }
  if (eventStatus !== undefined) {
    if (!VALID_EVENT_STATUSES.includes(eventStatus)) {
      return formatResponse(false, null, `Invalid event status: ${eventStatus}. Must be one of ${VALID_EVENT_STATUSES.join(', ')}.`, 400);
    }
    updateData.eventStatus = eventStatus;
  }
  if (audience !== undefined) {
    if (!VALID_EVENT_AUDIENCES.includes(audience)) {
      return formatResponse(false, null, `Invalid audience: ${audience}. Must be one of ${VALID_EVENT_AUDIENCES.join(', ')}.`, 400);
    }
    updateData.audience = audience;
  }

  // Parse and update date fields
  if (startDateTime !== undefined) {
    const parsedStartDateTime = new Date(startDateTime);
    if (isNaN(parsedStartDateTime.getTime())) {
      return formatResponse(false, null, "Invalid startDateTime format.", 400);
    }
    updateData.startDateTime = parsedStartDateTime;
  }

  if (endDateTime !== undefined) {
    if (endDateTime === null) {
      updateData.endDateTime = null;
    } else {
      const parsedEndDateTime = new Date(endDateTime);
      if (isNaN(parsedEndDateTime.getTime())) {
        return formatResponse(false, null, "Invalid endDateTime format.", 400);
      }
      updateData.endDateTime = parsedEndDateTime;
    }
  }

  // Re-validate start/end date/time relationship
  const finalStartDateTime = updateData.startDateTime || existingEvent.startDateTime;
  const finalEndDateTime = updateData.endDateTime === null ? null : (updateData.endDateTime || existingEvent.endDateTime);

  if (finalStartDateTime && finalEndDateTime && finalEndDateTime <= finalStartDateTime) {
    return formatResponse(false, null, "End date/time must be after start date/time.", 400);
  }

  // Update audience IDs (ensure they are arrays)
  if (targetAcademicLevelIds !== undefined) updateData.targetAcademicLevelIds = Array.isArray(targetAcademicLevelIds) ? targetAcademicLevelIds : [];
  if (targetCourseIds !== undefined) updateData.targetCourseIds = Array.isArray(targetCourseIds) ? targetCourseIds : [];
  if (targetEducatorIds !== undefined) updateData.targetEducatorIds = Array.isArray(targetEducatorIds) ? targetEducatorIds : [];
  if (targetStudentIds !== undefined) updateData.targetStudentIds = Array.isArray(targetStudentIds) ? targetStudentIds : [];
  if (targetDepartmentIds !== undefined) updateData.targetDepartmentIds = Array.isArray(targetDepartmentIds) ? targetDepartmentIds : [];
  if (targetParentIds !== undefined) updateData.targetParentIds = Array.isArray(targetParentIds) ? targetParentIds : [];

  // Update registration and payment fields
  if (isRegistrationRequired !== undefined) updateData.isRegistrationRequired = isRegistrationRequired;
  if (maxCapacity !== undefined) updateData.maxCapacity = typeof maxCapacity === 'number' && maxCapacity > 0 ? maxCapacity : null;
  
  if (isPaid !== undefined) {
    updateData.isPaid = isPaid;
    if (isPaid === true) {
      if (typeof price !== 'number' || price < 0) {
        return formatResponse(false, null, "Price must be a non-negative number for paid events.", 400);
      }
      updateData.price = price;
    } else {
      updateData.price = null;
    }
  } else if (price !== undefined) {
    if (existingEvent.isPaid !== true) {
      return formatResponse(false, null, "Cannot set price if event is not marked as paid.", 400);
    }
    if (typeof price !== 'number' || price < 0) {
      return formatResponse(false, null, "Price must be a non-negative number.", 400);
    }
    updateData.price = price;
  }

  if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
  if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
  if (contactPhone !== undefined) updateData.contactPhone = contactPhone;

  // Final check before update
  if (Object.keys(updateData).length === 0) {
    return formatResponse(false, null, "No valid fields provided for update.", 400);
  }

  try {
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } },
      },
    });

    const responseData = transformEventResponse(updatedEvent);
    return formatResponse(true, { data: responseData }, null, 200);
  } catch (error: any) {
    if (error.code === 'P2025') { // Record not found
      return formatResponse(false, null, "Event not found.", 404);
    }
    // Let withApiHandler handle other errors (500)
    throw error;
  }
}

// =======================================================================
// DELETE /api/events/[id]
// Deletes an Event by ID.
// =======================================================================
async function deleteEvent(request: Request, { params }: Params) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  const existingEvent = await prisma.event.findUnique({
    where: { id },
  });

  if (!existingEvent) {
    return formatResponse(false, null, "Event not found", 404);
  }

  try {
    const deletedEvent = await prisma.event.delete({
      where: { id },
    });
    return formatResponse(true, { message: "Event deleted successfully", deletedId: deletedEvent.id }, null, 200);
  } catch (error: any) {
    if (error.code === 'P2003') { // Foreign key constraint failed (e.g., if EventRegistration exists)
      return formatResponse(false, null, "Cannot delete event: It has associated registrations or records that prevent deletion.", 409);
    }
    // Let withApiHandler handle other errors (500)
    throw error;
  }
}

// Export the handlers wrapped in the `withApiHandler` utility.
export const GET = withApiHandler(getEvent);
export const PATCH = withApiHandler(updateEvent);
export const DELETE = withApiHandler(deleteEvent);
