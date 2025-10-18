import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

/**
 * Handler to update an appointment's status or notes by the assigned doctor.
 */
async function updateAppointment(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Authentication Check
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params; // Appointment ID
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId"); // Doctor making the update

  // 2. Read and Parse JSON body
  let body;
  try {
    body = await request.json();
  } catch {
    return formatResponse(false, null, "Invalid JSON body provided.", 400);
  }

  const { status, notes } = body;

  // 3. Validation
  if (!doctorId) {
    return formatResponse(false, null, "Missing required query parameter: doctorId.", 400);
  }

  if (!status && !notes) {
    return formatResponse(false, null, "Update requires at least 'status' or 'notes' field.", 400);
  }

  try {
    // 4. Authorization Check
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      select: { doctorId: true },
    });

    if (!existingAppointment) {
      return formatResponse(false, null, "Appointment not found.", 404);
    }

    if (existingAppointment.doctorId !== doctorId) {
      return formatResponse(
        false,
        null,
        "Unauthorized: This appointment is not assigned to the specified doctor.",
        403
      );
    }

    // 5. Update Appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        doctor: { include: { User: { select: { name: true } } } },
      },
    });

    // 6. Format Success Response Data
    const formattedUpdatedAppointment = {
      id: updatedAppointment.id,
      patientName: updatedAppointment.user?.name || "N/A",
      patientEmail: updatedAppointment.user?.email || "N/A",
      patientPhone: updatedAppointment.user?.phone || "N/A",
      doctorName: updatedAppointment.doctor?.User?.name || "N/A",
      service: updatedAppointment.service || "N/A",
      date: updatedAppointment.date
        ? updatedAppointment.date.toISOString().split("T")[0]
        : "N/A",
      timeSlot: (updatedAppointment as any).timeSlot || "N/A",
      status: updatedAppointment.status,
      notes: (updatedAppointment as any).notes || "N/A",
      createdAt: updatedAppointment.createdAt
        ? updatedAppointment.createdAt.toLocaleDateString()
        : "N/A",
    };

    return formatResponse(
      true,
      formattedUpdatedAppointment,
      "Appointment status and notes updated successfully.",
      200
    );
  } catch (err: any) {
    console.error(`PUT /api/doctor/appointments/${id} error:`, err);
    return formatResponse(
      false,
      null,
      err.message || "Internal server error.",
      500
    );
  }
}

// Export wrapped handler
export const PUT = withApiHandler(updateAppointment);
