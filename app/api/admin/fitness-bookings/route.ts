import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { resolveCompany } from "@/server/services/fitnessService";

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

// --- GET Handler (Fetch All Bookings for a Company) ---
const getBookingsLogic = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const companyIdentifier = searchParams.get("companyId") || searchParams.get("slug");

  if (!companyIdentifier) {
    return formatResponse(false, null, "companyId or slug query parameter is required.", 400);
  }

  const company = await resolveCompany(companyIdentifier);
  if (!company) {
    return formatResponse(false, null, "Company not found.", 404);
  }

  const cacheKey = buildTenantCacheKey(company.id, "fitness-bookings", {});
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const bookings = await prisma.booking.findMany({
    where: {
      companyId: company.id,
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
      startTime: "desc",
    },
  });

  const formattedBookings = bookings.map((booking) => ({
    id: booking.id,
    title: booking.title,
    description: booking.description || "",
    bookingType: booking.bookingType,
    startTime: booking.startTime?.toISOString(),
    endTime: booking.endTime?.toISOString(),
    date: formatDate(booking.startTime),
    time: `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`,
    status: booking.status,
    clientName: booking.client?.user?.name || "Unknown Client",
    clientId: booking.clientId,
    educatorName: booking.educator?.user?.name || "N/A",
    educatorId: booking.educatorId || null,
    locationName: booking.location?.name || "N/A",
    locationId: booking.locationId || null,
    notes: booking.notes || "",
  }));

  try {
    await cacheSet(cacheKey, formattedBookings, 60);
  } catch (e) {}

  return formatResponse(true, formattedBookings, "Bookings retrieved successfully", 200);
};

export const GET = withApiHandler(getBookingsLogic);

// --- POST Handler (Create New Booking with Conflict Prevention) ---
const postBookingLogic = async (req: Request) => {
  const body = await req.json();
  const { searchParams } = new URL(req.url);
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
    companyId,
  } = body;

  const companyIdentifier = companyId || searchParams.get("companyId") || searchParams.get("slug");
  if (!companyIdentifier) {
    return formatResponse(false, null, "companyId is required.", 400);
  }

  const company = await resolveCompany(companyIdentifier);
  if (!company) {
    return formatResponse(false, null, "Company not found.", 404);
  }

  if (!title || !bookingType || !startTime || !endTime || !clientId) {
    return formatResponse(
      false,
      null,
      "Title, booking type, start time, end time, and client are required.",
      400
    );
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return formatResponse(false, null, "Start time must be before end time.", 400);
  }

  const activeStatus = status || "PENDING";

  // Prevent Trainer double-booking conflict
  if (educatorId && ["PENDING", "CONFIRMED"].includes(activeStatus)) {
    const trainerConflict = await prisma.booking.findFirst({
      where: {
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

  // Prevent Client double-booking conflict
  if (clientId && ["PENDING", "CONFIRMED"].includes(activeStatus)) {
    const clientConflict = await prisma.booking.findFirst({
      where: {
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

  const newBooking = await prisma.booking.create({
    data: {
      title,
      description: description || null,
      bookingType,
      startTime: start,
      endTime: end,
      status: activeStatus,
      notes: notes || null,
      company: { connect: { id: company.id } },
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

  const formattedNewBooking = {
    id: newBooking.id,
    title: newBooking.title,
    description: newBooking.description || "",
    bookingType: newBooking.bookingType,
    startTime: newBooking.startTime?.toISOString(),
    endTime: newBooking.endTime?.toISOString(),
    date: formatDate(newBooking.startTime),
    time: `${formatTime(newBooking.startTime)} - ${formatTime(newBooking.endTime)}`,
    status: newBooking.status,
    clientName: newBooking.client?.user?.name || "Unknown Client",
    clientId: newBooking.clientId,
    educatorName: newBooking.educator?.user?.name || "N/A",
    educatorId: newBooking.educatorId || null,
    locationName: newBooking.location?.name || "N/A",
    locationId: newBooking.locationId || null,
    notes: newBooking.notes || "",
  };

  try {
    await cacheDel(`tenant:${company.id}:fitness-bookings:*`);
    await cacheDel(`admin:fitness-bookings:*`);
  } catch (e) {}

  return formatResponse(true, formattedNewBooking, "Booking created successfully", 201);
};

export const POST = withApiHandler(postBookingLogic);
