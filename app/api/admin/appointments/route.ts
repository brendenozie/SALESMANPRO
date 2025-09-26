import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Shared formatter
async function formatAppointmentData(appointment: any) {
  const patientName = appointment.user?.name || "N/A";
  const doctorName = appointment.doctor?.User?.name || "N/A";
  const dateObj = new Date(appointment.date);

  const formattedDate = dateObj.toISOString().split("T")[0];
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return {
    id: appointment.id,
    patientName,
    doctorId: appointment.doctorId,
    doctorName,
    date: formattedDate,
    time: formattedTime,
    status: appointment.status,
    service: appointment.service || "N/A",
    createdAt: appointment.createdAt
      ? new Date(appointment.createdAt).toLocaleDateString()
      : "N/A",
  };
}

// --- GET /api/admin/appointments
export const GET = withApiHandler(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus"); // 'Scheduled', 'Completed', 'Cancelled', 'All'

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  const whereClause: any = { companyId };

  // Doctors can only see their own appointments
  if (user?.role !== "ADMIN") {
    whereClause.doctorId = user.id;
  }

  if (filterStatus && filterStatus !== "All") {
    whereClause.status = filterStatus;
  }

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: {
      user: { select: { name: true, email: true } },
      doctor: { include: { User: { select: { name: true } } } },
    },
    orderBy: { date: "asc" },
  });

  // Client-side search filter
  const filtered = searchTerm
    ? appointments.filter(
        (appt) =>
          appt.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appt.doctor?.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appt.service?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : appointments;

  const enrichedAppointments = await Promise.all(
    filtered.map(async (appt) => formatAppointmentData(appt))
  );

  return NextResponse.json(enrichedAppointments, { status: 200 });
});

// --- POST /api/admin/appointments
export const POST = withApiHandler(async (request, { user }) => {
  const body = await request.json();
  const { userId, doctorId, service, date, time, status, companyId } = body;

  if (!userId || !doctorId || !date || !time || !status || !companyId) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: userId, doctorId, date, time, status, companyId",
      },
      { status: 400 }
    );
  }

  // Doctors can only create their own appointments
  if (user?.role !== "ADMIN" && doctorId !== user.id) {
    return NextResponse.json(
      { error: "You cannot create appointments for another doctor" },
      { status: 403 }
    );
  }

  // Combine date and time into one Date object
  const dateTimeString = `${date}T${time}:00`;
  const appointmentDateTime = new Date(dateTimeString);

  const newAppointment = await prisma.appointment.create({
    data: {
      user: { connect: { id: userId } },
      doctorId,
      service,
      date: appointmentDateTime,
      status,
      company: { connect: { id: companyId } },
    },
    include: {
      user: { select: { name: true, email: true } },
      doctor: { include: { User: { select: { name: true } } } },
    },
  });

  const formattedNewAppointment = await formatAppointmentData(newAppointment);
  return NextResponse.json(formattedNewAppointment, { status: 201 });
});
