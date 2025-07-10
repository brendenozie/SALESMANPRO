// app/api/teacher/schedule/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // educatorId is expected to be the User.id associated with the Educator profile
  const educatorUserId = searchParams.get('educatorId'); 
  const companyId = searchParams.get('companyId');   // For multi-tenancy

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorUserId'.
  // 3. Ensure the 'educatorUserId' is authorized to view their schedule for this 'companyId'.
  // const session = await auth();
  // if (!session || session.user.id !== educatorUserId || session.user.role !== 'EDUCATOR') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  // Ensure both educatorUserId and companyId are provided for proper filtering
  if (!educatorUserId || !companyId) {
    return NextResponse.json({ message: 'Missing educatorId or companyId' }, { status: 400 });
  }

  try {
    // 1. Fetch Educator details using userId to get their actual Educator._id and role
    const educator = await prisma.educator.findUnique({
      where: { userId: educatorUserId },
      select: {
        id: true, // This is the Educator's _id, which will be used for relations
        user: {
          select: {
            name: true,
            email: true,            
            role: true, // Fetch the role from the Educator model
          },
        },
      },
    });

    if (!educator || !educator.user) {
      return NextResponse.json({ message: 'Educator not found' }, { status: 404 });
    }

    // 2. Fetch ClassSchedule entries assigned to this educator
    const classSchedules = await prisma.classSchedule.findMany({
      where: {
        companyId: companyId, // Filter by company for multi-tenancy
        educatorId: educator.id, // Directly filter by the Educator's _id
      },
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        topic: true,
        meetingLink: true,
        course: { // Include course details
          select: {
            id: true,
            title: true, // Use 'title' as per Course model
            academicLevels: { // Access academic levels via CourseAcademicLevel
              select: {
                academicLevel: { // Select actual AcademicLevel details
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' }, // Order by day of week
        { startTime: 'asc' }, // Then by start time
      ],
    });

    const formattedSchedules = classSchedules.map(schedule => ({
      id: schedule.id,
      day: schedule.dayOfWeek,
      // Format time, ensure consistent timezone handling if this is for display
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
        companyId: companyId, // Filter by company for multi-tenancy
        OR: [
          { organizerId: educator.id }, // Events organized by this educator's _id
          { targetEducatorIds: { has: educator.id } }, // Events explicitly targeting this educator's _id
        ],
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
        role: educator.user.role, // Use the actual role from Educator model
      },
      schedule: formattedSchedules,
      events: formattedEvents,
    });

  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    return NextResponse.json({ message: 'Failed to fetch teacher schedule' }, { status: 500 });
  }
}