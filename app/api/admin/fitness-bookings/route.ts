// app/api/admin/[adminSlug]/bookings/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// Helper function to format dates and times for frontend
const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : 'N/A';
const formatTime = (date) => date ? new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

// GET /api/admin/[adminSlug]/bookings
// Fetches all bookings for a specific company.
export async function GET(request: Request) {
  
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');


  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        companyId: companyId,
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
      orderBy: {
        startTime: 'desc',
      },
    });

    // Map Prisma Booking model to a frontend-friendly interface
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      title: booking.title,
      description: booking.description || '',
      bookingType: booking.bookingType,
      startTime: booking.startTime.toISOString(), // Keep ISO string for date/time inputs
      endTime: booking.endTime.toISOString(),     // Keep ISO string for date/time inputs
      date: formatDate(booking.startTime), // Formatted date for display
      time: `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`, // Formatted time range for display
      status: booking.status,
      clientName: booking.client.user?.name || 'Unknown Client',
      clientId: booking.clientId,
      educatorName: booking.educator?.user?.name || 'N/A',
      educatorId: booking.educatorId || null,
      locationName: booking.location?.name || 'N/A',
      locationId: booking.locationId || null,
      notes: booking.notes || '',
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ message: 'Failed to fetch bookings', error: error.message }, { status: 500 });
  }
}

// POST /api/admin/[adminSlug]/bookings
// Creates a new booking.
export async function POST(request: Request) {

  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

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
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    // const companyId = company.id;

    // Basic validation
    if (!title || !bookingType || !startTime || !endTime || !clientId) {
      return NextResponse.json({ message: 'Title, booking type, start time, end time, and client are required.' }, { status: 400 });
    }
    if (new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json({ message: 'Start time must be before end time.' }, { status: 400 });
    }

    const newBooking = await prisma.booking.create({
      data: {
        title: title,
        description: description || null,
        bookingType: bookingType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: status || 'PENDING',
        notes: notes || null,
        company: { connect: { id: companyId } },
        client: { connect: { id: clientId } },
        ...(educatorId && { educator: { connect: { id: educatorId } } }),
        ...(locationId && { location: { connect: { id: locationId } } }),
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

    // Format the new booking data for frontend display
    const formattedNewBooking = {
      id: newBooking.id,
      title: newBooking.title,
      description: newBooking.description || '',
      bookingType: newBooking.bookingType,
      startTime: newBooking.startTime.toISOString(),
      endTime: newBooking.endTime.toISOString(),
      date: formatDate(newBooking.startTime),
      time: `${formatTime(newBooking.startTime)} - ${formatTime(newBooking.endTime)}`,
      status: newBooking.status,
      clientName: newBooking.client.user?.name || 'Unknown Client',
      clientId: newBooking.clientId,
      educatorName: newBooking.educator?.user?.name || 'N/A',
      educatorId: newBooking.educatorId || null,
      locationName: newBooking.location?.name || 'N/A',
      locationId: newBooking.locationId || null,
      notes: newBooking.notes || '',
    };

    return NextResponse.json(formattedNewBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ message: 'Failed to create booking', error: "error.message" }, { status: 500 });
  }
}
