// app/api/patient/appointments/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet } from "@/lib/cache";

async function getHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId"); // User.id for the patient
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const status = searchParams.get("status"); // 'PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED', 'All'

  if (!patientId) {
    return formatResponse(false, null, "Missing patientId", 400);
  }

  const cacheKey = `patient:appointments:${patientId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    const whereClause: any = {
      userId: patientId,
    };

    if (startDateParam) {
      whereClause.date = { ...whereClause.date, gte: new Date(startDateParam) };
    }
    if (endDateParam) {
      whereClause.date = { ...whereClause.date, lte: new Date(endDateParam) };
    }
    if (status && status !== "All") {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true } },
        doctor: { include: { User: { select: { name: true } } } },
      },
      orderBy: { date: "desc" },
    });

    const formattedAppointments = appointments.map((appt) => ({
      id: appt.id,
      patientName: appt.user?.name || "N/A",
      doctorName: appt.doctor?.User?.name || "N/A",
      service: appt.service || "N/A",
      date: appt.date
        ? new Date(appt.date).toISOString().split("T")[0]
        : "N/A",
      timeSlot: (appt as any).timeSlot || "N/A",
      status: appt.status,
      notes: (appt as any).notes || "N/A",
      createdAt: appt.createdAt
        ? new Date(appt.createdAt).toLocaleDateString()
        : "N/A",
    }));

      try {
        await cacheSet(cacheKey, formattedAppointments, 60);
      } catch (e) {
        console.error("Failed to cache patient appointments data:", e);
      }

    return formatResponse(true, formattedAppointments);
  } catch (err: any) {
    console.error("GET /api/patient/appointments error:", err);
    return formatResponse(
      false,
      null,
      err.message || "Internal server error",
      500
    );
  }
}

export const GET = withApiHandler(getHandler);
