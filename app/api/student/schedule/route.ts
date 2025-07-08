// app/api/student/schedule/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as per your project structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId'); // The student whose schedule is being viewed
  const companyId = searchParams.get('companyId');   // For multi-tenancy

  // --- Authentication & Authorization (Placeholder) ---
  // In a real application, you would:
  // 1. Get the authenticated user's session.
  // 2. Resolve the student's ID from the session (e.g., session.user.studentId).
  // 3. Verify the student is authorized to view their schedule for this company.
  // const session = await auth();
  // if (!session || session.user.studentId !== studentId || session.user.role !== 'STUDENT') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // ----------------------------------------------------

  if (!studentId || !companyId) {
    return NextResponse.json({ message: 'Missing studentId or companyId' }, { status: 400 });
  }

  try {
    // 1. Fetch Student details
    const student = await prisma.student.findUnique({
      where: { id: studentId, companyId: companyId },
      select: {
        id: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        academicLevel: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student || !student.user) {
      return NextResponse.json({ message: 'Student not found or not associated with this company' }, { status: 404 });
    }

    // 2. Fetch ClassSchedule entries for courses the student is enrolled in
    const enrolledCourseIds = (await prisma.courseEnrollment.findMany({
      where: {
        studentId: studentId,
        status: 'ENROLLED',
      },
      select: {
        courseId: true,
      },
    })).map(e => e.courseId);

    const classSchedules = await prisma.classSchedule.findMany({
      where: {
        companyId: companyId,
        courseId: {
          in: enrolledCourseIds, // Filter by courses the student is enrolled in
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
            instructor: {
              select: {
                user: {
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
      title: `${schedule.course?.title || 'N/A Course'} (Teacher: ${schedule.course?.instructor?.user?.name || 'N/A'})`,
      topic: schedule.topic,
      meetingLink: schedule.meetingLink,
      type: 'class', // Custom type for frontend display
    }));

    // 3. Fetch Event entries where this student is a target
    const events = await prisma.event.findMany({
      where: {
        companyId: companyId,
        targetStudentIds: { has: studentId }, // Events explicitly targeting this student
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
      student: {
        id: student.id,
        name: student.user.name || student.user.email,
        gradeLevel: student.academicLevel?.name || 'N/A',
      },
      schedule: formattedSchedules,
      events: formattedEvents,
    });

  } catch (error) {
    console.error('Error fetching student schedule:', error);
    return NextResponse.json({ message: 'Failed to fetch student schedule' }, { status: 500 });
  }
}
