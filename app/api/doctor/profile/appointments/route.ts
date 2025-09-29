import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

/**
 * Handler to fetch a list of appointments for a specific doctor,
 * with optional filtering by date range and status.
 */
async function getDoctorAppointments(request: Request) {
  // 1. Authentication Check
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  // 2. Extract and Validate Parameters
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const status = searchParams.get("status"); // 'PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED', 'All'

  if (!doctorId) {
    return formatResponse(false, null, "Missing required query parameter: doctorId.", 400);
  }

  try {
    const whereClause: any = {
      doctorId,
    };

    // Build Date Range Filter
    if (startDateParam || endDateParam) {
      whereClause.date = {};
      if (startDateParam) {
        whereClause.date.gte = new Date(startDateParam);
      }
      if (endDateParam) {
        const endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999);
        whereClause.date.lte = endDate;
      }
    }

    // Status Filter
    if (status && status !== "All") {
      whereClause.status = status;
    }

    // 3. Fetch Appointments
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        doctor: { include: { User: { select: { name: true } } } },
      },
      orderBy: { date: "desc" },
    });

    // 4. Format the Data
    const formattedAppointments = appointments.map((appt) => ({
      id: appt.id,
      patientName: appt.user?.name || "N/A",
      patientEmail: appt.user?.email || "N/A",
      patientPhone: appt.user?.phone || "N/A",
      doctorName: appt.doctor?.User?.name || "N/A",
      service: appt.service || "N/A",
      date: appt.date ? new Date(appt.date).toISOString().split("T")[0] : "N/A",
      timeSlot: appt.timeSlot || "N/A",
      status: appt.status,
      notes: appt.notes || "N/A",
      createdAt: appt.createdAt
        ? new Date(appt.createdAt).toLocaleDateString()
        : "N/A",
    }));

    return formatResponse(
      true,
      formattedAppointments,
      "Doctor appointments fetched successfully.",
      200
    );
  } catch (err: any) {
    console.error("GET /api/doctor/appointments error:", err);
    return formatResponse(
      false,
      null,
      err.message || "Internal server error.",
      500
    );
  }
}

// Export wrapped handler
export const GET = withApiHandler(getDoctorAppointments);
