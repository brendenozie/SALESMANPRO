

import { PrismaClient } from '@prisma/client';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { verifyAuth } from '@/lib/verifyAuth';

const prisma = new PrismaClient();

// =======================================================================
// GET /api/appointments
// Fetches all appointments for a specific companyId.
// =======================================================================
async function handleGetAppointments(request: Request) {
  // Authentication is handled by withApiHandler, but we check success here
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return formatResponse(false, null, 'companyId search parameter is required.', 400);
  }

  const appointments = await prisma.financeAppointment.findMany({
    where: { companyId: companyId },
    include: {
      client: {
        include: { user: { select: { name: true, email: true } } }
      },
      expert: {
        include: { user: { select: { name: true } } }
      }
    },
    orderBy: {
      date: 'asc'
    }
  });

  // Note: The original code wrapped the appointments array in an object {appointments}.
  // We'll follow the formatResponse convention of returning the data directly.
  return formatResponse(true, appointments, null, 200);
}

// =======================================================================
// POST /api/appointments
// Creates a new appointment.
// =======================================================================
async function handlePostAppointment(request: Request) {
  // Authentication is handled by withApiHandler, but we check success here
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const body = await request.json();
  const { clientId, expertId, date, notes, companyId } = body;

  // Basic validation
  if (!clientId || !expertId || !date || !companyId) {
    return formatResponse(false, null, 'Missing required fields: clientId, expertId, date, companyId.', 400);
  }

  const newAppointment = await prisma.financeAppointment.create({
    data: {
      clientId,
      expertId,
      date: new Date(date),
      notes,
      companyId
    },
  });

  return formatResponse(true, newAppointment, null, 201);
}

// Export the refactored handlers wrapped in withApiHandler
export const GET = withApiHandler(handleGetAppointments);
export const POST = withApiHandler(handlePostAppointment);
