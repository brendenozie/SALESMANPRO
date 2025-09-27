// app/api/admin/[adminSlug]/travel-bookings/route.ts
import prisma from '@/server/db/prismadb';
import { NextResponse } from 'next/server';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// Helper function to format dates
const formatDate = (date?: Date | string) =>
  date ? new Date(date).toISOString().split('T')[0] : 'N/A';

// GET /api/admin/[adminSlug]/travel-bookings
async function handleGET(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  if (!companyId) return formatResponse(false, null, 'Company ID is required', 400);

  try {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
    if (!company) return formatResponse(false, null, 'Company not found', 404);

    const bookings = await prisma.booking.findMany({
      where: { companyId: company.id },
      include: {
        client: { select: { user: { select: { name: true; email: true } } } },
        tourPackage: { select: { name: true } },
        destination: { select: { name: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    const formatted = bookings.map((booking) => ({
      id: booking.id,
      title: booking.title,
      description: booking.description || '',
      bookingType: booking.bookingType,
      startDate: formatDate(booking.startDate),
      endDate: formatDate(booking.endDate),
      totalPrice: booking.totalPrice,
      status: booking.status,
      notes: booking.notes || '',
      clientId: booking.clientId,
      customerName: booking.client.user?.name || 'Unknown Client',
      customerEmail: booking.client.user?.email || 'N/A',
      tourPackageId: booking.tourPackageId || null,
      tourPackageName: booking.tourPackage?.name || 'N/A',
      destinationId: booking.destinationId || null,
      destinationName: booking.destination?.name || 'N/A',
    }));

    return formatResponse(true, formatted);
  } catch (error: any) {
    console.error('Error fetching travel bookings:', error);
    return formatResponse(false, null, error.message || 'Failed to fetch travel bookings', 500);
  }
}

// POST /api/admin/[adminSlug]/travel-bookings
async function handlePOST(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  if (!companyId) return formatResponse(false, null, 'Company ID is required', 400);

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

    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
    if (!company) return formatResponse(false, null, 'Company not found', 404);

    // Basic validation
    if (!title || !bookingType || !startDate || !endDate || !totalPrice || !clientId)
      return formatResponse(false, null, 'Title, booking type, start date, end date, total price, and client are required', 400);

    if (new Date(startDate) > new Date(endDate))
      return formatResponse(false, null, 'Start date cannot be after end date', 400);

    const newBooking = await prisma.booking.create({
      data: {
        title,
        description: description || null,
        bookingType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice: parseFloat(totalPrice),
        status: status || 'PENDING',
        notes: notes || null,
        company: { connect: { id: companyId } },
        client: { connect: { id: clientId } },
        ...(tourPackageId && { tourPackage: { connect: { id: tourPackageId } } }),
        ...(destinationId && { destination: { connect: { id: destinationId } } }),
      },
      include: {
        client: { select: { user: { select: { name: true; email: true } } } },
        tourPackage: { select: { name: true } },
        destination: { select: { name: true } },
      },
    });

    const formatted = {
      id: newBooking.id,
      title: newBooking.title,
      description: newBooking.description || '',
      bookingType: newBooking.bookingType,
      startDate: formatDate(newBooking.startDate),
      endDate: formatDate(newBooking.endDate),
      totalPrice: newBooking.totalPrice,
      status: newBooking.status,
      notes: newBooking.notes || '',
      clientId: newBooking.clientId,
      customerName: newBooking.client.user?.name || 'Unknown Client',
      customerEmail: newBooking.client.user?.email || 'N/A',
      tourPackageId: newBooking.tourPackageId || null,
      tourPackageName: newBooking.tourPackage?.name || 'N/A',
      destinationId: newBooking.destinationId || null,
      destinationName: newBooking.destination?.name || 'N/A',
    };

    return formatResponse(true, formatted, 'Booking created successfully');
  } catch (error: any) {
    console.error('Error creating travel booking:', error);
    return formatResponse(false, null, error.message || 'Failed to create travel booking', 500);
  }
}

// Export with handlers wrapped
export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
