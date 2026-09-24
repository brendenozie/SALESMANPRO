import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { resolveCompany, listMembershipPlans, createMembershipPlan } from "@/server/services/fitnessService";
import { MembershipInterval } from "@prisma/client";

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

  const plans = await listMembershipPlans(company.id, false);
  return formatResponse(true, plans, "Membership plans fetched successfully", 200);
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

  if (!body.name || body.price === undefined) {
    return formatResponse(false, null, "Plan name and price are required", 400);
  }

  const plan = await createMembershipPlan(company.id, {
    name: body.name,
    description: body.description,
    price: parseFloat(body.price),
    interval: body.interval as MembershipInterval,
    durationDays: body.durationDays ? parseInt(body.durationDays, 10) : 30,
    hasGymAccess: body.hasGymAccess !== undefined ? Boolean(body.hasGymAccess) : true,
    hasClassAccess: body.hasClassAccess !== undefined ? Boolean(body.hasClassAccess) : true,
    hasDigitalAccess: body.hasDigitalAccess !== undefined ? Boolean(body.hasDigitalAccess) : true,
    allowedLocationIds: body.allowedLocationIds || [],
    features: body.features || [],
  });

  return formatResponse(true, plan, "Membership plan created successfully", 201);
});
