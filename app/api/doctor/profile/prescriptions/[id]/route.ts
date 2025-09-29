// app/api/doctor/prescriptions/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

async function putHandler(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params; // Prescription ID
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId"); // Doctor making the update
  const body = await request.json();
  const { status, notes, instructions, expiryDate } = body; // Allow specific fields to be updated

  if (!doctorId) {
    return formatResponse(false, null, "Missing doctorId", 400);
  }

  try {
    // Verify that this prescription was issued by the doctor making the request
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id },
      select: { doctorId: true },
    });

    if (!existingPrescription || existingPrescription.doctorId !== doctorId) {
      return formatResponse(false, null, "Unauthorized or Prescription not found", 403);
    }

    const updatedPrescription = await prisma.prescription.update({
      where: { id },
      data: {
        status,
        notes,
        instructions,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      },
      include: {
        patient: { select: { name: true } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    const formattedUpdatedPrescription = {
      id: updatedPrescription.id,
      patientId: updatedPrescription.patientId,
      patientName: updatedPrescription.patient?.name || "N/A",
      doctorId: updatedPrescription.doctorId,
      doctorName: updatedPrescription.doctor?.user?.name || "N/A",
      medication: updatedPrescription.medication,
      dosage: updatedPrescription.dosage,
      instructions: updatedPrescription.instructions || "N/A",
      issuedDate: updatedPrescription.issuedDate
        ? new Date(updatedPrescription.issuedDate).toISOString().split("T")[0]
        : "N/A",
      expiryDate: updatedPrescription.expiryDate
        ? new Date(updatedPrescription.expiryDate).toISOString().split("T")[0]
        : "N/A",
      status: updatedPrescription.status,
      notes: updatedPrescription.notes || "N/A",
      createdAt: updatedPrescription.createdAt
        ? new Date(updatedPrescription.createdAt).toLocaleDateString()
        : "N/A",
    };

    return formatResponse(true, formattedUpdatedPrescription, "Prescription updated successfully");
  } catch (err: any) {
    console.error(`PUT /api/doctor/prescriptions/${id} error:`, err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

export const PUT = withApiHandler(putHandler);
