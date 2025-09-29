// app/api/teacher/courses/[courseId]/events/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const GET = withApiHandler(async (request: Request, { params }: { params: { courseId: string } }) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId');
  const companyId = searchParams.get('companyId');

  if (!courseId || !educatorId) {
    return formatResponse(false, null, 'Missing courseId, educatorId, or companyId', 400);
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        academicLevels: { select: { academicLevel: { select: { id: true, name: true } } } },
      },
    });

    if (!course) return formatResponse(false, null, 'Course not found', 404);

    const academicLevel = course.academicLevels.length > 0
      ? course.academicLevels[0].academicLevel
      : { id: 'N/A', name: 'No Academic Level' };

    const events = await prisma.event.findMany({
      where: { targetCourseIds: { has: courseId } },
      orderBy: { startDateTime: 'asc' },
    });

    const formattedEvents = events.map(event => ({
      ...event,
      startDateTime: event.startDateTime.toISOString(),
      endDateTime: event.endDateTime?.toISOString() || null,
    }));

    return formatResponse(true, { course: { id: course.id, title: course.title, academicLevelId: academicLevel.id, academicLevelName: academicLevel.name }, events });
  } catch (error: any) {
    console.error('Error fetching course events:', error);
    return formatResponse(false, null, error.message || 'Failed to fetch events', 500);
  }
});

export const POST = withApiHandler(async (request: Request) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const body = await request.json();
  const { id, title, startDateTime, endDateTime, eventType, eventStatus, organizerId, companyId, courseIdFromRoute } = body;

  if (!title || !startDateTime || !eventType || !eventStatus || !organizerId || !companyId || !courseIdFromRoute) {
    return formatResponse(false, null, 'Missing required event data', 400);
  }

  try {
    const parsedStart = new Date(startDateTime);
    const parsedEnd = endDateTime ? new Date(endDateTime) : null;

    const finalTargetCourseIds = Array.from(new Set([...(body.targetCourseIds || []), courseIdFromRoute]));

    const eventData = { ...body, startDateTime: parsedStart, endDateTime: parsedEnd, targetCourseIds: finalTargetCourseIds };

    let event;
    if (id) {
      event = await prisma.event.update({ where: { id }, data: { ...eventData, updatedAt: new Date() } });
    } else {
      event = await prisma.event.create({ data: eventData });
    }

    return formatResponse(true, { ...event, startDateTime: event.startDateTime.toISOString(), endDateTime: event.endDateTime?.toISOString() || null });
  } catch (error: any) {
    console.error('Error saving event:', error);
    return formatResponse(false, null, error.message || 'Failed to save event', 500);
  }
});
