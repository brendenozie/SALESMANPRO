import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { SocialChannel } from "@prisma/client"; // Assuming SocialChannel enum is available

// Type definition for route parameters
type SettingsParams = { params: { adminSlug: string } };

// Utility function to fetch company data with related settings
async function fetchCompanySettings(adminSlug: string) {
  return prisma.company.findUnique({
    where: { slug: adminSlug },
    select: {
      id: true,
      analyticsConfigId: true,
      paymentSettingsId: true,
      name: true,
      address: true,
      contactEmail: true,
      contactPhone: true,
      openingHours: true, // JSON field
      themeSettings: true, // JSON field
      AnalyticsConfig: { select: { isActive: true, googleTag: true, facebookTag: true, hotjarSiteId: true } },
      // PaymentSettings: { select: { stripeKey: true, paypalKey: true, mpesaShortcode: true } },
      // SocialLink: { select: { channel: true, url: true } },
    }
  });
}

// Utility function to format the fetched data for the client
function formatSettings(company: Awaited<ReturnType<typeof fetchCompanySettings>>) {
  if (!company) return null;

  return {
    clinicName: company.name,
    clinicAddress: company.address,
    clinicEmail: company.contactEmail,
    contactPhone: company.contactPhone,
    openingHours: company.openingHours,
    // Mocking notificationsEnabled from AnalyticsConfig.isActive
    // notificationsEnabled: company.AnalyticsConfig?.isActive || false,
    // themeSettings: company.themeSettings,
    // paymentSettings: {
    //   stripeKey: company.PaymentSettings?.stripeKey,
    //   paypalKey: company.PaymentSettings?.paypalKey,
    //   mpesaShortcode: company.PaymentSettings?.mpesaShortcode,
    // },
    // socialLinks: company.SocialLink,
  };
}

async function handleGetSettings(request: Request, { params }: SettingsParams) {

  const cacheKey = `admin:health-settings:${params.adminSlug || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const company = await fetchCompanySettings(params.adminSlug);

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const settings = formatSettings(company);

  try {
    if (settings) {
      await cacheSet(cacheKey, settings, 60);
    }
  } catch (e) {
    console.error("Error caching settings data:", e);
  }

  // withApiHandler will wrap this in success: true and status 200
  return formatResponse(true, settings, "Settings fetched successfully", 200);
}


async function handleUpdateSettings(request: Request, { params }: SettingsParams) {
  const { adminSlug } = params;
  const body = await request.json();

  const {
    clinicName,
    clinicAddress,
    clinicEmail,
    contactPhone,
    openingHours,
    notificationsEnabled,
    themeSettings,
    paymentSettings,
    socialLinks,
  } = body;

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true, analyticsConfigId: true, paymentSettingsId: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const companyId = company.id;

  // 1. Update Company main fields
  await prisma.company.update({
    where: { id: companyId },
    data: {
      name: clinicName,
      address: clinicAddress,
      contactEmail: clinicEmail,
      contactPhone: contactPhone,
      openingHours: openingHours,
      themeSettings: themeSettings,
      updatedAt: new Date(),
    },
  });

  // 2. Update/Create AnalyticsConfig
  const analyticsData = { isActive: notificationsEnabled };
  if (company.analyticsConfigId) {
    await prisma.analyticsConfig.update({ where: { id: company.analyticsConfigId }, data: analyticsData });
  } else if (notificationsEnabled !== undefined) {
    await prisma.analyticsConfig.create({
      data: { 
        ...analyticsData, 
        company: { 
          connect: { 
            id: companyId 
          } 
        } 
      }
    });
  }

  // 3. Update/Create PaymentSettings
  if (paymentSettings) {
    const paymentData = {
      stripeKey: paymentSettings.stripeKey,
      paypalKey: paymentSettings.paypalKey,
      mpesaShortcode: paymentSettings.mpesaShortcode,
    };
    if (company.paymentSettingsId) {
      await prisma.paymentSettings.update({ where: { id: company.paymentSettingsId }, data: paymentData });
    } else {
      await prisma.paymentSettings.create({
        data: { ...paymentData, company: { connect: { id: companyId } } }
      });
    }
  }

  // 4. Update Social Links (Delete all and recreate/upsert is the simplest atomic approach)
  if (socialLinks) {
    await prisma.socialLink.deleteMany({ where: { companyId: companyId } });
    const socialLinkData = socialLinks.map((link: any) => ({
      companyId: companyId,
      channel: link.channel as SocialChannel, // Cast to Prisma enum type
      url: link.url,
    }));
    if (socialLinkData.length > 0) {
      await prisma.socialLink.createMany({ data: socialLinkData });
    }
  }

  // Refetch data to ensure the response is up-to-date
  const updatedCompany = await fetchCompanySettings(adminSlug);
  const updatedSettings = formatSettings(updatedCompany);

  // Return success response with updated data
  
    try { await cacheDel(`admin:health-settings:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { message: "Settings updated successfully", settings: updatedSettings }, "Settings updated successfully", 200);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(handleGetSettings);
export const PUT = withApiHandler(handleUpdateSettings);
