// app/api/doctor/appointments/[id]/route.ts (for updating appointment status by doctor)
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Appointment ID
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId"); // Doctor making the update
  const body = await request.json();
  const { status, notes } = body; // Only allow status and notes to be updated by doctor

  if (!doctorId) {
    return NextResponse.json({ error: "Missing doctorId" }, { status: 400 });
  }

  try {
    // Verify that this appointment belongs to the doctor making the request
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: id },
      select: { doctorId: true },
    });

    if (!existingAppointment || existingAppointment.doctorId !== doctorId) {
      return NextResponse.json({ error: "Unauthorized or Appointment not found" }, { status: 403 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        status: status,
        notes: notes,
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    const formattedUpdatedAppointment = {
      id: updatedAppointment.id,
      patientName: updatedAppointment.user?.name || 'N/A',
      patientEmail: updatedAppointment.user?.email || 'N/A',
      patientPhone: updatedAppointment.user?.phone || 'N/A',
      doctorName: updatedAppointment.doctor?.user?.name || 'N/A',
      service: updatedAppointment.service || 'N/A',
      date: updatedAppointment.date ? new Date(updatedAppointment.date).toISOString().split('T')[0] : 'N/A',
      timeSlot: updatedAppointment.timeSlot || 'N/A',
      status: updatedAppointment.status,
      notes: updatedAppointment.notes || 'N/A',
      createdAt: updatedAppointment.createdAt ? new Date(updatedAppointment.createdAt).toLocaleDateString() : 'N/A',
    };

    return NextResponse.json(formattedUpdatedAppointment);
  } catch (err: any) {
    console.error(`PUT /api/doctor/appointments/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
