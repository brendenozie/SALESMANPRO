import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Define valid Enum values (must match your Prisma enums)
const VALID_REGISTRATION_STATUSES = ["REGISTERED", "ATTENDED", "CANCELLED", "WAITLISTED"];

// GET /api/event-registrations
// Fetches event registrations, filtered by eventId, userId, studentId, and status.
// Requires at least one filter (eventId or userId) for broad queries, plus implicit company context.
export async function GET(request: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const userId = searchParams.get('userId'); // The user who performed the registration
    const studentId = searchParams.get('studentId'); // The student being registered (if different from userId)
    const status = searchParams.get('status'); // Filter by RegistrationStatus

    const whereClause: any = {};

    // For security and performance, require at least one specific filter or a companyId context
    // Assuming companyId is implicitly handled by the eventId or userId, or passed directly.
    // If you want to fetch ALL registrations for a company, you'd add a companyId filter here.
    // For now, we'll assume eventId or userId is provided.
    if (!eventId && !userId) {
      return NextResponse.json({ message: "Either Event ID or User ID is required to fetch event registrations." }, { status: 400 });
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
      if (!VALID_REGISTRATION_STATUSES.includes(status.toUpperCase())) {
        return NextResponse.json({ message: `Invalid registration status: ${status}. Must be one of ${VALID_REGISTRATION_STATUSES.join(', ')}.` }, { status: 400 });
      }
      whereClause.status = status.toUpperCase();
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: whereClause,
      include: {
        event: { // Include basic event details
          select: {
            id: true,
            title: true,
            startDateTime: true,
            endDateTime: true,
            location: true,
            companyId: true, // Crucial for multi-tenancy context
          },
        },
        user: { // Include details of the user who registered
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: { // Include details of the student being registered (if applicable)
          select: {
            id: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: {
        registeredAt: 'desc', // Order by most recent registration
      },
    });

    // Transform the data to flatten relations and ensure correct types
    const response = registrations.map((registration) => ({
      id: registration.id,
      eventId: registration.eventId,
      eventTitle: registration.event?.title || 'N/A',
      eventStartDateTime: registration.event?.startDateTime.toISOString() || null,
      eventEndDateTime: registration.event?.endDateTime?.toISOString() || null,
      eventLocation: registration.event?.location || null,
      eventCompanyId: registration.event?.companyId || 'N/A', // Ensure company context is available
      userId: registration.userId,
      userName: registration.user?.name || 'N/A',
      userEmail: registration.user?.email || 'N/A',
      studentId: registration.studentId,
      studentName: registration.student?.user?.name || null,
      studentEmail: registration.student?.user?.email || null,
      registeredAt: registration.registeredAt.toISOString(),
      status: registration.status,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching event registrations:", error);
    return NextResponse.json({ message: "Failed to fetch event registrations", error: error.message }, { status: 500 });
  }
}

// POST /api/event-registrations
// Creates a new Event Registration.
export async function POST(request: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const body = await request.json();
    const {
      eventId,
      userId,
      studentId, // Optional: if a parent registers a specific student
      status = "REGISTERED", // Default status
    } = body;

    // Basic validation
    if (!eventId || !userId) {
      return NextResponse.json({ message: "Event ID and User ID are required for registration." }, { status: 400 });
    }

    // Validate Event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    // Validate User exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      return NextResponse.json({ message: "Registering user not found." }, { status: 400 });
    }

    // Validate Student exists if provided
    if (studentId) {
      const existingStudent = await prisma.student.findUnique({
        where: { id: studentId },
      });
      if (!existingStudent) {
        return NextResponse.json({ message: "Target student not found." }, { status: 400 });
      }
      // Optional: Add logic to ensure the student is linked to the registering user (e.g., parent-student relationship)
    }

    // Check for duplicate registration (unique constraint eventId + userId)
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { // This is the unique compound index defined in Prisma schema
          eventId: eventId,
          userId: userId,
        },
      },
    });
    if (existingRegistration) {
      return NextResponse.json({ message: "User is already registered for this event." }, { status: 409 });
    }

    // Validate status enum
    if (!VALID_REGISTRATION_STATUSES.includes(status)) {
      return NextResponse.json({ message: `Invalid status: ${status}. Must be one of ${VALID_REGISTRATION_STATUSES.join(', ')}.` }, { status: 400 });
    }

    const newRegistration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        studentId, // Will be null if not provided
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

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event registration:", error);
    // Handle Prisma unique constraint error specifically if @@unique was not used
    if (error.code === 'P2002') { // Unique constraint violation
        return NextResponse.json({ message: "User is already registered for this event." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create event registration", error: error.message }, { status: 500 });
  }
}
