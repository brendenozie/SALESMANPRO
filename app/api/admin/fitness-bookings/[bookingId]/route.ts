// app/api/admin/[adminSlug]/bookings/[bookingId]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// Helper function to format dates and times for frontend (duplicate for self-containment)
const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : 'N/A';
const formatTime = (date) => date ? new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

// PUT /api/admin/[adminSlug]/bookings/[bookingId]
// Updates an existing booking.
export async function PUT(request, { params }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, bookingId } = params;

  try {
    const body = await request.json();
    const {
      title,
      description,
      bookingType,
      startTime,
      endTime,
      status,
      clientId,
      educatorId,
      locationId,
      notes,
    } = body;

    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { companyId: true },
    });

    if (!existingBooking || existingBooking.companyId !== company.id) {
      return NextResponse.json({ message: 'Booking not found or does not belong to this company.' }, { status: 404 });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json({ message: 'Start time must be before end time.' }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        title: title,
        description: description || null,
        bookingType: bookingType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: status,
        notes: notes || null,
        clientId: clientId, // Ensure client is updated
        educatorId: educatorId || null, // Ensure educator is updated (or disconnected if null)
        locationId: locationId || null, // Ensure location is updated (or disconnected if null)
      },
      include: {
        client: {
          select: { user: { select: { name: true, email: true } } },
        },
        educator: {
          select: { user: { select: { name: true } } },
        },
        location: {
          select: { name: true },
        },
      },
    });

    // Format the updated booking data for frontend display
    const formattedUpdatedBooking = {
      id: updatedBooking.id,
      title: updatedBooking.title,
      description: updatedBooking.description || '',
      bookingType: updatedBooking.bookingType,
      startTime: updatedBooking.startTime.toISOString(),
      endTime: updatedBooking.endTime.toISOString(),
      date: formatDate(updatedBooking.startTime),
      time: `${formatTime(updatedBooking.startTime)} - ${formatTime(updatedBooking.endTime)}`,
      status: updatedBooking.status,
      clientName: updatedBooking.client.user?.name || 'Unknown Client',
      clientId: updatedBooking.clientId,
      educatorName: updatedBooking.educator?.user?.name || 'N/A',
      educatorId: updatedBooking.educatorId || null,
      locationName: updatedBooking.location?.name || 'N/A',
      locationId: updatedBooking.locationId || null,
      notes: updatedBooking.notes || '',
    };

    return NextResponse.json(formattedUpdatedBooking);
  } catch (error) {
    console.error(`Error updating booking ${bookingId}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'Booking not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update booking', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/[adminSlug]/bookings/[bookingId]
// Deletes a specific booking.
export async function DELETE(request, { params }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, bookingId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const bookingToDelete = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { companyId: true },
    });

    if (!bookingToDelete || bookingToDelete.companyId !== company.id) {
      return NextResponse.json({ message: 'Booking not found or does not belong to this company.' }, { status: 404 });
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json({ message: 'Booking deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting booking ${bookingId}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Booking not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete booking', error: error.message }, { status: 500 });
  }
}
