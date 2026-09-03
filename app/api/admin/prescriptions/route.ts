import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/admin/prescriptions/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Helper to format prescription data for the frontend
async function formatPrescriptionData(prescription: any) {
  const patientName = prescription.patient?.user?.name || "N/A";
  const doctorName = prescription.doctor?.User?.name || "N/A";

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


export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus"); // 'PENDING', 'DISPENSED', 'EXPIRED', 'All'

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId", 400);
  }

  const whereClause: any = { companyId };

  if (filterStatus && filterStatus !== "All") {
    whereClause.status = filterStatus;
  }

    const cacheKey = buildTenantCacheKey(companyId, "prescriptions", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  let prescriptions = await prisma.prescription.findMany({
    where: whereClause,
    include: {
      patient: { select: { user: { select: { name: true } } } },
      doctor: { include: { User: { select: { name: true } } } },
    },
    orderBy: { issuedDate: "desc" },
  });

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    prescriptions = prescriptions.filter(
      (rx) =>
        rx.patient?.user?.name?.toLowerCase().includes(lower) ||
        rx.doctor?.User?.name?.toLowerCase().includes(lower) ||
        rx.medication?.toLowerCase().includes(lower)
    );
  }

  const enriched = await Promise.all(
    prescriptions.map((rx) => formatPrescriptionData(rx))
  );

    try {
    if (enriched) {
      await cacheSet(cacheKey, enriched, 60);
    }
  } catch (e) {}

  return formatResponse(true, enriched, "Prescriptions fetched successfully");
});


export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const {
    patientId,
    doctorId,
    medication,
    dosage,
    instructions,
    issuedDate,
    expiryDate,
    notes,
    status,
    companyId,
  } = body;

  if (!patientId || !doctorId || !medication || !dosage || !issuedDate || !companyId) {
    return formatResponse(
      false,
      null,
      "Missing required fields: patientId, doctorId, medication, dosage, issuedDate, companyId",
      400
    );
  }

  const newPrescription = await prisma.prescription.create({
    data: {
      patient: { connect: { id: patientId } },
      doctor: { connect: { id: doctorId } },
      company: { connect: { id: companyId } },
      medication,
      dosage,
      instructions,
      issuedDate: new Date(issuedDate),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      notes,
      status: status || "PENDING",
    },
    include: {
      patient: { select: { user: { select: { name: true } } } },
      doctor: { include: { User: { select: { name: true } } } },
    },
  });

  const formatted = await formatPrescriptionData(newPrescription);
  
    try {
      await cacheDel(`tenant:${companyId}:prescriptions:*`);
      await cacheDel(`admin:prescriptions:*`);
    } catch (e) {}
    return formatResponse(true, formatted, "Prescription created successfully", 201);
});
