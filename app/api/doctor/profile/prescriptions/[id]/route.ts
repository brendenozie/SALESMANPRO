// app/api/doctor/prescriptions/[id]/route.ts (for updating prescription status/notes by doctor)
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Prescription ID
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId"); // Doctor making the update
  const body = await request.json();
  const { status, notes, instructions, expiryDate } = body; // Allow specific fields to be updated

  if (!doctorId) {
    return NextResponse.json({ error: "Missing doctorId" }, { status: 400 });
  }

  try {
    // Verify that this prescription was issued by the doctor making the request
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id: id },
      select: { doctorId: true },
    });

    if (!existingPrescription || existingPrescription.doctorId !== doctorId) {
      return NextResponse.json({ error: "Unauthorized or Prescription not found" }, { status: 403 });
    }

    const updatedPrescription = await prisma.prescription.update({
      where: { id: id },
      data: {
        status: status,
        notes: notes,
        instructions: instructions,
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
      patientName: updatedPrescription.patient?.name || 'N/A',
      doctorId: updatedPrescription.doctorId,
      doctorName: updatedPrescription.doctor?.user?.name || 'N/A',
      medication: updatedPrescription.medication,
      dosage: updatedPrescription.dosage,
      instructions: updatedPrescription.instructions || 'N/A',
      issuedDate: updatedPrescription.issuedDate ? new Date(updatedPrescription.issuedDate).toISOString().split('T')[0] : 'N/A',
      expiryDate: updatedPrescription.expiryDate ? new Date(updatedPrescription.expiryDate).toISOString().split('T')[0] : 'N/A',
      status: updatedPrescription.status,
      notes: updatedPrescription.notes || 'N/A',
      createdAt: updatedPrescription.createdAt ? new Date(updatedPrescription.createdAt).toLocaleDateString() : 'N/A',
    };

    return NextResponse.json(formattedUpdatedPrescription);
  } catch (err: any) {
    console.error(`PUT /api/doctor/prescriptions/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
