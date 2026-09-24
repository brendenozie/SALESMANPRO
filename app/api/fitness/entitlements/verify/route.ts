import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { resolveCompany, verifyEntitlement } from "@/server/services/fitnessService";
import prisma from "@/server/db/prismadb";

export const POST = withApiHandler(async (request, { user }) => {
  const body = await request.json();
  const { companyId, targetType, targetId } = body;

  if (!companyId || !targetType || !targetId) {
    return formatResponse(false, null, "companyId, targetType, and targetId are required", 400);
  }

  const company = await resolveCompany(companyId);
  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  // Resolve consumer from logged-in user or passed consumerId
  let consumerId = body.consumerId;
  if (!consumerId && user?.id) {
    const consumer = await prisma.consumer.findFirst({
      where: { companyId: company.id, userId: user.id },
      select: { id: true },
    });
    if (consumer) consumerId = consumer.id;
  }

  const result = await verifyEntitlement(company.id, consumerId, {
    targetType,
    targetId,
  });

  return formatResponse(result.hasAccess, result, result.hasAccess ? "Entitlement verified" : "Access denied", 200);
});
