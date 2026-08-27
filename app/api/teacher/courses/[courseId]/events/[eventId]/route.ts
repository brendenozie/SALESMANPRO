// app/api/teacher/events/[eventId]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const DELETE = withApiHandler(async (request: Request, { params }: { params: { eventId: string } }) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { eventId } = params;
  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get('educatorId');
  const companyId = searchParams.get('companyId');

  if (!eventId || !educatorId || !companyId) return formatResponse(false, null, 'Missing eventId, educatorId, or companyId', 400);

  try {
    const eventToDelete = await prisma.event.findUnique({ where: { id: eventId }, select: { companyId: true, organizerId: true } });

    if (!eventToDelete || eventToDelete.companyId !== companyId || eventToDelete.organizerId !== educatorId) {
      return formatResponse(false, null, 'Event not found or unauthorized', 404);
    }

    await prisma.event.delete({ where: { id: eventId } });
    return formatResponse(true, null, 'Event deleted successfully');
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return formatResponse(false, null, error.message || 'Failed to delete event', 500);
  }
});
