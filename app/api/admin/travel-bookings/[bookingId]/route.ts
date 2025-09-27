// app/api/admin/[adminSlug]/travel-bookings/[bookingId]/route.ts
import prisma from '@/server/db/prismadb';
import { NextResponse } from 'next/server';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// Helper function to format dates
const formatDate = (date?: Date | string) =>
  date ? new Date(date).toISOString().split('T')[0] : 'N/A';

// PUT /api/admin/[adminSlug]/travel-bookings/[bookingId]
async function handlePUT(request: Request, { params }: { params: { adminSlug: string; bookingId: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { adminSlug, bookingId } = params;

  try {
    const body = await request.json();
    const {
      title,
      description,
      bookingType,
      startDate,
      endDate,
      totalPrice,
      status,
      clientId,
      tourPackageId,
      destinationId,
      notes,
    } = body;

    const company = await prisma.company.findUnique({ where: { slug: adminSlug }, select: { id: true } });
    if (!company) return formatResponse(false, null, 'Company not found', 404);

    const existingBooking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { companyId: true } });
    if (!existingBooking || existingBooking.companyId !== company.id)
      return formatResponse(false, null, 'Booking not found or does not belong to this company', 404);

    if (new Date(startDate) > new Date(endDate))
      return formatResponse(false, null, 'Start date cannot be after end date', 400);

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        title,
        description: description || null,
        bookingType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice: parseFloat(totalPrice),
        status,
        notes: notes || null,
        clientId,
        tourPackageId: tourPackageId || null,
        destinationId: destinationId || null,
      },
      include: {
        client: { select: { user: { select: { name: true; email: true } } } },
        tourPackage: { select: { name: true } },
        destination: { select: { name: true } },
      },
    });

    const formatted = {
      id: updatedBooking.id,
      title: updatedBooking.title,
      description: updatedBooking.description || '',
      bookingType: updatedBooking.bookingType,
      startDate: formatDate(updatedBooking.startDate),
      endDate: formatDate(updatedBooking.endDate),
      totalPrice: updatedBooking.totalPrice,
      status: updatedBooking.status,
      notes: updatedBooking.notes || '',
      clientId: updatedBooking.clientId,
      customerName: updatedBooking.client.user?.name || 'Unknown Client',
      customerEmail: updatedBooking.client.user?.email || 'N/A',
      tourPackageId: updatedBooking.tourPackageId || null,
      tourPackageName: updatedBooking.tourPackage?.name || 'N/A',
      destinationId: updatedBooking.destinationId || null,
      destinationName: updatedBooking.destination?.name || 'N/A',
    };

    return formatResponse(true, formatted);
  } catch (error: any) {
    console.error(`Error updating travel booking ${bookingId}:`, error);
    if (error.code === 'P2025') return formatResponse(false, null, 'Booking not found', 404);
    return formatResponse(false, null, error.message || 'Failed to update travel booking', 500);
  }
}

// DELETE /api/admin/[adminSlug]/travel-bookings/[bookingId]
async function handleDELETE(request: Request, { params }: { params: { adminSlug: string; bookingId: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { adminSlug, bookingId } = params;

  try {
    const company = await prisma.company.findUnique({ where: { slug: adminSlug }, select: { id: true } });
    if (!company) return formatResponse(false, null, 'Company not found', 404);

    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { companyId: true } });
    if (!booking || booking.companyId !== company.id)
      return formatResponse(false, null, 'Booking not found or does not belong to this company', 404);

    await prisma.booking.delete({ where: { id: bookingId } });

    return formatResponse(true, { message: 'Booking deleted successfully.' });
  } catch (error: any) {
    console.error(`Error deleting travel booking ${bookingId}:`, error);
    if (error.code === 'P2025') return formatResponse(false, null, 'Booking not found', 404);
    return formatResponse(false, null, error.message || 'Failed to delete travel booking', 500);
  }
}

// Export with handlers wrapped
export const PUT = withApiHandler(handlePUT);
export const DELETE = withApiHandler(handleDELETE);
