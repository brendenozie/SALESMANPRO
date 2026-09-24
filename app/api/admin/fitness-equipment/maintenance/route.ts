import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";
import { resolveCompany, recordMaintenance } from "@/server/services/fitnessService";
import { MaintenanceStatus } from "@prisma/client";

export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const companyIdentifier = searchParams.get("companyId") || searchParams.get("adminSlug") || searchParams.get("slug");
  const equipmentId = searchParams.get("equipmentId");

  if (!companyIdentifier) {
    return formatResponse(false, null, "Company identifier is required", 400);
  }

  const company = await resolveCompany(companyIdentifier);
  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const where: any = { companyId: company.id };
  if (equipmentId) where.equipmentId = equipmentId;

  const logs = await prisma.equipmentMaintenance.findMany({
    where,
    include: {
      equipment: { select: { id: true, name: true, category: true, roomOrArea: true } },
    },
    orderBy: { maintenanceDate: "desc" },
  });

  return formatResponse(true, logs, "Maintenance logs fetched successfully", 200);
});

export const POST = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const body = await request.json();
  const companyIdentifier = body.companyId || searchParams.get("companyId") || searchParams.get("adminSlug");

  if (!companyIdentifier) {
    return formatResponse(false, null, "Company identifier is required", 400);
  }

  const company = await resolveCompany(companyIdentifier);
  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  if (!body.equipmentId || !body.title) {
    return formatResponse(false, null, "equipmentId and title are required", 400);
  }

  const log = await recordMaintenance(company.id, {
    equipmentId: body.equipmentId,
    title: body.title,
    description: body.description,
    status: body.status as MaintenanceStatus,
    technicianName: body.technicianName,
    vendorName: body.vendorName,
    cost: body.cost ? parseFloat(body.cost) : undefined,
    maintenanceDate: body.maintenanceDate,
    nextScheduledDate: body.nextScheduledDate,
    notes: body.notes,
  });

  return formatResponse(true, log, "Maintenance recorded successfully", 201);
});
