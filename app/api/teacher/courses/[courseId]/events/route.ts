// app/api/teacher/courses/[courseId]/events/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId'); // The educator viewing/managing events
  const companyId = searchParams.get('companyId');   // For multi-tenancy

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorId'.
  // 3. Ensure the 'educatorId' is authorized to manage events for this 'courseId' and 'companyId'.
  // const session = await auth();
  // if (!session || session.user.id !== educatorId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!courseId || !educatorId) {
    return NextResponse.json({ message: 'Missing courseId, educatorId, or companyId' }, { status: 400 });
  }

  try {
    // 1. Fetch Course details
    const course = await prisma.course.findUnique({
      where: { id: courseId},
      select: {
        id: true,
        title: true,
        academicLevels: {
          select: {
            academicLevel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found or not associated with this company' }, { status: 404 });
    }

    // Determine the primary academic level for the course for display
    const academicLevel = course.academicLevels.length > 0
      ? course.academicLevels[0].academicLevel
      : { id: 'N/A', name: 'No Academic Level' };

    // 2. Fetch Event entries targeted to this course
    const events = await prisma.event.findMany({
      where: {
        targetCourseIds: {
          has: courseId, // Filter events where targetCourseIds array contains the specific courseId
        },
      },
      select: {
        id: true,
        title: true,
        summary: true,
        description: true,
        startDateTime: true,
        endDateTime: true,
        location: true,
        onlineMeetingLink: true,
        imageUrl: true,
        videoUrl: true,
        eventType: true,
        eventStatus: true,
        isRegistrationRequired: true,
        maxCapacity: true,
        isPaid: true,
        price: true,
        contactPerson: true,
        contactEmail: true,
        contactPhone: true,
        // organizer: {
        //   select: {
        //     // user: {
        //     //   select: { name: true },
        //     // },
        //   },
        // },
        // Include target audience fields if needed for display/editing
        audience: true,
        targetAcademicLevelIds: true,
        targetCourseIds: true,
        targetEducatorIds: true,
        targetStudentIds: true,
        targetDepartmentIds: true,
        targetParentIds: true,
      },
      orderBy: { startDateTime: 'asc' },
    });

    const formattedEvents = events.map(event => ({
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
      isRegistrationRequired: event.isRegistrationRequired,
      maxCapacity: event.maxCapacity,
      isPaid: event.isPaid,
      price: event.price,
      contactPerson: event.contactPerson,
      contactEmail: event.contactEmail,
      contactPhone: event.contactPhone,
      organizerName: 'N/A',//event.organizer?.user?.name || 
      audience: event.audience,
      targetAcademicLevelIds: event.targetAcademicLevelIds,
      targetCourseIds: event.targetCourseIds,
      targetEducatorIds: event.targetEducatorIds,
      targetStudentIds: event.targetStudentIds,
      targetDepartmentIds: event.targetDepartmentIds,
      targetParentIds: event.targetParentIds,
    }));

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        academicLevelId: academicLevel.id,
        academicLevelName: academicLevel.name,
      },
      events: formattedEvents,
    });

  } catch (error) {
    console.error('Error fetching course events:', error);
    return NextResponse.json({ message: 'Failed to fetch course events' }, { status: 500 });
  }
}



// app/api/teacher/events/route.ts
// import { NextResponse } from 'next/server';
// import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

// Define enums for validation
enum EventType {
  GENERAL = 'GENERAL', ACADEMIC = 'ACADEMIC', SPORTS = 'SPORTS', CULTURAL = 'CULTURAL',
  MEETING = 'MEETING', WORKSHOP = 'WORKSHOP', ORIENTATION = 'ORIENTATION',
  FUNDRAISER = 'FUNDRAISER', OTHER = 'OTHER'
}

enum EventStatus {
  SCHEDULED = 'SCHEDULED', POSTPONED = 'POSTPONED', CANCELLED = 'CANCELLED', COMPLETED = 'COMPLETED'
}

enum EventAudience {
  ALL = 'ALL', ACADEMIC_LEVEL = 'ACADEMIC_LEVEL', COURSE = 'COURSE', EDUCATOR = 'EDUCATOR',
  STUDENT = 'STUDENT', DEPARTMENT = 'DEPARTMENT', STAFF = 'STAFF', PARENT = 'PARENT'
}

