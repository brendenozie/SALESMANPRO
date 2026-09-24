import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { resolveCompany, listEquipment, createEquipment } from "@/server/services/fitnessService";
import { EquipmentCondition, EquipmentStatus } from "@prisma/client";

export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || searchParams.get("adminSlug") || searchParams.get("slug");

  if (!companyId) {
    return formatResponse(false, null, "Company identifier is required", 400);
  }

  const company = await resolveCompany(companyId);
  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const locationId = searchParams.get("locationId") || undefined;
  const status = (searchParams.get("status") as EquipmentStatus) || undefined;
  const category = searchParams.get("category") || undefined;

  const equipment = await listEquipment(company.id, { locationId, status, category });

  return formatResponse(true, equipment, "Equipment fetched successfully", 200);
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

  if (!body.name || !body.category) {
    return formatResponse(false, null, "Name and category are required", 400);
  }

  const newEquipment = await createEquipment(company.id, {
    name: body.name,
    category: body.category,
    locationId: body.locationId,
    roomOrArea: body.roomOrArea,
    serialNumber: body.serialNumber,
    purchaseDate: body.purchaseDate,
    purchaseCost: body.purchaseCost ? parseFloat(body.purchaseCost) : undefined,
    condition: body.condition as EquipmentCondition,
    status: body.status as EquipmentStatus,
    notes: body.notes,
    imageUrl: body.imageUrl,
  });

  return formatResponse(true, newEquipment, "Equipment created successfully", 201);
});
