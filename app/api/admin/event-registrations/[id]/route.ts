import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth } from "@/lib/verifyAuth"; // Keep verifyAuth
import { withApiHandler } from "@/lib/hooks/withApiHandler"; // New import
import { formatResponse } from "@/lib/formatResponse"; // New import

// Define valid Enum values (must match your Prisma enums)
const VALID_REGISTRATION_STATUSES = ["REGISTERED", "ATTENDED", "CANCELLED", "WAITLISTED"];

// Define the type for the dynamic segment 'id' from the URL
interface Params {
  params: { id: string };
}

// =======================================================================
// GET /api/event-registrations/[id]
// Fetches a single Event Registration by its ID.
// =======================================================================
async function getRegistration(request: Request, { params }: Params) {
  
  const { id } = params;

  const cacheKey = `admin:event-registrations:${id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const registration = await prisma.eventRegistration.findUnique({
    where: { id },
    include: {
      event: { select: { id: true, title: true, startDateTime: true, endDateTime: true, location: true, companyId: true } },
      user: { select: { id: true, name: true, email: true } },
      student: { select: { id: true, user: { select: { name: true, email: true } } } },
    },
  });

  if (!registration) {
    return formatResponse(false, null, "Event registration not found", 404);
  }

  // Transform response
  const responseData = {
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
  };

  try {
    if (responseData) {
      await cacheSet(cacheKey, { data: responseData }, 60);
    }
  } catch (e) {}
  
  return formatResponse(true, { data: responseData }, null, 200);
}

// =======================================================================
// PATCH /api/event-registrations/[id]
// Updates an existing Event Registration by ID.
// =======================================================================
async function updateRegistration(request: Request, { params }: Params) {
  
  const { id } = params;
  const body = await request.json();
  const { status, studentId, ...rest } = body;

  const cacheKey = `admin:event-registrations:${id || 'global'}:all`;

  const existingRegistration = await prisma.eventRegistration.findUnique({
    where: { id },
  });

  if (!existingRegistration) {
    return formatResponse(false, null, "Event registration not found", 404);
  }

  const updateData: any = {};

  // Update status
  if (status !== undefined) {
    if (!VALID_REGISTRATION_STATUSES.includes(status)) {
      return formatResponse(false, null, `Invalid status: ${status}. Must be one of ${VALID_REGISTRATION_STATUSES.join(', ')}.`, 400);
    }
    updateData.status = status;
  }

  // Update studentId
  if (studentId !== undefined) {
    if (studentId === null) {
      updateData.studentId = null;
    } else {
      const existingStudent = await prisma.student.findUnique({
        where: { id: studentId },
      });
      if (!existingStudent) {
        return formatResponse(false, null, "Provided studentId does not exist.", 400);
      }
      updateData.studentId = studentId;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return formatResponse(false, null, "No fields provided for update.", 400);
  }

  const updatedRegistration = await prisma.eventRegistration.update({
    where: { id },
    data: updateData,
    include: {
      event: { select: { id: true, title: true, startDateTime: true, endDateTime: true, location: true, companyId: true } },
      user: { select: { id: true, name: true, email: true } },
      student: { select: { id: true, user: { select: { name: true, email: true } } } },
    },
  });

  // Transform response
  const responseData = {
    id: updatedRegistration.id,
    eventId: updatedRegistration.eventId,
    eventTitle: updatedRegistration.event?.title || 'N/A',
    eventStartDateTime: updatedRegistration.event?.startDateTime.toISOString() || null,
    eventEndDateTime: updatedRegistration.event?.endDateTime?.toISOString() || null,
    eventLocation: updatedRegistration.event?.location || null,
    eventCompanyId: updatedRegistration.event?.companyId || 'N/A',
    userId: updatedRegistration.userId,
    userName: updatedRegistration.user?.name || 'N/A',
    userEmail: updatedRegistration.user?.email || 'N/A',
    studentId: updatedRegistration.studentId,
    studentName: updatedRegistration.student?.user?.name || null,
    studentEmail: updatedRegistration.student?.user?.email || null,
    registeredAt: updatedRegistration.registeredAt.toISOString(),
    status: updatedRegistration.status,
  };

  
    try { await cacheDel(cacheKey); } catch (e) {}
    return formatResponse(true, { data: responseData }, null, 200);
}

// =======================================================================
// DELETE /api/event-registrations/[id]
// Deletes an Event Registration by ID (effectively cancelling it).
// =======================================================================
async function deleteRegistration(request: Request, { params }: Params) {
  
  const { id } = params;

  const cacheKey = `admin:event-registrations:${id || 'global'}:all`;

  const existingRegistration = await prisma.eventRegistration.findUnique({
    where: { id },
  });

  if (!existingRegistration) {
    return formatResponse(false, null, "Event registration not found", 404);
  }

  const deletedRegistration = await prisma.eventRegistration.delete({
    where: { id },
  });

  
    try { await cacheDel(cacheKey); } catch (e) {}
    return formatResponse(true, { message: "Event registration deleted successfully", deletedId: deletedRegistration.id }, null, 200);
}

// Export the handlers wrapped in the `withApiHandler` utility.
export const GET = withApiHandler(getRegistration);
export const PATCH = withApiHandler(updateRegistration);
export const DELETE = withApiHandler(deleteRegistration);
