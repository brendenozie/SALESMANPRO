import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";


import prisma from '@/server/db/prismadb'; // Assuming this is your Prisma client instance
// Incorporate the new utilities
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// --- Utility Functions (Kept for formatting) ---

// Helper function to format dates for frontend display (Date -> YYYY-MM-DD)
const formatDate = (date : Date | null) => date ? new Date(date).toISOString().split('T')[0] : 'N/A';
// Helper function to format time for frontend display (Date -> HH:MM AM/PM)
const formatTime = (date: Date | null) => date ? new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

// Helper to access dynamic parameters
// Context is passed automatically in App Router handlers: { params: { adminSlug: string, bookingId: string } }
const getParams = (context: any) => context.params;

// --- PUT Handler Logic (Update Booking) ---
// This function will be wrapped by withApiHandler
const putBookingLogic = async (request: Request, context: any) => {
  const { adminSlug, bookingId } = getParams(context);

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

  // 1. Verify Company Slug
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found.', 404);
  }

  // 2. Verify Booking existence and ownership
  const existingBooking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { companyId: true },
  });

  if (!existingBooking || existingBooking.companyId !== company.id) {
    return formatResponse(false, null, 'Booking not found or does not belong to this company.', 404);
  }

  // 3. Validate Time Constraint
  if (new Date(startTime) >= new Date(endTime)) {
    return formatResponse(false, null, 'Start time must be before end time.', 400);
  }

  // 4. Update the Booking
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
      clientId: clientId,
      educatorId: educatorId || null,
      locationId: locationId || null,
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

  // 5. Format the response data
  const formattedUpdatedBooking = {
    id: updatedBooking.id,
    title: updatedBooking.title,
    description: updatedBooking.description || '',
    bookingType: updatedBooking.bookingType,
    startTime: updatedBooking.startTime?.toISOString(),
    endTime: updatedBooking.endTime?.toISOString(),
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

  // Use formatResponse for success
  
    try {
      await cacheDel(`tenant:${company.id}:fitness-bookings:*`);
      await cacheDel(`admin:fitness-bookings:*`);
    } catch (e) {}
    return formatResponse(true, formattedUpdatedBooking, 'Booking updated successfully', 200);
};

// Export the wrapped PUT function
export const PUT = withApiHandler(putBookingLogic);


// --- DELETE Handler Logic (Delete Booking) ---
// This function will be wrapped by withApiHandler
const deleteBookingLogic = async (request: Request, context: any) => {
  const { adminSlug, bookingId } = getParams(context);

  // 1. Verify Company Slug
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found.', 404);
  }

  // 2. Verify Booking existence and ownership
  const bookingToDelete = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { companyId: true },
  });

  if (!bookingToDelete || bookingToDelete.companyId !== company.id) {
    return formatResponse(false, null, 'Booking not found or does not belong to this company.', 404);
  }

  // 3. Delete the Booking
  await prisma.booking.delete({
    where: { id: bookingId },
  });

  // Use formatResponse for success
  
    try {
      await cacheDel(`tenant:${company.id}:fitness-bookings:*`);
      await cacheDel(`admin:fitness-bookings:*`);
    } catch (e) {}
    return formatResponse(true, null, 'Booking deleted successfully.', 200);
};

// Export the wrapped DELETE function
export const DELETE = withApiHandler(deleteBookingLogic);
