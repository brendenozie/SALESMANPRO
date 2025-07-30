// app/api/admin/prescriptions/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Assuming this path correctly points to your Prisma client initialization

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus"); // 'PENDING', 'DISPENSED', 'EXPIRED', 'All'

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  try {
    const whereClause: any = {
      companyId: companyId,
    };

    if (filterStatus && filterStatus !== 'All') {
      whereClause.status = filterStatus;
    }

    let prescriptions = await prisma.prescription.findMany({
      where: whereClause,
      include: {
        patient: { select: { name: true } }, // Select patient's name
        doctor: {
          include: {
            User: { select: { name: true } }, // Select doctor's user name
          },
        },
      },
      orderBy: { issuedDate: 'desc' }, // Order by most recent prescriptions
    });

    // Client-side filtering for search term across patient name, doctor name, and medication
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      prescriptions = prescriptions.filter(rx =>
        rx.patient?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        rx.doctor?.User?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        rx.medication?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    const enrichedPrescriptions = await Promise.all(
      prescriptions.map(async (rx) => formatPrescriptionData(rx))
    );

    return NextResponse.json(enrichedPrescriptions);
  } catch (err: any) {
    console.error("GET /api/admin/prescriptions error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { patientId, doctorId, medication, dosage, instructions, issuedDate, expiryDate, notes, status, companyId } = body;

  if (!patientId || !doctorId || !medication || !dosage || !issuedDate || !companyId) {
    return NextResponse.json(
      { error: "Missing required fields: patientId, doctorId, medication, dosage, issuedDate, companyId" },
      { status: 400 }
    );
  }

  try {
    const newPrescription = await prisma.prescription.create({
      data: {
        patientId: patientId,
        doctorId: doctorId,
        companyId: companyId,
        medication: medication,
        dosage: dosage,
        instructions: instructions,
        issuedDate: new Date(issuedDate),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        notes: notes,
        status: status || 'PENDING', // Default to PENDING if not provided
      },
      include: {
        patient: { select: { name: true } },
        doctor: { include: { User: { select: { name: true } } } },
      },
    });

    const formattedNewPrescription = await formatPrescriptionData(newPrescription);

    return NextResponse.json(formattedNewPrescription, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/prescriptions error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
