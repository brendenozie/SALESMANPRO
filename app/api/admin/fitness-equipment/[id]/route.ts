import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";
import { updateEquipment } from "@/server/services/fitnessService";

export const GET = withApiHandler(async (request, context) => {
  const { id } = context.params;

  const item = await prisma.equipment.findUnique({
    where: { id },
    include: {
      location: { select: { id: true, name: true } },
      maintenanceLogs: {
        orderBy: { maintenanceDate: "desc" },
      },
    },
  });

  if (!item) {
    return formatResponse(false, null, "Equipment not found", 404);
  }

  return formatResponse(true, item, "Equipment retrieved", 200);
});

export const PUT = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const body = await request.json();

  const existing = await prisma.equipment.findUnique({
    where: { id },
    select: { id: true, companyId: true },
  });

  if (!existing) {
    return formatResponse(false, null, "Equipment not found", 404);
  }

  const updated = await updateEquipment(id, existing.companyId, body);

  return formatResponse(true, updated, "Equipment updated successfully", 200);
});

export const DELETE = withApiHandler(async (request, context) => {
  const { id } = context.params;

  await prisma.equipment.delete({
    where: { id },
  });

  return formatResponse(true, { id }, "Equipment deleted successfully", 200);
});
