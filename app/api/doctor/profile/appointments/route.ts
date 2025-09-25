// app/api/doctor/appointments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const status = searchParams.get("status"); // 'PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED', 'All'

  if (!doctorId) {
    return NextResponse.json({ error: "Missing doctorId" }, { status: 400 });
  }

  try {
    const whereClause: any = {
      doctorId: doctorId,
    };

    if (startDateParam) {
      whereClause.date = { ...whereClause.date, gte: new Date(startDateParam) };
    }
    if (endDateParam) {
      whereClause.date = { ...whereClause.date, lte: new Date(endDateParam) };
    }
    if (status && status !== 'All') {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, phone: true } }, // Patient details
        doctor: { include: { User: { select: { name: true } } } }, // Doctor's name (for consistency)
      },
      orderBy: { date: 'desc' },
    });

    const formattedAppointments = appointments.map(appt => ({
      id: appt.id,
      patientName: appt.user?.name || 'N/A',
      patientEmail: appt.user?.email || 'N/A',
      patientPhone: appt.user?.phone || 'N/A',
      doctorName: appt.doctor?.User?.name || 'N/A',
      service: appt.service || 'N/A',
      date: appt.date ? new Date(appt.date).toISOString().split('T')[0] : 'N/A',
      timeSlot: "appt.timeSlot || 'N/A'",
      status: appt.status,
      notes: "appt.notes || 'N/A'",
      createdAt: appt.createdAt ? new Date(appt.createdAt).toLocaleDateString() : 'N/A',
    }));

    return NextResponse.json(formattedAppointments);
  } catch (err: any) {
    console.error("GET /api/doctor/appointments error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
