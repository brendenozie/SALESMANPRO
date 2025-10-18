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

    const updateData: any = { status };
    if (typeof notes !== "undefined") updateData.notes = notes; // patient may add cancellation notes

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        service: true,
        date: true,
        status: true,
        createdAt: true,
        userId: true,
        user: { select: { name: true } },
        doctorId: true,
      },
    });

    // fetch patient's and doctor's user names separately if we have their IDs
    let patientName = "N/A";
    if (updatedAppointment.userId) {
      const patientUser = await prisma.user.findUnique({
        where: { id: updatedAppointment.userId },
        select: { name: true },
      });
      patientName = patientUser?.name || "N/A";
    }

    let doctorName = "N/A";
    if (updatedAppointment.doctorId) {
      const doctorUser = await prisma.user.findUnique({
        where: { id: updatedAppointment.doctorId },
        select: { name: true },
      });
      doctorName = doctorUser?.name || "N/A";
    }

    const formattedUpdatedAppointment = {
      id: updatedAppointment.id,
      patientName,
      doctorName,
      service: updatedAppointment.service || "N/A",
      date: updatedAppointment.date
        ? new Date(updatedAppointment.date).toISOString().split("T")[0]
        : "N/A",
      timeSlot: (updatedAppointment as any).timeSlot || "N/A",
      status: updatedAppointment.status,
      notes: typeof notes !== "undefined" ? notes : "N/A",
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
