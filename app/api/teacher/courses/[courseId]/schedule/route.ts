// app/api/teacher/courses/[courseId]/schedule/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId'); // The educator viewing the schedule
  // const companyId = searchParams.get('companyId');   // For multi-tenancy

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Verify the user is an 'EDUCATOR' and their ID matches 'educatorId'.
  // 3. Ensure the 'educatorId' is authorized to view the schedule for this 'courseId' and 'companyId'.
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
        description: true,
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

    // 2. Fetch ClassSchedule entries for this course
    const classSchedules = await prisma.classSchedule.findMany({
      where: {
        courseId: courseId,
      },
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true, // Now a DateTime
        endTime: true,   // Now a DateTime
        topic: true,
        meetingLink: true, // Added meetingLink from schema
      },
      orderBy: [
        { dayOfWeek: 'asc' }, // Order by day
        { startTime: 'asc' }, // Then by time
      ],
    });

    const formattedSchedules = classSchedules.map(schedule => ({
      id: schedule.id,
      day: schedule.dayOfWeek,
      // Extract HH:MM from DateTime objects
      startTime: schedule.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: schedule.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      topic: schedule.topic,
      meetingLink: schedule.meetingLink,
      // 'room' field is no longer in ClassSchedule model in the provided schema.
      // If it's intended to be there, please update your Prisma schema.
    }));

    // 3. Fetch Event entries for this course
    const events = await prisma.event.findMany({
      where: {
        // Updated to use targetCourseIds array
        targetCourseIds: {
          has: courseId, // Find events where targetCourseIds array contains the specific courseId
        },
        // companyId: companyId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDateTime: true, // Now a DateTime
        endDateTime: true,   // Now a DateTime
        location: true,
        onlineMeetingLink: true, // Added onlineMeetingLink from schema
        eventType: true,
      },
      orderBy: { startDateTime: 'asc' }, // Order by startDateTime
    });

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      // Extract YYYY-MM-DD from startDateTime
      date: event.startDateTime.toISOString().split('T')[0],
      // Extract HH:MM from startDateTime
      startTime: event.startDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      // Extract HH:MM from endDateTime (handle nullable endDateTime)
      endTime: event.endDateTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) || '',
      location: event.location,
      onlineMeetingLink: event.onlineMeetingLink,
      type: event.eventType,
    }));

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        academicLevelId: academicLevel.id,
        academicLevelName: academicLevel.name,
      },
      schedule: formattedSchedules,
      events: formattedEvents,
    });

  } catch (error) {
    console.error('Error fetching course schedule:', error);
    return NextResponse.json({ message: 'Failed to fetch course schedule' }, { status: 500 });
  }
}
