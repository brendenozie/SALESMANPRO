import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Helper function to format appointment data for the frontend
async function formatAppointmentData(appointment: any) {
  const patientName = appointment.user?.name || "N/A";
  const doctorName = appointment.doctor?.User?.name || "N/A";
  const dateObj = new Date(appointment.date);

  // Format date as YYYY-MM-DD
  const formattedDate = dateObj.toISOString().split("T")[0];

  // Format time as HH:MM AM/PM
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

// --- GET /api/admin/appointments/[id]
export const GET = withApiHandler(async (_request, { params, user }) => {
  const { id } = params;

  const appointment = await prisma.appointment.findFirst({
    where: user?.role === "ADMIN"
      ? { id }
      : { id, doctorId: user.id }, // doctors can only see their own
    include: {
      user: { select: { name: true, email: true } },
      doctor: { include: { User: { select: { name: true } } } },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const formattedAppointment = await formatAppointmentData(appointment);
  return NextResponse.json(formattedAppointment, { status: 200 });
});

// --- PUT /api/admin/appointments/[id]
export const PUT = withApiHandler(async (request, { params, user }) => {
  const { id } = params;
  const body = await request.json();
  const { userId, doctorId, service, date, time, status } = body;

  // Ensure doctor can only update their own appointment
  const existingAppointment = await prisma.appointment.findFirst({
    where: user?.role === "ADMIN"
      ? { id }
      : { id, doctorId: user.id },
  });

  if (!existingAppointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  let updateData: any = { service, status };
  if (userId) updateData.userId = userId;
  if (doctorId && user?.role === "ADMIN") {
    // only admin can reassign doctor
    updateData.doctorId = doctorId;
  }

  // Handle combined date+time updates
  if (date || time) {
    const existingDate = new Date(existingAppointment.date);
    const newDatePart = date || existingDate.toISOString().split("T")[0];
    const newTimePart =
      time ||
      existingDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23", // keep 24-hour format internally
      });

    updateData.date = new Date(`${newDatePart}T${newTimePart}:00`);
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: updateData,
    include: {
      user: { select: { name: true, email: true } },
      doctor: { include: { User: { select: { name: true } } } },
    },
  });

  const formattedUpdatedAppointment = await formatAppointmentData(updatedAppointment);
  return NextResponse.json(formattedUpdatedAppointment, { status: 200 });
});

// --- DELETE /api/admin/appointments/[id]
export const DELETE = withApiHandler(async (_request, { params, user }) => {
  const { id } = params;

  // Ensure doctor can only delete their own appointment
  const existingAppointment = await prisma.appointment.findFirst({
    where: user?.role === "ADMIN"
      ? { id }
      : { id, doctorId: user.id },
  });

  if (!existingAppointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  await prisma.appointment.delete({ where: { id } });

  return NextResponse.json({ message: "Appointment deleted successfully" }, { status: 200 });
});
