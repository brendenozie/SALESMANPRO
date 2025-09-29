// app/api/patient/appointments/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Appointment ID
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");
  const body = await request.json();
  const { status, notes } = body;

  if (!patientId) {
    return formatResponse(false, null, "Missing patientId", 400);
  }

  try {
    // Verify appointment belongs to patient
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingAppointment || existingAppointment.userId !== patientId) {
      return formatResponse(false, null, "Unauthorized or Appointment not found", 403);
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        notes, // patient may add cancellation notes
      },
      include: {
        user: { select: { name: true } },
        doctor: { include: { User: { select: { name: true } } } },
      },
    });

    const formattedUpdatedAppointment = {
      id: updatedAppointment.id,
      patientName: updatedAppointment.user?.name || "N/A",
      doctorName: updatedAppointment.doctor?.User?.name || "N/A",
      service: updatedAppointment.service || "N/A",
      date: updatedAppointment.date
        ? new Date(updatedAppointment.date).toISOString().split("T")[0]
        : "N/A",
      timeSlot: updatedAppointment.timeSlot || "N/A",
      status: updatedAppointment.status,
      notes: updatedAppointment.notes || "N/A",
      createdAt: updatedAppointment.createdAt
        ? new Date(updatedAppointment.createdAt).toLocaleDateString()
        : "N/A",
    };

    return formatResponse(true, formattedUpdatedAppointment);
  } catch (err: any) {
    console.error(`PUT /api/patient/appointments/${id} error:`, err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

export const PUTHandler = withApiHandler(PUT);
