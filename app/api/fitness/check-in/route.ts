import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";
import { resolveCompany, performGymCheckIn } from "@/server/services/fitnessService";
import { CheckInMethod } from "@prisma/client";

export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const companyIdentifier = searchParams.get("companyId") || searchParams.get("adminSlug") || searchParams.get("slug");

  if (!companyIdentifier) {
    return formatResponse(false, null, "Company identifier is required", 400);
  }

  const company = await resolveCompany(companyIdentifier);
  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const locationId = searchParams.get("locationId") || undefined;
  const consumerId = searchParams.get("consumerId") || undefined;

  const where: any = { companyId: company.id };
  if (locationId) where.locationId = locationId;
  if (consumerId) where.consumerId = consumerId;

  const checkIns = await prisma.gymCheckIn.findMany({
    where,
    include: {
      consumer: {
        select: {
          id: true,
          membershipType: true,
          membershipStatus: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
      location: { select: { id: true, name: true } },
      membership: { include: { plan: { select: { name: true } } } },
    },
    orderBy: { checkInTime: "desc" },
    take: 50,
  });

  return formatResponse(true, checkIns, "Check-in logs fetched successfully", 200);
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

  // consumerId can be direct consumerId, or userId, or loginCode!
  let consumerId = body.consumerId;
  if (!consumerId && body.loginCode) {
    const consumer = await prisma.consumer.findFirst({
      where: { companyId: company.id, loginCode: body.loginCode },
      select: { id: true },
    });
    if (consumer) consumerId = consumer.id;
  } else if (!consumerId && body.userId) {
    const consumer = await prisma.consumer.findFirst({
      where: { companyId: company.id, userId: body.userId },
      select: { id: true },
    });
    if (consumer) consumerId = consumer.id;
  }

  if (!consumerId) {
    return formatResponse(false, null, "Valid consumerId, userId, or loginCode is required", 400);
  }

  const result = await performGymCheckIn(company.id, {
    consumerId,
    locationId: body.locationId,
    method: body.method as CheckInMethod,
    notes: body.notes,
  });

  return formatResponse(result.success, result, result.message, result.success ? 200 : 403);
});
