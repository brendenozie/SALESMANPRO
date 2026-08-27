import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

function formatAppointmentData(appointment: any) {
  const dateObj = new Date(appointment.date);
  const pad = (n: number) => n.toString().padStart(2, "0");

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
  companyId: true,
  user: { select: { name: true, email: true } },
  doctor: { select: { User: { select: { name: true } } } },
};

export const GET = withApiHandler(async (request, context) => {
  
  const { user } = context;

  if (!user)
    return formatResponse(false, null, "Unauthorized access parameters", 401);

  const resolvedParams = await context.params;
  const { id } = resolvedParams;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId)
    return formatResponse(
      false,
      null,
      "Company target boundary is required",
      400,
    );

  const cacheKey = `admin:appointments:${companyId}:item:${id}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached)
      return formatResponse(
        true,
        cached,
        "Fetched single appointment from cache",
        200,
      );
  } catch (e) {}

  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        companyId,
        ...(user.role !== "ADMIN" ? { doctorId: user.id } : {}),
      },
      select: baseSelect,
    });

    if (!appointment)
      return formatResponse(
        false,
        null,
        "Target booking profile record missing",
        404,
      );

    const formatted = formatAppointmentData(appointment);
    try {
      await cacheSet(cacheKey, formatted, 60);
    } catch (e) {}

    return formatResponse(
      true,
      formatted,
      "Appointment retrieved successfully",
      200,
    );
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Data layer querying execution fault",
      500,
    );
  }
});

export const PUT = withApiHandler(async (request, context) => {
  
  const { user } = context;
  if (!user)
    return formatResponse(false, null, "Unauthorized access parameters", 401);

  const resolvedParams = await context.params;
  const { id } = resolvedParams;

  try {
    const body = await request.json();
    const { userId, doctorId, service, date, time, status, companyId } = body;

    if (!companyId)
      return formatResponse(
        false,
        null,
        "Company context tracker value required",
        400,
      );

    // Secure Verification Step: Confirm ownership within matching business boundary bounds
    const existing = await prisma.appointment.findFirst({
      where: {
        id,
        companyId,
        ...(user.role !== "ADMIN" ? { doctorId: user.id } : {}),
      },
      select: { date: true },
    });

    if (!existing)
      return formatResponse(
        false,
        null,
        "Appointment entry missing or access out of bounds",
        404,
      );

    const updateData: any = {};
    if (service !== undefined) updateData.service = service;
    if (status !== undefined) updateData.status = status;
    if (userId) updateData.userId = userId;
    if (doctorId && user.role === "ADMIN") updateData.doctorId = doctorId;

    if (date || time) {
      const baseDate = new Date(existing.date);
      const targetDateStr = date ?? baseDate.toISOString().split("T")[0];
      const targetTimeStr =
        time ?? baseDate.toISOString().split("T")[1].slice(0, 5);
      updateData.date = new Date(`${targetDateStr}T${targetTimeStr}:00.000Z`);
    }

    // Scoped update mutation to block cross-tenant parameter injections
    const updated = await prisma.appointment.update({
      where: { id, companyId },
      data: updateData,
      select: baseSelect,
    });

    try {
      await cacheDel(`admin:appointments:${companyId}:all`);
      await cacheDel(`admin:appointments:${companyId}:item:${id}`);
    } catch (e) {}

    return formatResponse(
      true,
      formatAppointmentData(updated),
      "Appointment profile updated safely",
      200,
    );
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Failed to apply resource update modifications",
      500,
    );
  }
});

export const DELETE = withApiHandler(async (request, context) => {
  const { user } = context;
  if (!user)
    return formatResponse(false, null, "Unauthorized access parameters", 401);

  const resolvedParams = await context.params;
  const { id } = resolvedParams;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId)
    return formatResponse(
      false,
      null,
      "Company identifier tracking reference required",
      400,
    );

  try {
    const deletedResult = await prisma.appointment.deleteMany({
      where: {
        id,
        companyId,
        ...(user.role !== "ADMIN" ? { doctorId: user.id } : {}),
      },
    });

    if (!deletedResult.count) {
      return formatResponse(
        false,
        null,
        "Appointment record missing or delete execution blocked",
        404,
      );
    }

    try {
      await cacheDel(`admin:appointments:${companyId}:all`);
      await cacheDel(`admin:appointments:${companyId}:item:${id}`);
    } catch (e) {}

    return formatResponse(
      true,
      { deletedId: id },
      "Appointment profile purged successfully",
      200,
    );
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Failed to completely purge target item resource entry",
      500,
    );
  }
});
