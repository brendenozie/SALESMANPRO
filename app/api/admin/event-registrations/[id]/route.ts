import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Define valid Enum values (must match your Prisma enums)
const VALID_REGISTRATION_STATUSES = ["REGISTERED", "ATTENDED", "CANCELLED", "WAITLISTED"];

// GET /api/event-registrations/[id]
// Fetches a single Event Registration by its ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const registration = await prisma.eventRegistration.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, title: true, startDateTime: true, endDateTime: true, location: true, companyId: true } },
        user: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, user: { select: { name: true, email: true } } } },
      },
    });

    if (!registration) {
      return NextResponse.json({ message: "Event registration not found" }, { status: 404 });
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

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching event registration with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch event registration", error: error.message }, { status: 500 });
  }
}

// PATCH /api/event-registrations/[id]
// Updates an existing Event Registration by ID.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const body = await request.json();
    const {
      status, // Only status is typically updated via PATCH for registration
      studentId, // Allow updating student if it was initially null or incorrect
      ...rest
    } = body;

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for event registration:", rest);
    }

    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: { id },
    });

    if (!existingRegistration) {
      return NextResponse.json({ message: "Event registration not found" }, { status: 404 });
    }

    const updateData: any = {};

    // Update status
    if (status !== undefined) {
      if (!VALID_REGISTRATION_STATUSES.includes(status)) {
        return NextResponse.json({ message: `Invalid status: ${status}. Must be one of ${VALID_REGISTRATION_STATUSES.join(', ')}.` }, { status: 400 });
      }
      updateData.status = status;
    }

    // Update studentId
    if (studentId !== undefined) {
        if (studentId === null) { // Allow unlinking student
            updateData.studentId = null;
        } else {
            const existingStudent = await prisma.student.findUnique({
                where: { id: studentId },
            });
            if (!existingStudent) {
                return NextResponse.json({ message: "Provided studentId does not exist." }, { status: 400 });
            }
            updateData.studentId = studentId;
        }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No fields provided for update." }, { status: 400 });
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

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating event registration with ID ${id}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: "Event registration not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to update event registration", error: error.message }, { status: 500 });
  }
}

// DELETE /api/event-registrations/[id]
// Deletes an Event Registration by ID (effectively cancelling it).
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: { id },
    });

    if (!existingRegistration) {
      return NextResponse.json({ message: "Event registration not found" }, { status: 404 });
    }

    const deletedRegistration = await prisma.eventRegistration.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Event registration deleted successfully", deletedId: deletedRegistration.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting event registration with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to delete event registration", error: error.message }, { status: 500 });
  }
}
