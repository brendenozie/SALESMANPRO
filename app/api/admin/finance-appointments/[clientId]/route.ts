

import { PrismaClient } from '@prisma/client';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { verifyAuth } from '@/lib/verifyAuth';

const prisma = new PrismaClient();

interface Context {
  params: { id: string };
}

// =======================================================================
// GET /api/appointments/[id]
// Fetches a single appointment by ID
// =======================================================================
async function handleGetAppointment(request: Request, context: Context) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = context.params;

  const appointment = await prisma.financeAppointment.findUnique({
    where: { id: String(id) },
    include: { client: { include: { user: true } }, expert: true },
  });

  if (!appointment) {
    return formatResponse(false, null, 'Appointment not found', 404);
  }

  return formatResponse(true, appointment, null, 200);
}

// =======================================================================
// PUT /api/appointments/[id]
// Updates an existing appointment by ID
// =======================================================================
async function handlePutAppointment(request: Request, context: Context) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = context.params;
  const { date, notes, status } = await request.json();

  const updatedAppointment = await prisma.financeAppointment.update({
    where: { id: String(id) },
    data: {
      date: date ? new Date(date) : undefined,
      notes,
      status,
    },
  });

  return formatResponse(true, updatedAppointment, null, 200);
}

// =======================================================================
// DELETE /api/appointments/[id]
// Deletes an appointment by ID
// =======================================================================
async function handleDeleteAppointment(request: Request, context: Context) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = context.params;

  // Note: The original code deleted from `prisma.appointment` but included
  // `financeAppointment` in other parts. Assuming `financeAppointment` is correct.
  // If the model is wrong, this will throw an error and be caught by the handler.
  await prisma.financeAppointment.delete({
    where: { id: String(id) },
  });

  // Successful deletion returns a 204 No Content response
  return formatResponse(true, null, 'Appointment deleted successfully', 204);
}

// Export the handlers wrapped in withApiHandler
export const GET = withApiHandler(handleGetAppointment);
export const PUT = withApiHandler(handlePutAppointment);
export const DELETE = withApiHandler(handleDeleteAppointment);
