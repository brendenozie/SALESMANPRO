// app/api/events/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Define valid Enum values (must match your Prisma enums)
const VALID_EVENT_TYPES = ["GENERAL","ACADEMIC","SPORTS","CULTURAL","MEETING","WORKSHOP","ORIENTATION","FUNDRAISER","OTHER"];
const VALID_EVENT_STATUSES = ["SCHEDULED","POSTPONED","CANCELLED","COMPLETED"];
const VALID_EVENT_AUDIENCES = ["ALL","ACADEMIC_LEVEL","COURSE","EDUCATOR","STUDENT","DEPARTMENT","STAFF","PARENT"];

async function getEvent(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
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

    const responseData = {
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
      organizerName: event.organizer?.name || "N/A",
      organizerEmail: event.organizer?.email || "N/A",
      companyId: event.companyId,
      companyName: event.company?.name || "N/A",
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

    return formatResponse(true, responseData, "Event fetched successfully", 200);
  } catch (error: any) {
    console.error(`Error fetching event ${id}:`, error);
    return formatResponse(false, null, error.message || "Failed to fetch event", 500);
  }
}

async function patchEvent(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await request.json();
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) return formatResponse(false, null, "Event not found", 404);

    const updateData: any = {};

    // Allowed fields to update
    const fields = [
      "title","summary","description","location","onlineMeetingLink","imageUrl","videoUrl",
      "eventType","eventStatus","audience","targetAcademicLevelIds","targetCourseIds",
      "targetEducatorIds","targetStudentIds","targetDepartmentIds","targetParentIds",
      "isRegistrationRequired","maxCapacity","isPaid","price","contactPerson","contactEmail","contactPhone",
      "startDateTime","endDateTime"
    ];

    for (const key of fields) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    // Validate enums
    if (updateData.eventType && !VALID_EVENT_TYPES.includes(updateData.eventType)) {
      return formatResponse(false, null, `Invalid event type: ${updateData.eventType}`, 400);
    }
    if (updateData.eventStatus && !VALID_EVENT_STATUSES.includes(updateData.eventStatus)) {
      return formatResponse(false, null, `Invalid event status: ${updateData.eventStatus}`, 400);
    }
    if (updateData.audience && !VALID_EVENT_AUDIENCES.includes(updateData.audience)) {
      return formatResponse(false, null, `Invalid audience: ${updateData.audience}`, 400);
    }

    // Parse dates
    if (updateData.startDateTime) {
      const parsed = new Date(updateData.startDateTime);
      if (isNaN(parsed.getTime())) return formatResponse(false, null, "Invalid startDateTime", 400);
      updateData.startDateTime = parsed;
    }
    if (updateData.endDateTime !== undefined) {
      if (updateData.endDateTime === null) {
        updateData.endDateTime = null;
      } else {
        const parsed = new Date(updateData.endDateTime);
        if (isNaN(parsed.getTime())) return formatResponse(false, null, "Invalid endDateTime", 400);
        updateData.endDateTime = parsed;
      }
    }

    // Validate start/end
    const finalStart = updateData.startDateTime || existingEvent.startDateTime;
    const finalEnd = updateData.endDateTime ?? existingEvent.endDateTime;
    if (finalStart && finalEnd && finalEnd <= finalStart) {
      return formatResponse(false, null, "End date/time must be after start date/time", 400);
    }

    // Ensure IDs arrays
    const arrayFields = [
      "targetAcademicLevelIds","targetCourseIds","targetEducatorIds","targetStudentIds","targetDepartmentIds","targetParentIds"
    ];
    for (const key of arrayFields) {
      if (updateData[key] !== undefined) updateData[key] = Array.isArray(updateData[key]) ? updateData[key] : [];
    }

    // Paid/price logic
    if (updateData.isPaid !== undefined) {
      if (updateData.isPaid && (typeof updateData.price !== "number" || updateData.price < 0)) {
        return formatResponse(false, null, "Price must be non-negative for paid events", 400);
      }
      if (!updateData.isPaid) updateData.price = null;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } },
      },
    });

    return formatResponse(true, updatedEvent, "Event updated successfully", 200);
  } catch (error: any) {
    console.error(`Error updating event ${id}:`, error);
    return formatResponse(false, null, error.message || "Failed to update event", 500);
  }
}

async function deleteEvent(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) return formatResponse(false, null, "Event not found", 404);

    await prisma.event.delete({ where: { id } });
    return formatResponse(true, { deletedId: id }, "Event deleted successfully", 200);
  } catch (error: any) {
    console.error(`Error deleting event ${id}:`, error);
    return formatResponse(false, null, error.message || "Failed to delete event", 500);
  }
}

export const GET = withApiHandler(getEvent, { requireAuth: true });
export const PATCH = withApiHandler(patchEvent, { requireAuth: true });
export const DELETE = withApiHandler(deleteEvent, { requireAuth: true });
