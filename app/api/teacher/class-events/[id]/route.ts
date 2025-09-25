import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Define valid Enum values (must match your Prisma enums)
const VALID_EVENT_TYPES = ["GENERAL", "ACADEMIC", "SPORTS", "CULTURAL", "MEETING", "WORKSHOP", "ORIENTATION", "FUNDRAISER", "OTHER"];
const VALID_EVENT_STATUSES = ["SCHEDULED", "POSTPONED", "CANCELLED", "COMPLETED"];
const VALID_EVENT_AUDIENCES = ["ALL", "ACADEMIC_LEVEL", "COURSE", "EDUCATOR", "STUDENT", "DEPARTMENT", "STAFF", "PARENT"];

// GET /api/events/[id]
// Fetches a single Event by its ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
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
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Transform response
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

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching event with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch event", error: error.message }, { status: 500 });
  }
}

// PATCH /api/events/[id]
// Updates an existing Event by ID.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const body = await request.json();
    const {
      title,
      summary,
      description,
      startDateTime,
      endDateTime,
      location,
      onlineMeetingLink,
      imageUrl,
      videoUrl,
      eventType,
      eventStatus,
      organizerId, // Typically not changed after creation
      audience,
      targetAcademicLevelIds,
      targetCourseIds,
      targetEducatorIds,
      targetStudentIds,
      targetDepartmentIds,
      targetParentIds,
      isRegistrationRequired,
      maxCapacity,
      isPaid,
      price,
      contactPerson,
      contactEmail,
      contactPhone,
      companyId, // companyId should not be changed after creation
      ...rest
    } = body;

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for event:", rest);
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
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
        return NextResponse.json({ message: `Invalid event type: ${eventType}. Must be one of ${VALID_EVENT_TYPES.join(', ')}.` }, { status: 400 });
      }
      updateData.eventType = eventType;
    }
    if (eventStatus !== undefined) {
      if (!VALID_EVENT_STATUSES.includes(eventStatus)) {
        return NextResponse.json({ message: `Invalid event status: ${eventStatus}. Must be one of ${VALID_EVENT_STATUSES.join(', ')}.` }, { status: 400 });
      }
      updateData.eventStatus = eventStatus;
    }
    if (audience !== undefined) {
      if (!VALID_EVENT_AUDIENCES.includes(audience)) {
        return NextResponse.json({ message: `Invalid audience: ${audience}. Must be one of ${VALID_EVENT_AUDIENCES.join(', ')}.` }, { status: 400 });
      }
      updateData.audience = audience;
    }

    // Parse and update date fields
    if (startDateTime !== undefined) {
      const parsedStartDateTime = new Date(startDateTime);
      if (isNaN(parsedStartDateTime.getTime())) {
        return NextResponse.json({ message: "Invalid startDateTime format." }, { status: 400 });
      }
      updateData.startDateTime = parsedStartDateTime;
    }

    if (endDateTime !== undefined) {
      if (endDateTime === null) { // Allow setting to null to remove end time
        updateData.endDateTime = null;
      } else {
        const parsedEndDateTime = new Date(endDateTime);
        if (isNaN(parsedEndDateTime.getTime())) {
          return NextResponse.json({ message: "Invalid endDateTime format." }, { status: 400 });
        }
        updateData.endDateTime = parsedEndDateTime;
      }
    }

    // Re-validate start/end date/time relationship if both are provided or one is updated
    const finalStartDateTime = updateData.startDateTime || existingEvent.startDateTime;
    const finalEndDateTime = updateData.endDateTime || existingEvent.endDateTime;

    if (finalStartDateTime && finalEndDateTime && finalEndDateTime <= finalStartDateTime) {
      return NextResponse.json({ message: "End date/time must be after start date/time." }, { status: 400 });
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
          return NextResponse.json({ message: "Price must be a non-negative number for paid events." }, { status: 400 });
        }
        updateData.price = price;
      } else {
        updateData.price = null; // Ensure price is null if not paid
      }
    } else if (price !== undefined) { // If price is updated but isPaid is not explicitly set to true
        // This case handles if someone tries to set a price without setting isPaid to true
        if (existingEvent.isPaid !== true) {
            return NextResponse.json({ message: "Cannot set price if event is not marked as paid." }, { status: 400 });
        }
        if (typeof price !== 'number' || price < 0) {
            return NextResponse.json({ message: "Price must be a non-negative number." }, { status: 400 });
        }
        updateData.price = price;
    }

    if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } },
      },
    });

    // Transform response
    const responseData = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      summary: updatedEvent.summary,
      description: updatedEvent.description,
      startDateTime: updatedEvent.startDateTime.toISOString(),
      endDateTime: updatedEvent.endDateTime?.toISOString() || null,
      location: updatedEvent.location,
      onlineMeetingLink: updatedEvent.onlineMeetingLink,
      imageUrl: updatedEvent.imageUrl,
      videoUrl: updatedEvent.videoUrl,
      eventType: updatedEvent.eventType,
      eventStatus: updatedEvent.eventStatus,
      organizerId: updatedEvent.organizerId,
      organizerName: updatedEvent.organizer?.name || 'N/A',
      organizerEmail: updatedEvent.organizer?.email || 'N/A',
      companyId: updatedEvent.companyId,
      companyName: updatedEvent.company?.name || 'N/A',
      audience: updatedEvent.audience,
      targetAcademicLevelIds: updatedEvent.targetAcademicLevelIds,
      targetCourseIds: updatedEvent.targetCourseIds,
      targetEducatorIds: updatedEvent.targetEducatorIds,
      targetStudentIds: updatedEvent.targetStudentIds,
      targetDepartmentIds: updatedEvent.targetDepartmentIds,
      targetParentIds: updatedEvent.targetParentIds,
      isRegistrationRequired: updatedEvent.isRegistrationRequired,
      maxCapacity: updatedEvent.maxCapacity,
      isPaid: updatedEvent.isPaid,
      price: updatedEvent.price,
      contactPerson: updatedEvent.contactPerson,
      contactEmail: updatedEvent.contactEmail,
      contactPhone: updatedEvent.contactPhone,
      createdAt: updatedEvent.createdAt.toISOString(),
      updatedAt: updatedEvent.updatedAt.toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating event with ID ${id}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to update event", error: error.message }, { status: 500 });
  }
}

// DELETE /api/events/[id]
// Deletes an Event by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const deletedEvent = await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Event deleted successfully", deletedId: deletedEvent.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting event with ID ${id}:`, error);
    if (error.code === 'P2003') { // Foreign key constraint failed (e.g., if EventRegistration exists)
      return NextResponse.json({ message: "Cannot delete event: It has associated registrations or records that prevent deletion." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete event", error: error.message }, { status: 500 });
  }
}
