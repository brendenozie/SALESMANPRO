// app/api/patient/prescriptions/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId"); // This is the User.id for the patient
  const status = searchParams.get("status"); // 'PENDING', 'DISPENSED', 'EXPIRED', 'All'
  const searchTerm = searchParams.get("searchTerm") || "";

  if (!patientId) {
    return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
  }

  try {
    const whereClause: any = {
      patientId: patientId, // Link to the User model
    };

    if (status && status !== 'All') {
      whereClause.status = status;
    }

    let prescriptions = await prisma.prescription.findMany({
      where: whereClause,
      include: {
        patient: { select: { name: true } }, // Patient's name (for consistency)
        doctor: { include: { User: { select: { name: true } } } },
      },
      orderBy: { issuedDate: 'desc' },
    });

    // Client-side filtering for search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      prescriptions = prescriptions.filter(rx =>
        rx.medication?.toLowerCase().includes(lowerCaseSearchTerm) ||
        rx.doctor?.User?.name?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    const formattedPrescriptions = prescriptions.map(rx => ({
      id: rx.id,
      patientId: rx.patientId,
      patientName: rx.patient?.name || 'N/A',
      doctorId: rx.doctorId,
      doctorName: rx.doctor?.User?.name || 'N/A',
      medication: rx.medication,
      dosage: rx.dosage,
      instructions: rx.instructions || 'N/A',
      issuedDate: rx.issuedDate ? new Date(rx.issuedDate).toISOString().split('T')[0] : 'N/A',
      expiryDate: rx.expiryDate ? new Date(rx.expiryDate).toISOString().split('T')[0] : 'N/A',
      status: rx.status,
      notes: rx.notes || 'N/A',
      createdAt: rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : 'N/A',
    }));

    return NextResponse.json(formattedPrescriptions);
  } catch (err: any) {
    console.error("GET /api/patient/prescriptions error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
