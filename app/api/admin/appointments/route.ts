import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { Prisma } from "@prisma/client";

// Deterministic ISO parsing to ensure format stability across any server hosting locale
function formatAppointmentData(appointment: any) {
  const dateObj = new Date(appointment.date);
  const pad = (n: number) => n.toString().padStart(2, "0");

  // Format Time cleanly to hh:mm AM/PM without system locale side-effects
  let hours = dateObj.getUTCHours();
  const minutes = pad(dateObj.getUTCMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  return {
    id: appointment.id,
    patientName: appointment.user?.name ?? "N/A",
    doctorId: appointment.doctorId,
    doctorName: appointment.doctor?.User?.name ?? "N/A",
    date:
      dateObj.getUTCFullYear() +
      "-" +
      pad(dateObj.getUTCMonth() + 1) +
      "-" +
      pad(dateObj.getUTCDate()),
    time: `${pad(hours)}:${minutes} ${ampm}`,
    status: appointment.status,
    service: appointment.service ?? "N/A",
    createdAt: appointment.createdAt
      ? new Date(appointment.createdAt).toISOString().split("T")[0]
      : "N/A",
  };
}

const baseSelect = {
  id: true,
  doctorId: true,
  date: true,
  status: true,
  service: true,
  createdAt: true,
  user: { select: { name: true, email: true } },
  doctor: { select: { User: { select: { name: true } } } },
};

export const GET = withApiHandler(async (request, context) => {
  const { user } = context;
  if (!user) return formatResponse(false, null, "Unauthorized access", 401);

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm");
  const filterStatus = searchParams.get("filterStatus");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.max(
    1,
    Math.min(100, Number(searchParams.get("limit") || 20)),
  );
  const skip = (page - 1) * limit;

  if (!companyId)
    return formatResponse(false, null, "Company identifier is required", 400);

  // Generate an explicit cache key for exact parameters
  const cacheKey = `admin:appointments:${companyId}:list:${user.role}:${user.id}:${searchTerm || "none"}:${filterStatus || "all"}:${page}:${limit}`;

  try {
    const cachedData = await cacheGet<any>(cacheKey);
    if (cachedData) {
      const response = formatResponse(
        true,
        cachedData,
        "Appointments index parsed from cache",
        200,
      );
      response.headers.set(
        "Cache-Control",
        "s-maxage=60, stale-while-revalidate=30",
      );
      return response;
    }
  } catch (e) {}

  const where: any = { companyId };

  if (user.role !== "ADMIN") {
    where.doctorId = user.id;
  }

  if (filterStatus && filterStatus !== "All") {
    where.status = filterStatus;
  }

  if (searchTerm) {
    where.OR = [
      { user: { name: { contains: searchTerm, mode: "insensitive" } } },
      {
        doctor: {
          User: { name: { contains: searchTerm, mode: "insensitive" } },
        },
      },
      { service: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  try {
    const [appointments, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        where,
        select: baseSelect,
        orderBy: { date: "asc" },
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    const formatted = appointments.map(formatAppointmentData);
    const responseData = {
      data: formatted,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    };

    try {
      await cacheSet(cacheKey, responseData, 60);
    } catch (e) {}

    const response = formatResponse(
      true,
      responseData,
      "Appointments fetched successfully",
      200,
    );
    response.headers.set(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=30",
    );
    return response;
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Internal database retrieval failure",
      500,
    );
  }
});

export const POST = withApiHandler(async (request, context) => {
  const { user } = context;
  if (!user)
    return formatResponse(false, null, "Unauthorized access token", 401);

  try {
    const body = await request.json();
    const { userId, doctorId, service, date, time, status, companyId } = body;

    if (!userId || !doctorId || !date || !time || !status || !companyId) {
      return formatResponse(false, null, "Required fields are missing", 400);
    }

    if (user.role !== "ADMIN" && doctorId !== user.id) {
      return formatResponse(
        false,
        null,
        "Privilege violation: Cannot bind scheduling profiles to another actor",
        403,
      );
    }

    // Explicit UTC date compilation string
    const appointmentDateTime = new Date(`${date}T${time}:00.000Z`);
    if (isNaN(appointmentDateTime.getTime())) {
      return formatResponse(
        false,
        null,
        "Invalid date timestamp parameters",
        400,
      );
    }

    const created = await prisma.appointment.create({
      data: {
        userId,
        doctorId,
        service,
        date: appointmentDateTime,
        status,
        companyId,
      },
      select: baseSelect,
    });

    try {
      await cacheDel(`admin:appointments:${companyId}:all`);
    } catch (e) {}

    return formatResponse(
      true,
      formatAppointmentData(created),
      "Appointment recorded successfully",
      201,
    );
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002")
        return formatResponse(
          false,
          null,
          "Time-slot booking resource conflict",
          409,
        );
      if (error.code === "P2003")
        return formatResponse(
          false,
          null,
          "Relation integrity tracking match failed",
          400,
        );
    }
    return formatResponse(
      false,
      null,
      "Execution write transaction failure",
      500,
    );
  }
});
