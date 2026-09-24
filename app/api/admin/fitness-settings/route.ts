import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { resolveCompany } from "@/server/services/fitnessService";

const initializeSettings = async (companyId: string, companySlug: string, companyName: string) => {
  return prisma.companySettings.create({
    data: {
      companyId: companyId,
      companyName: companyName,
      contactEmail: `info@${companySlug || "gym"}.com`,
      contactPhone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      logoUrl: "",
      currency: "USD",
      timezone: "America/New_York",
      emailNotifications: true,
      smsNotifications: false,
    },
  });
};

const getSettingsLogic = async (request: Request, context: any) => {
  const { searchParams } = new URL(request.url);
  const companyIdentifier =
    searchParams.get("companyId") ||
    searchParams.get("id") ||
    searchParams.get("adminSlug") ||
    searchParams.get("slug") ||
    context?.params?.adminSlug;

  if (!companyIdentifier) {
    return formatResponse(false, null, "Company identifier is required", 400);
  }

  const company = await resolveCompany(companyIdentifier);
  if (!company) {
    return formatResponse(false, null, "Company not found for the given identifier.", 404);
  }

  const cacheKey = buildTenantCacheKey(company.id, "fitness-settings", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  let settings = await prisma.companySettings.findUnique({
    where: { companyId: company.id },
  });

  if (!settings) {
    settings = await initializeSettings(company.id, company.slug, company.name);
  }

  try {
    await cacheSet(cacheKey, settings, 60);
  } catch (e) {}

  return formatResponse(true, settings, "Settings fetched successfully", 200);
};

const putSettingsLogic = async (request: Request, context: any) => {
  const { searchParams } = new URL(request.url);
  const body = await request.json();
  const companyIdentifier =
    searchParams.get("companyId") ||
    searchParams.get("id") ||
    searchParams.get("adminSlug") ||
    searchParams.get("slug") ||
    body.companyId ||
    context?.params?.adminSlug;

  if (!companyIdentifier) {
    return formatResponse(false, null, "Company identifier is required", 400);
  }

  const company = await resolveCompany(companyIdentifier);
  if (!company) {
    return formatResponse(false, null, "Company not found for the given identifier.", 404);
  }

  const {
    companyName,
    gymName,
    contactEmail,
    contactPhone,
    address,
    city,
    state,
    zipCode,
    country,
    logoUrl,
    currency,
    timezone,
    emailNotifications,
    smsNotifications,
  } = body;

  const targetName = gymName || companyName || company.name;

  const updatedSettings = await prisma.companySettings.upsert({
    where: { companyId: company.id },
    update: {
      companyName: targetName,
      contactEmail: contactEmail,
      contactPhone: contactPhone,
      address: address,
      city: city,
      state: state,
      zipCode: zipCode,
      country: country,
      logoUrl: logoUrl,
      currency: currency,
      timezone: timezone,
      emailNotifications: emailNotifications !== undefined ? emailNotifications : undefined,
      smsNotifications: smsNotifications !== undefined ? smsNotifications : undefined,
    },
    create: {
      companyId: company.id,
      companyName: targetName,
      contactEmail: contactEmail || `info@${company.slug}.com`,
      contactPhone: contactPhone || "",
      address: address || "",
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
      country: country || "",
      logoUrl: logoUrl || "",
      currency: currency || "USD",
      timezone: timezone || "UTC",
      emailNotifications: emailNotifications ?? true,
      smsNotifications: smsNotifications ?? false,
    },
  });

  // Also sync company name/phone/address if provided
  try {
    await prisma.company.update({
      where: { id: company.id },
      data: {
        ...(targetName ? { name: targetName } : {}),
        ...(contactPhone ? { phone: contactPhone } : {}),
        ...(address ? { address } : {}),
      },
    });
  } catch (e) {}

  const cacheKey = buildTenantCacheKey(company.id, "fitness-settings", {});
  try {
    await cacheDel(cacheKey);
  } catch (e) {}

  return formatResponse(true, updatedSettings, "Settings updated successfully", 200);
};

export const GET = withApiHandler(getSettingsLogic);
export const PUT = withApiHandler(putSettingsLogic);
