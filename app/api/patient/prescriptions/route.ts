// app/api/patient/prescriptions/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet } from "@/lib/cache";

async function getHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId"); // User.id of patient
  const status = searchParams.get("status"); // 'PENDING', 'DISPENSED', 'EXPIRED', 'All'
  const searchTerm = searchParams.get("searchTerm") || "";

  if (!patientId) {
    return formatResponse(false, null, "Missing patientId", 400);
  }

  const cacheKey = `patient:prescriptions:${patientId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    const whereClause: any = { patientId };

    if (status && status !== "All") {
      whereClause.status = status;
    }

    let prescriptions = await prisma.prescription.findMany({
      where: whereClause,
      include: {
        patient: { include: { user: true } },
        doctor: { include: { User: { select: { name: true } } } },
      },
      orderBy: { issuedDate: "desc" },
    });

    // Client-side filtering for search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      prescriptions = prescriptions.filter(
        (rx) =>
          rx.medication?.toLowerCase().includes(lowerCaseSearchTerm) ||
          rx.doctor?.User?.name?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    const formattedPrescriptions = prescriptions.map((rx) => ({
      id: rx.id,
      patientId: rx.patientId,
      patientName: rx.patient?.user.name || "N/A",
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

    try {
      await cacheSet(cacheKey, formattedPrescriptions, 60);
    } catch (e) {
      console.error("Failed to cache patient prescriptions data:", e);
    }

    return formatResponse(true, formattedPrescriptions);
  } catch (err: any) {
    console.error("GET /api/patient/prescriptions error:", err);
    return formatResponse(
      false,
      null,
      err.message || "Internal server error",
      500
    );
  }
}

export const GET = withApiHandler(getHandler);
