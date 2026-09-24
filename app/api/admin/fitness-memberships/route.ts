import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";
import { resolveCompany, createConsumerMembership } from "@/server/services/fitnessService";
import { FitnessMembershipStatus } from "@prisma/client";

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

  const status = (searchParams.get("status") as FitnessMembershipStatus) || undefined;
  const consumerId = searchParams.get("consumerId") || undefined;

  const where: any = { companyId: company.id };
  if (status) where.status = status;
  if (consumerId) where.consumerId = consumerId;

  const memberships = await prisma.fitnessMembership.findMany({
    where,
    include: {
      plan: true,
      consumer: {
        select: {
          id: true,
          membershipType: true,
          membershipStatus: true,
          user: { select: { id: true, name: true, email: true, phone: true, image: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return formatResponse(true, memberships, "Memberships fetched successfully", 200);
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

  if (!body.consumerId || !body.planId) {
    return formatResponse(false, null, "consumerId and planId are required", 400);
  }

  const membership = await createConsumerMembership(company.id, {
    consumerId: body.consumerId,
    planId: body.planId,
    startDate: body.startDate,
    orderId: body.orderId,
    notes: body.notes,
  });

  return formatResponse(true, membership, "Membership assigned successfully", 201);
});
