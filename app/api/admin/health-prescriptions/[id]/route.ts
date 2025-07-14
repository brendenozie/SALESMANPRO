// app/api/admin/[adminSlug]/prescriptions/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// IMPORTANT: This API assumes a 'Prescription' model exists in your schema.prisma
// If it doesn't, you'll need to add it or adjust logic to derive from other models.

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Assuming 'prisma.prescription' exists
    const prescription = await prisma.prescription.findUnique({
      where: {
        id: id,
        companyId: company.id, // Ensure prescription belongs to this company
      },
      select: {
        id: true,
        medication: true,
        dosage: true,
        instructions: true,
        issuedDate: true,
        expiryDate: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        patient: { select: { id: true, name: true, email: true } },
        doctor: { select: { id: true, name: true, email: true } },
      },
    });

    if (!prescription) {
      return NextResponse.json({ message: "Prescription not found or not associated with this company" }, { status: 404 });
    }

    const formattedPrescription = {
      ...prescription,
      patientName: prescription.patient?.name || 'N/A',
      doctorId: prescription.doctor?.id || null,
      doctorName: prescription.doctor?.name || 'N/A',
      issuedDate: new Date(prescription.issuedDate).toISOString().split('T')[0],
      expiryDate: prescription.expiryDate ? new Date(prescription.expiryDate).toISOString().split('T')[0] : null,
    };

    return NextResponse.json(formattedPrescription, { status: 200 });

  } catch (error) {
    console.error("Error fetching prescription details:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;
  const body = await request.json();

  const { medication, dosage, instructions, issuedDate, expiryDate, status, notes } = body;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Ensure prescription exists and belongs to the company
    const prescriptionToUpdate = await prisma.prescription.findUnique({
        where: {
            id: id,
            companyId: company.id,
        },
        select: { id: true }
    });

    if (!prescriptionToUpdate) {
        return NextResponse.json({ message: "Prescription not found or not associated with this company" }, { status: 404 });
    }

    let updateData: any = { updatedAt: new Date() };

    if (medication) updateData.medication = medication;
    if (dosage) updateData.dosage = dosage;
    if (instructions) updateData.instructions = instructions;
    if (issuedDate) updateData.issuedDate = new Date(issuedDate);
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    // Assuming 'prisma.prescription' exists
    const updatedPrescription = await prisma.prescription.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Prescription updated successfully", prescription: updatedPrescription },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating prescription:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const prescriptionToDelete = await prisma.prescription.findUnique({
        where: {
            id: id,
            companyId: company.id,
        },
        select: { id: true }
    });

    if (!prescriptionToDelete) {
        return NextResponse.json({ message: "Prescription not found or not associated with this company" }, { status: 404 });
    }

    await prisma.prescription.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Prescription deleted successfully" }, { status: 204 });

  } catch (error) {
    console.error("Error deleting prescription:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}