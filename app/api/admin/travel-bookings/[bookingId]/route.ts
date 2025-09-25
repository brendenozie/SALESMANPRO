// app/api/admin/[adminSlug]/travel-bookings/[bookingId]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// Helper function to format dates for frontend display (duplicate for self-containment)
const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : 'N/A';

// PUT /api/admin/[adminSlug]/travel-bookings/[bookingId]
// Updates an existing travel booking.
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
      startDate,
      endDate,
      totalPrice,
      status,
      clientId,
      tourPackageId,
      destinationId,
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

    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json({ message: 'Start date cannot be after end date.' }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        title: title,
        description: description || null,
        bookingType: bookingType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice: parseFloat(totalPrice),
        status: status,
        notes: notes || null,
        clientId: clientId, // Ensure client is updated
        tourPackageId: tourPackageId || null, // Ensure tour package is updated (or disconnected if null)
        destinationId: destinationId || null, // Ensure destination is updated (or disconnected if null)
      },
      include: {
        client: {
          select: { user: { select: { name: true, email: true } } },
        },
        tourPackage: {
          select: { name: true },
        },
        destination: {
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

    return NextResponse.json(formattedUpdatedBooking);
  } catch (error) {
    console.error(`Error updating travel booking ${bookingId}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'Booking not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update travel booking', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/[adminSlug]/travel-bookings/[bookingId]
// Deletes a specific travel booking.
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
    console.error(`Error deleting travel booking ${bookingId}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Booking not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete travel booking', error: error.message }, { status: 500 });
  }
}
