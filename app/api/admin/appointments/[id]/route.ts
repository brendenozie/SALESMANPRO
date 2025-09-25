import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Helper function to format appointment data for the frontend
async function formatAppointmentData(appointment: any) {
  const patientName = appointment.user?.name || 'N/A';
  const doctorName = appointment.doctor?.user?.name || 'N/A';
  const dateObj = new Date(appointment.date);

  // Format date as YYYY-MM-DD
  const formattedDate = dateObj.toISOString().split('T')[0];

  // Format time as HH:MM AM/PM
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return {
    id: appointment.id,
    patientName: patientName,
    doctorId: appointment.doctorId, // Include doctorId for potential frontend use
    doctorName: doctorName,
    date: formattedDate,
    time: formattedTime,
    status: appointment.status,
    service: appointment.service || 'N/A',
    createdAt: appointment.createdAt ? new Date(appointment.createdAt).toLocaleDateString() : 'N/A',
  };
}

// app/api/admin/appointments/[id]/route.ts
// This file handles GET, PUT, DELETE for a specific appointment by ID

export async function GET(request: Request, { params }: { params: { id: string } }) {
  
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        doctor: { include: { User: { select: { name: true } } } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const formattedAppointment = await formatAppointmentData(appointment);
    return NextResponse.json(formattedAppointment);
  } catch (err: any) {
    console.error(`GET /api/admin/appointments/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const body = await request.json();
  const { userId, doctorId, service, date, time, status } = body;

  try {
    let updateData: any = {
      service,
      status,
    };

    if (userId) updateData.userId = userId;
    if (doctorId) updateData.doctorId = doctorId;

    // If date or time are provided, combine them into a new DateTime object
    if (date || time) {
      const existingAppointment = await prisma.appointment.findUnique({ where: { id } });
      if (!existingAppointment) {
        return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
      }

      const existingDate = new Date(existingAppointment.date);
      const newDatePart = date || existingDate.toISOString().split('T')[0];
      const newTimePart = time || existingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); // Use 24-hour format for internal consistency

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

    return NextResponse.json(formattedUpdatedAppointment);
  } catch (err: any) {
    console.error(`PUT /api/admin/appointments/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  try {
    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Appointment deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error(`DELETE /api/admin/appointments/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
