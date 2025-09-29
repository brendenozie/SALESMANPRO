// app/api/doctor/appointments/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

async function putHandler(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params; // Appointment ID
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId"); // Doctor making the update
  const body = await request.json();
  const { status, notes } = body; // Only allow status and notes to be updated

  if (!doctorId) {
    return formatResponse(false, null, "Missing doctorId", 400);
  }

  try {
    // Verify that this appointment belongs to the doctor making the request
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      select: { doctorId: true },
    });

    if (!existingAppointment || existingAppointment.doctorId !== doctorId) {
      return formatResponse(
        false,
        null,
        "Unauthorized or Appointment not found",
        403
      );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        notes,
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    const formattedUpdatedAppointment = {
      id: updatedAppointment.id,
      patientName: updatedAppointment.user?.name || "N/A",
      patientEmail: updatedAppointment.user?.email || "N/A",
      patientPhone: updatedAppointment.user?.phone || "N/A",
      doctorName: updatedAppointment.doctor?.user?.name || "N/A",
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

    return formatResponse(
      true,
      formattedUpdatedAppointment,
      "Appointment updated successfully"
    );
  } catch (err: any) {
    console.error(`PUT /api/doctor/appointments/${id} error:`, err);
    return formatResponse(
      false,
      null,
      err.message || "Internal server error",
      500
    );
  }
}

export const PUT = withApiHandler(putHandler);
