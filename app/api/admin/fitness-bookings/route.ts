import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";

import prisma from '@/server/db/prismadb';
// Incorporate the new utilities
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse'; 

// Type definition for the context object, which includes dynamic parameters
type RouteContext = {
    params: {
        adminSlug: string; // The dynamic part of the URL: /admin/[adminSlug]
    };
};

// Helper function to format dates and times for frontend (Duplicated for self-containment)
const formatDate = (date: Date | null) => date ? new Date(date).toISOString().split('T')[0] : 'N/A';
const formatTime = (date: Date | null) => date ? new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

// --- GET Handler Logic (Fetch All Bookings for a Company) ---
const getBookingsLogic = async (req: Request, context: RouteContext) => {
    // Note: The original code used companyId from the query string, which we will maintain.
      
    const { searchParams } = new URL(req.url);
    
    const companyId = searchParams.get('companyId');
    // const adminSlug = context.params.adminSlug; // available if needed

    if (!companyId) {
        return formatResponse(false, null, 'companyId query parameter is required.', 400);
    }

    // 1. Verify Company
    
    const cacheKey = buildTenantCacheKey(companyId, "fitness-bookings", {});

  try {

    const cached = await cacheGet(cacheKey);

    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);  } catch (e) {}

    const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true },
        });

    if (!company) {
        return formatResponse(false, null, 'Company not found.', 404);
    }

    // 2. Fetch Bookings
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

    // 3. Map Prisma Booking model to a frontend-friendly interface
    const formattedBookings = bookings.map(booking => ({
        id: booking.id,
        title: booking.title,
        description: booking.description || '',
        bookingType: booking.bookingType,
        startTime: booking.startTime?.toISOString(),
        endTime: booking.endTime?.toISOString(),
        date: formatDate(booking.startTime),
        time: `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`,
        status: booking.status,
        clientName: booking.client.user?.name || 'Unknown Client',
        clientId: booking.clientId,
        educatorName: booking.educator?.user?.name || 'N/A',
        educatorId: booking.educatorId || null,
        locationName: booking.location?.name || 'N/A',
        locationId: booking.locationId || null,
        notes: booking.notes || '',
    }));

    // Use formatResponse for success
    try { await cacheSet(cacheKey, formattedBookings, 60); } catch (e) {}

    return formatResponse(true, formattedBookings, 'Bookings retrieved successfully', 200);
};

// Export the wrapped GET function
export const GET = withApiHandler(getBookingsLogic);


// --- POST Handler Logic (Create New Booking) ---
const postBookingLogic = async (req: Request, context: RouteContext) => {
    const body = await req.json();
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
        companyId // Passed in the body in the original code, but often derived from auth/slug
    } = body;
    
    if (!companyId) {
        // Fallback check, though company check below covers this if companyId is missing in body
        return formatResponse(false, null, 'companyId is required in the body.', 400);
    }

    // 1. Verify Company
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
    });

    if (!company) {
        return formatResponse(false, null, 'Company not found.', 404);
    }

    // 2. Basic validation
    if (!title || !bookingType || !startTime || !endTime || !clientId) {
        return formatResponse(false, null, 'Title, booking type, start time, end time, and client are required.', 400);
    }
    if (new Date(startTime) >= new Date(endTime)) {
        return formatResponse(false, null, 'Start time must be before end time.', 400);
    }

    // 3. Create the Booking
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

    // 4. Format the new booking data for frontend display
    const formattedNewBooking = {
        id: newBooking.id,
        title: newBooking.title,
        description: newBooking.description || '',
        bookingType: newBooking.bookingType,
        startTime: newBooking.startTime?.toISOString(),
        endTime: newBooking.endTime?.toISOString(),
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

    // Use formatResponse for success
    
    try {
      await cacheDel(`tenant:${companyId}:fitness-bookings:*`);
      await cacheDel(`admin:fitness-bookings:*`);
    } catch (e) {}
    
    return formatResponse(true, formattedNewBooking, 'Booking created successfully', 201);
};

// Export the wrapped POST function
export const POST = withApiHandler(postBookingLogic);
