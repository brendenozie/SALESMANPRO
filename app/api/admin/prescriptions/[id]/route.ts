// app/api/admin/[adminSlug]/prescriptions/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Helper function to format prescription data for the frontend
async function formatPrescriptionData(prescription: any) {
  const patientName = prescription.patient?.name || "N/A";
  const doctorName = prescription.doctor?.user?.name || "N/A"; // Assuming Doctor model links to User for name

  return {
    id: prescription.id,
    patientId: prescription.patientId,
    patientName,
    doctorId: prescription.doctorId,
    doctorName,
    medication: prescription.medication,
    dosage: prescription.dosage,
    instructions: prescription.instructions || "N/A",
    issuedDate: prescription.issuedDate
      ? new Date(prescription.issuedDate).toISOString().split("T")[0]
      : "N/A",
    expiryDate: prescription.expiryDate
      ? new Date(prescription.expiryDate).toISOString().split("T")[0]
      : "N/A",
    status: prescription.status,
    notes: prescription.notes || "N/A",
    createdAt: prescription.createdAt
      ? new Date(prescription.createdAt).toLocaleDateString()
      : "N/A",
  };
}

/**
 * GET /api/admin/[adminSlug]/prescriptions/[id]
 */
export const GET = withApiHandler(async (_req, { params }) => {
  const { id } = params;

  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: {
      patient: {
        select: { user: { select: { name: true } } },
      },
      doctor: { include: { User: { select: { name: true } } } },
    },
  });

  if (!prescription) {
    return formatResponse(false, null, "Prescription not found", 404);
  }

  const formatted = await formatPrescriptionData(prescription);
  return formatResponse(true, formatted, "Prescription fetched successfully");
});

/**
 * PUT /api/admin/[adminSlug]/prescriptions/[id]
 */
export const PUT = withApiHandler(async (req, { params }) => {
  const { id } = params;
  const body = await req.json();

  const {
    medication,
    dosage,
    instructions,
    issuedDate,
    expiryDate,
    notes,
    status,
    patientId,
    doctorId,
  } = body;

  const updatedPrescription = await prisma.prescription.update({
    where: { id },
    data: {
      patientId,
      doctorId,
      medication,
      dosage,
      instructions,
      issuedDate: issuedDate ? new Date(issuedDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      notes,
      status,
    },
    include: {
      patient: { select: { user: { select: { name: true } } } },
      doctor: { include: { User: { select: { name: true } } } },
    },
  });

  const formatted = await formatPrescriptionData(updatedPrescription);
  return formatResponse(true, formatted, "Prescription updated successfully", 200);
});

/**
 * DELETE /api/admin/[adminSlug]/prescriptions/[id]
 */
export const DELETE = withApiHandler(async (_req, { params }) => {
  const { id } = params;
  await prisma.prescription.delete({ where: { id } });
  return formatResponse(true, null, "Prescription deleted successfully", 204);
});

// Note: Authentication and authorization checks should be added as needed
// depending on your application's requirements.
