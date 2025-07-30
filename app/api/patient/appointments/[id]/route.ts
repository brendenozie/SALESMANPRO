
// app/api/patient/appointments/[id]/route.ts (for updating/canceling appointment by patient)
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Appointment ID
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId"); // Patient making the update
  const body = await request.json();
  const { status, notes } = body; // Allow specific fields to be updated by patient

  if (!patientId) {
    return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
  }

  try {
    // Verify that this appointment belongs to the patient making the request
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: id },
      select: { userId: true },
    });

    if (!existingAppointment || existingAppointment.userId !== patientId) {
      return NextResponse.json({ error: "Unauthorized or Appointment not found" }, { status: 403 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        status: status,
        notes: notes, // Patient might add notes for cancellation
      },
      include: {
        user: { select: { name: true } },
        doctor: { include: { User: { select: { name: true } } } },
      },
    });

    const formattedUpdatedAppointment = {
      id: updatedAppointment.id,
      patientName: updatedAppointment.user?.name || 'N/A',
      doctorName: updatedAppointment.doctor?.User?.name || 'N/A',
      service: updatedAppointment.service || 'N/A',
      date: updatedAppointment.date ? new Date(updatedAppointment.date).toISOString().split('T')[0] : 'N/A',
      timeSlot: updatedAppointment.timeSlot || 'N/A',
      status: updatedAppointment.status,
      notes: updatedAppointment.notes || 'N/A',
      createdAt: updatedAppointment.createdAt ? new Date(updatedAppointment.createdAt).toLocaleDateString() : 'N/A',
    };

    return NextResponse.json(formattedUpdatedAppointment);
  } catch (err: any) {
    console.error(`PUT /api/patient/appointments/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
