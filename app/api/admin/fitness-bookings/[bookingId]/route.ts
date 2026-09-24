import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const formatDate = (date: Date | null) =>
  date ? new Date(date).toISOString().split("T")[0] : "N/A";
const formatTime = (date: Date | null) =>
  date
    ? new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "N/A";

// --- PUT Handler Logic (Update Booking) ---
const putBookingLogic = async (request: Request, context: any) => {
  const params = await context.params;
  const bookingId = params?.bookingId;

  if (!bookingId) {
    return formatResponse(false, null, "Booking ID is required.", 400);
  }

  const existingBooking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, companyId: true },
  });

  if (!existingBooking) {
    return formatResponse(false, null, "Booking not found.", 404);
  }

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

  const start = startTime ? new Date(startTime) : undefined;
  const end = endTime ? new Date(endTime) : undefined;

  if (start && end && start >= end) {
    return formatResponse(false, null, "Start time must be before end time.", 400);
  }

  const targetStatus = status || "PENDING";

  // Prevent trainer conflicts on update
  if (educatorId && start && end && ["PENDING", "CONFIRMED"].includes(targetStatus)) {
    const trainerConflict = await prisma.booking.findFirst({
      where: {
        id: { not: bookingId },
        educatorId,
        status: { in: ["CONFIRMED", "PENDING"] },
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });

    if (trainerConflict) {
      return formatResponse(
        false,
        null,
        "Trainer already has an overlapping booking during this scheduled time slot.",
        409
      );
    }
  }

  // Prevent client conflicts on update
  if (clientId && start && end && ["PENDING", "CONFIRMED"].includes(targetStatus)) {
    const clientConflict = await prisma.booking.findFirst({
      where: {
        id: { not: bookingId },
        clientId,
        status: { in: ["CONFIRMED", "PENDING"] },
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });

    if (clientConflict) {
      return formatResponse(
        false,
        null,
        "Client already has an overlapping booking during this scheduled time slot.",
        409
      );
    }
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(bookingType && { bookingType }),
      ...(start && { startTime: start }),
      ...(end && { endTime: end }),
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(clientId && { clientId }),
      ...(educatorId !== undefined && { educatorId: educatorId || null }),
      ...(locationId !== undefined && { locationId: locationId || null }),
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

  const formattedUpdatedBooking = {
    id: updatedBooking.id,
    title: updatedBooking.title,
    description: updatedBooking.description || "",
    bookingType: updatedBooking.bookingType,
    startTime: updatedBooking.startTime?.toISOString(),
    endTime: updatedBooking.endTime?.toISOString(),
    date: formatDate(updatedBooking.startTime),
    time: `${formatTime(updatedBooking.startTime)} - ${formatTime(updatedBooking.endTime)}`,
    status: updatedBooking.status,
    clientName: updatedBooking.client?.user?.name || "Unknown Client",
    clientId: updatedBooking.clientId,
    educatorName: updatedBooking.educator?.user?.name || "N/A",
    educatorId: updatedBooking.educatorId || null,
    locationName: updatedBooking.location?.name || "N/A",
    locationId: updatedBooking.locationId || null,
    notes: updatedBooking.notes || "",
  };

  try {
    await cacheDel(`tenant:${existingBooking.companyId}:fitness-bookings:*`);
    await cacheDel(`admin:fitness-bookings:*`);
  } catch (e) {}

  return formatResponse(true, formattedUpdatedBooking, "Booking updated successfully", 200);
};

export const PUT = withApiHandler(putBookingLogic);

// --- DELETE Handler Logic (Delete Booking) ---
const deleteBookingLogic = async (request: Request, context: any) => {
  const params = await context.params;
  const bookingId = params?.bookingId;

  if (!bookingId) {
    return formatResponse(false, null, "Booking ID is required.", 400);
  }

  const bookingToDelete = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, companyId: true },
  });

  if (!bookingToDelete) {
    return formatResponse(false, null, "Booking not found.", 404);
  }

  await prisma.booking.delete({
    where: { id: bookingId },
  });

  try {
    await cacheDel(`tenant:${bookingToDelete.companyId}:fitness-bookings:*`);
    await cacheDel(`admin:fitness-bookings:*`);
  } catch (e) {}

  return formatResponse(true, null, "Booking deleted successfully.", 200);
};

export const DELETE = withApiHandler(deleteBookingLogic);
