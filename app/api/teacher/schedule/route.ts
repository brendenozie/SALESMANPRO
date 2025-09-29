// app/api/teacher/schedule/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const GET = withApiHandler(async (request: Request) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const educatorUserId = searchParams.get("educatorId");

  if (!educatorUserId) {
    return formatResponse(false, null, "Missing educatorId", 400);
  }

  try {
    // 1. Fetch Educator details
    const educator = await prisma.educator.findUnique({
      where: { userId: educatorUserId },
      select: {
        id: true,
        companyId: true,
        user: { select: { name: true, email: true, role: true } },
      },
    });

    if (!educator || !educator.user) {
      return formatResponse(false, null, "Educator not found", 404);
    }

    // 2. Fetch ClassSchedule entries assigned to this educator
    const classSchedules = await prisma.classSchedule.findMany({
      where: { educatorId: educator.id },
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
              select: { academicLevel: { select: { name: true } } },
            },
          },
        },
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
      title: `${schedule.course?.title || "N/A Course"} (${schedule.course?.academicLevels[0]?.academicLevel?.name || "N/A Grade"})`,
      topic: schedule.topic,
      meetingLink: schedule.meetingLink,
      type: "class",
    }));

    // 3. Fetch Events for this educator
    const events = await prisma.event.findMany({
      where: {
        companyId: educator.companyId,
        OR: [
          { organizerId: educator.id },
          { targetEducatorIds: { has: educator.id } },
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
      orderBy: { startDateTime: "asc" },
    });

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      summary: event.summary,
      date: event.startDateTime.toISOString().split("T")[0],
      startTime: event.startDateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      endTime: event.endDateTime?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) || "",
      location: event.location,
      onlineMeetingLink: event.onlineMeetingLink,
      type: event.eventType,
    }));

    return formatResponse(true, {
      educator: {
        id: educator.id,
        name: educator.user.name || educator.user.email,
        role: educator.user.role,
      },
      schedule: formattedSchedules,
      events: formattedEvents,
    });
  } catch (error: any) {
    console.error("Error fetching teacher schedule:", error);
    return formatResponse(false, null, error.message || "Failed to fetch teacher schedule", 500);
  }
});
