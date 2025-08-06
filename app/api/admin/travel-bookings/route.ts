// app/api/admin/[adminSlug]/travel-bookings/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path

// Helper function to format dates for frontend display
const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : 'N/A';

// GET /api/admin/[adminSlug]/travel-bookings
// Fetches all travel bookings for a specific company.
export async function GET(request: Request, { params }) {
  const { adminSlug } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        companyId: company.id,
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
      orderBy: {
        startDate: 'desc',
      },
    });

    // Map Prisma Booking model to a frontend-friendly interface
    const formattedBookings = bookings.map(booking => ({
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

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching travel bookings:', error);
    return NextResponse.json({ message: 'Failed to fetch travel bookings', error: error.message }, { status: 500 });
  }
}

// POST /api/admin/[adminSlug]/travel-bookings
// Creates a new travel booking.
export async function POST(request, { params }) {
  const { adminSlug } = params;

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
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const companyId = company.id;

    // Basic validation
    if (!title || !bookingType || !startDate || !endDate || !totalPrice || !clientId) {
      return NextResponse.json({ message: 'Title, booking type, start date, end date, total price, and client are required.' }, { status: 400 });
    }
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json({ message: 'Start date cannot be after end date.' }, { status: 400 });
    }

    const newBooking = await prisma.booking.create({
      data: {
        title: title,
        description: description || null,
        bookingType: bookingType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice: parseFloat(totalPrice), // Ensure price is a float
        status: status || 'PENDING',
        notes: notes || null,
        company: { connect: { id: companyId } },
        client: { connect: { id: clientId } },
        ...(tourPackageId && { tourPackage: { connect: { id: tourPackageId } } }),
        ...(destinationId && { destination: { connect: { id: destinationId } } }),
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

    // Format the new booking data for frontend display
    const formattedNewBooking = {
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

    return NextResponse.json(formattedNewBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating travel booking:', error);
    return NextResponse.json({ message: 'Failed to create travel booking', error: error.message }, { status: 500 });
  }
}
