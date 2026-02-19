import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import { PrismaClient } from '@prisma/client';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

import prisma from "@/server/db/prismadb";

interface Context {
  params: { id: string };
}

// =======================================================================
// GET /api/appointments/[id]
// Fetches a single appointment by ID
// =======================================================================
async function handleGetAppointment(request: Request, context: Context) {
  
  const { id } = context.params;

  const cacheKey = `admin:finance-appointments:${id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const appointment = await prisma.financeAppointment.findUnique({
    where: { id: String(id) },
    include: { client: { include: { user: true } }, expert: true },
  });

  try {
    if (appointment) {
      await cacheSet(cacheKey, appointment, 60);
    }
  } catch (e) {}

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
  
  const { id } = context.params;

  const cacheKey = `admin:finance-appointments:${id || 'global'}:all`;

  const { date, notes, status } = await request.json();

  const updatedAppointment = await prisma.financeAppointment.update({
    where: { id: String(id) },
    data: {
      date: date ? new Date(date) : undefined,
      notes,
      status,
    },
  });

  // Clear cache for this specific appointment
  try {
    await cacheDel(cacheKey);
  } catch (e) {}

  return formatResponse(true, updatedAppointment, null, 200);
}

// =======================================================================
// DELETE /api/appointments/[id]
// Deletes an appointment by ID
// =======================================================================
async function handleDeleteAppointment(request: Request, context: Context) {
  
  const { id } = context.params;
  const cacheKey = `admin:finance-appointments:${id || 'global'}:all`;

  // Note: The original code deleted from `prisma.appointment` but included
  // `financeAppointment` in other parts. Assuming `financeAppointment` is correct.
  // If the model is wrong, this will throw an error and be caught by the handler.
  await prisma.financeAppointment.delete({
    where: { id: String(id) },
  });

  // Successful deletion returns a 204 No Content response
  try {
    await cacheDel(cacheKey);
  } catch (e) {}
  return formatResponse(true, null, 'Appointment deleted successfully', 204);
}

// Export the handlers wrapped in withApiHandler
export const GET = withApiHandler(handleGetAppointment);
export const PUT = withApiHandler(handlePutAppointment);
export const DELETE = withApiHandler(handleDeleteAppointment);
