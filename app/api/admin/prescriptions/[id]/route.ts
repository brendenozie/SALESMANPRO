// app/api/admin/[adminSlug]/prescriptions/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Helper function to format prescription data for the frontend
async function formatPrescriptionData(prescription: any) {
  const patientName = prescription.patient?.name || 'N/A';
  const doctorName = prescription.doctor?.user?.name || 'N/A'; // Assuming Doctor model links to User for name

  return {
    id: prescription.id,
    patientId: prescription.patientId,
    patientName: patientName,
    doctorId: prescription.doctorId,
    doctorName: doctorName,
    medication: prescription.medication,
    dosage: prescription.dosage,
    instructions: prescription.instructions || 'N/A',
    issuedDate: prescription.issuedDate ? new Date(prescription.issuedDate).toISOString().split('T')[0] : 'N/A',
    expiryDate: prescription.expiryDate ? new Date(prescription.expiryDate).toISOString().split('T')[0] : 'N/A',
    status: prescription.status,
    notes: prescription.notes || 'N/A',
    createdAt: prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'N/A',
  };
}


// app/api/admin/prescriptions/[id]/route.ts
// This file handles GET, PUT, DELETE for a specific prescription by ID

export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: { select: { name: true } },
        doctor: { include: { User: { select: { name: true } } } },
      },
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    const formattedPrescription = await formatPrescriptionData(prescription);
    return NextResponse.json(formattedPrescription);
  } catch (err: any) {
    console.error(`GET /api/admin/prescriptions/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  const body = await request.json();
  const { medication, dosage, instructions, issuedDate, expiryDate, notes, status, patientId, doctorId } = body;

  try {
    const updatedPrescription = await prisma.prescription.update({
      where: { id },
      data: {
        patientId: patientId, // Allow updating patient if needed
        doctorId: doctorId,   // Allow updating doctor if needed
        medication: medication,
        dosage: dosage,
        instructions: instructions,
        issuedDate: issuedDate ? new Date(issuedDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        notes: notes,
        status: status,
      },
      include: {
        patient: { select: { name: true } },
        doctor: { include: { User: { select: { name: true } } } },
      },
    });

    const formattedUpdatedPrescription = await formatPrescriptionData(updatedPrescription);

    return NextResponse.json(formattedUpdatedPrescription);
  } catch (err: any) {
    console.error(`PUT /api/admin/prescriptions/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    await prisma.prescription.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Prescription deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error(`DELETE /api/admin/prescriptions/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