export async function POST(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const {
    id, // Optional, for updating existing event
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
    isRegistrationRequired,
    maxCapacity,
    isPaid,
    price,
    contactPerson,
    contactEmail,
    contactPhone,
    organizerId, // The educator creating/editing the event
    companyId,
    targetAcademicLevelIds,
    targetCourseIds,
    targetEducatorIds,
    targetStudentIds,
    targetDepartmentIds,
    targetParentIds,
    courseIdFromRoute, // The course ID from the URL, to ensure it's in targetCourseIds
  } = await request.json();

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'organizerId'.
  // 3. Ensure the 'organizerId' is authorized to manage events for this company.
  // const session = await auth();
  // if (!session || session.user.id !== organizerId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!title || !startDateTime || !eventType || !eventStatus || !organizerId || !companyId || !courseIdFromRoute) {
    return NextResponse.json({ message: 'Missing required event data: title, startDateTime, eventType, eventStatus, organizerId, companyId, courseIdFromRoute' }, { status: 400 });
  }

  // Validate enums
  if (!(Object.values(EventType) as string[]).includes(eventType)) {
    return NextResponse.json({ message: `Invalid eventType. Must be one of: ${Object.values(EventType).join(', ')}` }, { status: 400 });
  }
  if (!(Object.values(EventStatus) as string[]).includes(eventStatus)) {
    return NextResponse.json({ message: `Invalid eventStatus. Must be one of: ${Object.values(EventStatus).join(', ')}` }, { status: 400 });
  }

  // Parse DateTimes
  const parsedStartDateTime = new Date(startDateTime);
  if (isNaN(parsedStartDateTime.getTime())) {
    return NextResponse.json({ message: 'Invalid startDateTime format' }, { status: 400 });
  }
  const parsedEndDateTime = endDateTime ? new Date(endDateTime) : null;
  if (parsedEndDateTime && isNaN(parsedEndDateTime.getTime())) {
    return NextResponse.json({ message: 'Invalid endDateTime format' }, { status: 400 });
  }

  // Ensure the current courseId is always included in targetCourseIds
  const finalTargetCourseIds = Array.from(new Set([...(targetCourseIds || []), courseIdFromRoute]));

  try {
    const eventData = {
      title: title,
      summary: summary,
      description: description,
      startDateTime: parsedStartDateTime,
      endDateTime: parsedEndDateTime,
      location: location,
      onlineMeetingLink: onlineMeetingLink,
      imageUrl: imageUrl,
      videoUrl: videoUrl,
      eventType: eventType as EventType,
      eventStatus: eventStatus as EventStatus,
      isRegistrationRequired: isRegistrationRequired || false,
      maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
      isPaid: isPaid || false,
      price: isPaid ? (parseFloat(price) || 0) : null,
      contactPerson: contactPerson,
      contactEmail: contactEmail,
      contactPhone: contactPhone,
      organizerId: organizerId,
      companyId: companyId,
      audience: EventAudience.COURSE, // Since this page manages course-specific events
      targetAcademicLevelIds: targetAcademicLevelIds || [],
      targetCourseIds: finalTargetCourseIds,
      targetEducatorIds: targetEducatorIds || [],
      targetStudentIds: targetStudentIds || [],
      targetDepartmentIds: targetDepartmentIds || [],
      targetParentIds: targetParentIds || [],
    };

    let event;
    if (id) {
      // Update existing event
      event = await prisma.event.update({
        where: { id: id },
        data: {
          ...eventData,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new event
      event = await prisma.event.create({
        data: eventData,
      });
    }

    // Return the created/updated event, formatted similarly to GET for consistency
    const formattedEvent = {
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
      isRegistrationRequired: event.isRegistrationRequired,
      maxCapacity: event.maxCapacity,
      isPaid: event.isPaid,
      price: event.price,
      contactPerson: event.contactPerson,
      contactEmail: event.contactEmail,
      contactPhone: event.contactPhone,
      organizerName: (await prisma.user.findUnique({ where: { id: event.organizerId }, select: { name: true } }))?.name || 'N/A', // Fetch organizer name for response
      audience: event.audience,
      targetAcademicLevelIds: event.targetAcademicLevelIds,
      targetCourseIds: event.targetCourseIds,
      targetEducatorIds: event.targetEducatorIds,
      targetStudentIds: event.targetStudentIds,
      targetDepartmentIds: event.targetDepartmentIds,
      targetParentIds: event.targetParentIds,
    };

    return NextResponse.json(formattedEvent, { status: id ? 200 : 201 });
  } catch (error: any) {
    console.error('Error saving event:', error);
    return NextResponse.json({ message: 'Failed to save event', error: error.message }, { status: 500 });
  }
}

// app/api/teacher/events/[eventId]/route.ts
// import { NextResponse } from 'next/server';
// import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function DELETE(request: Request, { params }: { params: { eventId: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { eventId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId'); // The educator performing the deletion
  const companyId = searchParams.get('companyId');   // For multi-tenancy

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorId'.
  // 3. Ensure the 'educatorId' is authorized to delete this event (e.g., they created it or are an admin).
  // const session = await auth();
  // if (!session || session.user.id !== educatorId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!eventId || !educatorId || !companyId) {
    return NextResponse.json({ message: 'Missing eventId, educatorId, or companyId' }, { status: 400 });
  }

  try {
    // Optional: Verify the event belongs to the correct company and was created by this educator
    const eventToDelete = await prisma.event.findUnique({
      where: { id: eventId },
      select: { companyId: true, organizerId: true },
    });

    if (!eventToDelete || eventToDelete.companyId !== companyId || eventToDelete.organizerId !== educatorId) {
      return NextResponse.json({ message: 'Event not found or unauthorized to delete' }, { status: 404 });
    }

    // Delete the event.
    // Note: Prisma's default behavior for onDelete: Cascade might handle related EventRegistration.
    // Review your schema's `onDelete` actions for `EventRegistration` model.
    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ message: 'Failed to delete event' }, { status: 500 });
  }
}
