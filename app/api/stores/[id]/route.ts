// app/api/companies/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { companySchema } from "@/lib/validations/company";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { revalidateCompanyCache } from "@/lib/company-fetcher";
import { encrypt } from "@/lib/crypto/aes";
import { cacheDel, cacheGet, cacheSet } from "@/lib/cache";

export const dynamic = "force-dynamic";

// =======================
// GET: Retrieve a single company by ID
// =======================
async function getCompany(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getAuthSession();
  if (!session?.user) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const cacheKey = `company:${params.id}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return formatResponse(true, cached, "Company retrieved from cache");
    }
  } catch (e) {
    console.error("Failed to retrieve company from cache:", e);
  }

  const company = await prisma.company.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      SEO: true,
      AnalyticsConfig: true,
      PaymentSettings: true,
      ShippingSettings: true,
      socialLinks: true,
      policies: true,
      faqs: true,
      testimonials: true,
      heroSlides: true,
      promotions: true,
      StoreCategory: { include: { category: true } },
    },
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  try {
    await cacheSet(cacheKey, company, 300); // Cache for 5 minutes
  } catch (e) {
    console.error("Failed to cache company data:", e);
  }

  return formatResponse(true, company, "Company fetched successfully");
}

// =======================
// PUT: Update a company
// =======================
async function updateCompany(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return formatResponse(false, null, "Company ID is required", 400);
  }

  const body = await req.json();
  const parseResult = companySchema.safeParse(body);

  if (!parseResult.success) {
    return formatResponse(
      false,
      parseResult.error.errors,
      "Validation failed",
      400,
    );
  }

  const {
    seo,
    analyticsConfig,
    paymentSettings,
    shippingSettings,
    socialLinks,
    policies,
    faqs,
    testimonials,
    heroSlides,
    promotions,
    CompanyLocation,
    StoreCategory,
    ...companyData
  } = parseResult.data;

  const companyToUpdate = await prisma.company.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!companyToUpdate) {
    return formatResponse(
      false,
      null,
      "Company not found or unauthorized",
      404,
    );
  }

  const cacheKey = `company:${id}`;

  const existingPaymentSettingsId = companyToUpdate.paymentSettingsId;
  // Remove `id` from the nested PaymentSettings payload because Prisma's update/create inputs do not accept the related record's id field.
  const paymentSettingsData = paymentSettings
    ? (({ id, ...rest }: any) => rest)(paymentSettings)
    : undefined;

  // =========================
  // 🔐 PREPARE ENCRYPTED PAYMENT SETTINGS
  // =========================
  let encryptedPaymentSettings: any = null;

  if (paymentSettingsData) {
    encryptedPaymentSettings = { ...paymentSettingsData };

    // M-PESA SECRET
    if (paymentSettingsData.mpesaConsumerSecret) {
      const encrypted = encrypt(paymentSettingsData.mpesaConsumerSecret);
      encryptedPaymentSettings.mpesaSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.mpesaSecret_iv = encrypted.iv;
      encryptedPaymentSettings.mpesaSecret_tag = encrypted.tag;
      encryptedPaymentSettings.mpesaConsumerSecret = null;
    }

    // STRIPE SECRET
    if (paymentSettingsData.stripeSecretKey) {
      const encrypted = encrypt(paymentSettingsData.stripeSecretKey);
      encryptedPaymentSettings.stripeSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.stripeSecret_iv = encrypted.iv;
      encryptedPaymentSettings.stripeSecret_tag = encrypted.tag;
      encryptedPaymentSettings.stripeSecretKey = null;
    }

    // PAYPAL SECRET
    if (paymentSettingsData.paypalClientSecret) {
      const encrypted = encrypt(paymentSettingsData.paypalClientSecret);
      encryptedPaymentSettings.paypalSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.paypalSecret_iv = encrypted.iv;
      encryptedPaymentSettings.paypalSecret_tag = encrypted.tag;
      encryptedPaymentSettings.paypalClientSecret = null;
    }

    // PAYSTACK SECRET
    if (paymentSettingsData.paystackSecretKey) {
      const encrypted = encrypt(paymentSettingsData.paystackSecretKey);
      encryptedPaymentSettings.paystackSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.paystackSecret_iv = encrypted.iv;
      encryptedPaymentSettings.paystackSecret_tag = encrypted.tag;
      encryptedPaymentSettings.paystackSecretKey = null;
    }

    // GHUBA API SECRET
    if (paymentSettingsData.ghubaApiKey) {
      const encrypted = encrypt(paymentSettingsData.ghubaApiKey);
      encryptedPaymentSettings.ghubaSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.ghubaSecret_iv = encrypted.iv;
      encryptedPaymentSettings.ghubaSecret_tag = encrypted.tag;
      encryptedPaymentSettings.ghubaApiKey = null;
    }
  }

  const updatedCompany = await prisma.company.update({
    where: { id },
    data: {
      ...companyData,
      CompanyLocation: CompanyLocation
        ? {
            deleteMany: {},
            create: CompanyLocation.map((cl: any) => ({
              locationId: cl.locationId,
              visible: cl.visible ?? true,
              sortOrder: cl.sortOrder ?? 0,
              displayName: cl.displayName ?? null,
              addressLine1Override: cl.addressLine1Override ?? null,
              addressLine2Override: cl.addressLine2Override ?? null,
              cityOverride: cl.cityOverride ?? null,
              stateOverride: cl.stateOverride ?? null,
              postalCodeOverride: cl.postalCodeOverride ?? null,
              countryOverride: cl.countryOverride ?? null,
              latitudeOverride: cl.latitudeOverride ?? null,
              longitudeOverride: cl.longitudeOverride ?? null,
            })),
          }
        : undefined,

      CoreValues: body.CoreValues
        ? {
            deleteMany: {},
            create: body.CoreValues.map((cv: any) => ({
              title: cv.title,
              description: cv.description,
              icon: cv.icon || "",
            })),
          }
        : undefined,

      SEO: seo
        ? {
            upsert: { create: seo, update: seo },
          }
        : undefined,

      AnalyticsConfig: analyticsConfig
        ? { update: analyticsConfig }
        : undefined,
      // PaymentSettings: paymentSettings
      //           ? {
      //                 // Use upsert to handle both creation and updates
      //                 upsert: {
      //                     // 1. Where: Targets the related record using the foreign key
      //                     where: {
      //                         // If an ID exists, use it. If not, use a dummy value to trigger the 'create' block.
      //                         id: existingPaymentSettingsId || "non-existent-id",
      //                     },
      //                     // 2. Update: What to do if the record is found
      //                     update: paymentSettingsData as any,
      //                     // 3. Create: What to do if the record is not found
      //                     create: paymentSettingsData as any,
      //                 },
      //             }
      //           : undefined,

      PaymentSettings: paymentSettings
        ? {
            upsert: {
              where: {
                id: existingPaymentSettingsId || "non-existent-id",
              },
              update: encryptedPaymentSettings,
              create: encryptedPaymentSettings,
            },
          }
        : undefined,

      ShippingSettings: shippingSettings
        ? { update: shippingSettings }
        : undefined,

      socialLinks: socialLinks
        ? { deleteMany: {}, create: socialLinks }
        : undefined,
      policies: policies ? { deleteMany: {}, create: policies } : undefined,
      faqs: faqs ? { deleteMany: {}, create: faqs } : undefined,
      testimonials: testimonials
        ? { deleteMany: {}, create: testimonials }
        : undefined,

      heroSlides: heroSlides
        ? {
            deleteMany: {},
            create: heroSlides.map((h) => ({
              ...h,
              endsAt: h.endsAt ? new Date(h.endsAt) : undefined,
            })),
          }
        : undefined,

      promotions: promotions
        ? {
            deleteMany: {},
            create: promotions.map((p) => ({
              ...p,
              title: p.title || "Untitled", // Ensure title is always a string
              perks: p.perks
                ? p.perks.map((perk: any) => ({
                    ...perk,
                    id: perk.id || undefined,
                  }))
                : [],
              trustLogos: p.trustLogos
                ? p.trustLogos.map((logo: any) => ({
                    ...logo,
                    id: logo.id || undefined,
                  }))
                : [],
              startsAt: p.startsAt ? new Date(p.startsAt) : undefined,
              endsAt: p.endsAt ? new Date(p.endsAt) : undefined,
            })),
          }
        : undefined,

      StoreCategory: StoreCategory
        ? {
            deleteMany: {},
            create: StoreCategory.map((sc: any) => ({
              displayName: sc.displayName,
              icon: sc.icon,
              image: sc.image,
              sortOrder: sc.sortOrder ?? 0,
              categoryId: sc.categoryId,
              subcategories: sc.subcategories,
              allBrands: sc.allBrands,
            })),
          }
        : undefined,
    },
  });

  revalidateCompanyCache(updatedCompany.slug || "");

  try {
    await cacheDel(`user:${session.user.id}:companies`);
    await cacheDel(cacheKey);
  } catch (e) {
    console.error("Failed to invalidate company cache:", e);
  }

  return formatResponse(true, updatedCompany, "Company updated successfully");
}

// =======================
// DELETE: Delete a company
// =======================
async function deleteCompany(
  req: Request,
  { params }: { params: { companyId: string } },
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const companyToDelete = await prisma.company.findFirst({
    where: { id: params.companyId, userId: session.user.id },
    select: {
      sEOId: true,
      analyticsConfigId: true,
      paymentSettingsId: true,
      shippingSettingsId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!companyToDelete) {
    return formatResponse(
      false,
      null,
      "Company not found or unauthorized",
      404,
    );
  }

  await prisma.$transaction(async (tx) => {
    if (companyToDelete.sEOId)
      await tx.sEO.delete({ where: { id: companyToDelete.sEOId } });
    if (companyToDelete.analyticsConfigId)
      await tx.analyticsConfig.delete({
        where: { id: companyToDelete.analyticsConfigId },
      });
    if (companyToDelete.paymentSettingsId)
      await tx.paymentSettings.delete({
        where: { id: companyToDelete.paymentSettingsId },
      });
    if (companyToDelete.shippingSettingsId)
      await tx.shippingSettings.delete({
        where: { id: companyToDelete.shippingSettingsId },
      });

    await tx.company.delete({ where: { id: params.companyId } });
  });

  try {
    await cacheDel(`user:${session.user.id}:companies`);
    await cacheDel(`company:${params.companyId}`);
  } catch {}

  return formatResponse(true, null, "Company deleted successfully");
}

// =======================
// Export handlers with wrapper
// =======================
export const GET = withApiHandler(getCompany);
export const PUT = withApiHandler(updateCompany);
export const DELETE = withApiHandler(deleteCompany);
