import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { companySchema } from "@/lib/validations/company";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { revalidateCompanyCache, revalidateStore } from "@/lib/company-fetcher"; // 👈 Imported revalidateStore
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

  // ⚡ Get old values first to clear out historical domains from cache if changed
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
  const oldSlug = companyToUpdate.slug;
  const oldDomain = companyToUpdate.domain;

  // Remove `id` from the nested PaymentSettings payload
  const paymentSettingsData = paymentSettings
    ? (({ id, ...rest }: any) => rest)(paymentSettings)
    : undefined;

  // =========================
  // 🔐 PREPARE ENCRYPTED PAYMENT SETTINGS
  // =========================
  let encryptedPaymentSettings: any = null;

  if (paymentSettingsData) {
    encryptedPaymentSettings = { ...paymentSettingsData };

    if (paymentSettingsData.mpesaConsumerSecret) {
      const encrypted = encrypt(paymentSettingsData.mpesaConsumerSecret);
      encryptedPaymentSettings.mpesaSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.mpesaSecret_iv = encrypted.iv;
      encryptedPaymentSettings.mpesaSecret_tag = encrypted.tag;
      encryptedPaymentSettings.mpesaConsumerSecret = null;
    }

    if (paymentSettingsData.stripeSecretKey) {
      const encrypted = encrypt(paymentSettingsData.stripeSecretKey);
      encryptedPaymentSettings.stripeSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.stripeSecret_iv = encrypted.iv;
      encryptedPaymentSettings.stripeSecret_tag = encrypted.tag;
      encryptedPaymentSettings.stripeSecretKey = null;
    }

    if (paymentSettingsData.paypalClientSecret) {
      const encrypted = encrypt(paymentSettingsData.paypalClientSecret);
      encryptedPaymentSettings.paypalSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.paypalSecret_iv = encrypted.iv;
      encryptedPaymentSettings.paypalSecret_tag = encrypted.tag;
      encryptedPaymentSettings.paypalClientSecret = null;
    }

    if (paymentSettingsData.paystackSecretKey) {
      const encrypted = encrypt(paymentSettingsData.paystackSecretKey);
      encryptedPaymentSettings.paystackSecret_encrypted = encrypted.value;
      encryptedPaymentSettings.paystackSecret_iv = encrypted.iv;
      encryptedPaymentSettings.paystackSecret_tag = encrypted.tag;
      encryptedPaymentSettings.paystackSecretKey = null;
    }

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
              title: p.title || "Untitled",
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

  // ==========================================
  // ♻️ PRUNING NEXT.JS & REDIS/KV CACHE LAYERS
  // ==========================================
  try {
    // 1️⃣ Purge Next.js framework-level tags for both slug & custom domain variants
    if (updatedCompany.slug) await revalidateCompanyCache(updatedCompany.slug);
    if (updatedCompany.domain)
      await revalidateCompanyCache(updatedCompany.domain);

    // Fallback security if handles changed: purge historic records
    if (oldSlug && oldSlug !== updatedCompany.slug)
      await revalidateCompanyCache(oldSlug);
    if (oldDomain && oldDomain !== updatedCompany.domain)
      await revalidateCompanyCache(oldDomain);

    // 2️⃣ Purge sub-caches using your helper function (products, items, categories)
    revalidateStore(updatedCompany.id);

    // 3️⃣ Kill runtime key-value store instances
    await cacheDel(`user:${session.user.id}:companies`);
    await cacheDel(cacheKey);
  } catch (e) {
    console.error("Failed to fully invalidate company cache pipelines:", e);
  }

  return formatResponse(true, updatedCompany, "Company updated successfully");
}

// =======================
// DELETE: Delete a company
// =======================
async function deleteCompany(
  req: Request,
  { params }: { params: { id: string } }, // 👈 FIXED: Changed parameter key from companyId to 'id' to map path matching
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const { id } = params;

  const companyToDelete = await prisma.company.findFirst({
    where: { id: id, userId: session.user.id },
    select: {
      id: true,
      slug: true,
      domain: true,
      sEOId: true,
      analyticsConfigId: true,
      paymentSettingsId: true,
      shippingSettingsId: true,
    },
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

    await tx.company.delete({ where: { id: id } });
  });

  // ==========================================
  // ♻️ REMOVE ALL TRACES ON DELETION
  // ==========================================
  try {
    if (companyToDelete.slug)
      await revalidateCompanyCache(companyToDelete.slug);
    if (companyToDelete.domain)
      await revalidateCompanyCache(companyToDelete.domain);

    revalidateStore(companyToDelete.id);

    await cacheDel(`user:${session.user.id}:companies`);
    await cacheDel(`company:${id}`);
  } catch {}

  return formatResponse(true, null, "Company deleted successfully");
}

export const GET = withApiHandler(getCompany);
export const PUT = withApiHandler(updateCompany);
export const DELETE = withApiHandler(deleteCompany);
