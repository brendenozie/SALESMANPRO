// app/api/teacher/schedule/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId'); // The educator whose schedule is being viewed
  const companyId = searchParams.get('companyId');   // For multi-tenancy

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorId'.
  // 3. Ensure the 'educatorId' is authorized to view their schedule for this 'companyId'.
  // const session = await auth();
  // if (!session || session.user.id !== educatorId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!educatorId) {
    return NextResponse.json({ message: 'Missing educatorId or companyId' }, { status: 400 });
  }

  try {
    // 1. Fetch Educator details
    const educator = await prisma.educator.findUnique({
      where: { userId: educatorId,},
      select: {
        id: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        // department: {
        //   select: {
        //     name: true,
        //   },
        // },
      },
    });

    if (!educator || !educator.user) {
      return NextResponse.json({ message: 'Educator not found or not associated with this company' }, { status: 404 });
    }

    // 2. Fetch ClassSchedule entries where this educator is the instructor
    const classSchedules = await prisma.classSchedule.findMany({
      where: {
        // companyId: companyId,
        course: {
          instructorId: educator.id, // Assuming Course links to Educator via instructorId
        },
      },
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        topic: true,
        meetingLink: true,
        course: {
          select: {
            id: true,
            title: true,
            academicLevels: {
              select: {
                academicLevel: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    const formattedSchedules = classSchedules.map(schedule => ({
      id: schedule.id,
      day: schedule.dayOfWeek,
      startTime: schedule.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: schedule.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      title: `${schedule.course?.title || 'N/A Course'} (${schedule.course?.academicLevels[0]?.academicLevel?.name || 'N/A Grade'})`,
      topic: schedule.topic,
      meetingLink: schedule.meetingLink,
      type: 'class', // Custom type for frontend display
    }));

    // 3. Fetch Event entries where this educator is the organizer or a target
    const events = await prisma.event.findMany({
      where: {
        // companyId: companyId,
        // OR: [
          // {
             organizerId: educatorId ,
            // }, // Events organized by this educator
          // { 
            targetEducatorIds: { has: educatorId } 
          // }, // Events explicitly targeting this educator
        // ],
      },
      select: {
        id: true,
        title: true,
        summary: true,
        startDateTime: true,
        endDateTime: true,
        location: true,
        onlineMeetingLink: true,
        eventType: true,
      },
      orderBy: { startDateTime: 'asc' },
    });

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      summary: event.summary,
      date: event.startDateTime.toISOString().split('T')[0], // YYYY-MM-DD
      startTime: event.startDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: event.endDateTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) || '',
      location: event.location,
      onlineMeetingLink: event.onlineMeetingLink,
      type: event.eventType, // Use eventType as type for frontend display
    }));

    return NextResponse.json({
      educator: {
        id: educator.id,
        name: educator.user.name || educator.user.email,
        role:  'Educator', // educator.department?.name || Using department name as role for display
      },
      schedule: formattedSchedules,
      events: formattedEvents,
    });

  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    return NextResponse.json({ message: 'Failed to fetch teacher schedule' }, { status: 500 });
  }
}
