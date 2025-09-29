// app/api/doctor/prescriptions/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

async function getHandler(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");
  const status = searchParams.get("status"); // 'PENDING', 'DISPENSED', 'EXPIRED', 'All'
  const searchTerm = searchParams.get("searchTerm") || "";

  if (!doctorId) {
    return formatResponse(false, null, "Missing doctorId", 400);
  }

  try {
    const whereClause: any = { doctorId };

    if (patientId) {
      whereClause.patientId = patientId;
    }
    if (status && status !== "All") {
      whereClause.status = status;
    }

    let prescriptions = await prisma.prescription.findMany({
      where: whereClause,
      include: {
        patient: { select: { name: true } },
        doctor: { include: { User: { select: { name: true } } } },
      },
      orderBy: { issuedDate: "desc" },
    });

    // Client-side filtering for search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      prescriptions = prescriptions.filter(
        (rx) =>
          rx.patient?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
          rx.medication?.toLowerCase().includes(lowerCaseSearchTerm) ||
          rx.dosage?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    const formattedPrescriptions = prescriptions.map((rx) => ({
      id: rx.id,
      patientId: rx.patientId,
      patientName: rx.patient?.name || "N/A",
      doctorId: rx.doctorId,
      doctorName: rx.doctor?.User?.name || "N/A",
      medication: rx.medication,
      dosage: rx.dosage,
      instructions: rx.instructions || "N/A",
      issuedDate: rx.issuedDate
        ? new Date(rx.issuedDate).toISOString().split("T")[0]
        : "N/A",
      expiryDate: rx.expiryDate
        ? new Date(rx.expiryDate).toISOString().split("T")[0]
        : "N/A",
      status: rx.status,
      notes: rx.notes || "N/A",
      createdAt: rx.createdAt
        ? new Date(rx.createdAt).toLocaleDateString()
        : "N/A",
    }));

    return formatResponse(true, formattedPrescriptions, "Prescriptions fetched successfully");
  } catch (err: any) {
    console.error("GET /api/doctor/prescriptions error:", err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

export const GET = withApiHandler(getHandler);
