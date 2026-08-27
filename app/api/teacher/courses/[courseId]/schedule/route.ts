// app/api/teacher/courses/[courseId]/schedule/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const GET = withApiHandler(async (request: Request, { params }: { params: { courseId: string } }) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get("educatorId");

  if (!courseId || !educatorId) {
    return formatResponse(false, null, "Missing courseId or educatorId", 400);
  }

  try {
    // Fetch course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        academicLevels: {
          select: { academicLevel: { select: { id: true, name: true } } },
        },
      },
    });

    if (!course) return formatResponse(false, null, "Course not found", 404);

    const academicLevel = course.academicLevels[0]?.academicLevel || { id: "N/A", name: "No Academic Level" };

    // Fetch class schedules
    const classSchedules = await prisma.classSchedule.findMany({
      where: { courseId },
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        topic: true,
        meetingLink: true,
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    const formattedSchedules = classSchedules.map(schedule => ({
      id: schedule.id,
      day: schedule.dayOfWeek,
      startTime: schedule.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      endTime: schedule.endTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      topic: schedule.topic,
      meetingLink: schedule.meetingLink,
    }));

    // Fetch events
    const events = await prisma.event.findMany({
      where: { targetCourseIds: { has: courseId } },
      select: {
        id: true,
        title: true,
        description: true,
        startDateTime: true,
        endDateTime: true,
        location: true,
        onlineMeetingLink: true,
        eventType: true,
      },
      orderBy: { startDateTime: "asc" },
    });

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.startDateTime.toISOString().split("T")[0],
      startTime: event.startDateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      endTime: event.endDateTime?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) || "",
      location: event.location,
      onlineMeetingLink: event.onlineMeetingLink,
      type: event.eventType,
    }));

    return formatResponse(true, {
      course: {
        id: course.id,
        title: course.title,
        academicLevelId: academicLevel.id,
        academicLevelName: academicLevel.name,
      },
      schedule: formattedSchedules,
      events: formattedEvents,
    });
  } catch (error: any) {
    console.error("Error fetching course schedule:", error);
    return formatResponse(false, null, error.message || "Failed to fetch course schedule", 500);
  }
});
