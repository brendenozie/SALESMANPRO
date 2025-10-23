// app/api/companies/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { companySchema } from "@/lib/validations/company";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

export const dynamic = "force-dynamic";

// =======================
// GET: Retrieve a single company by ID
// =======================
async function getCompany(req: Request, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session?.user) {
    return formatResponse(false, null, "Unauthorized", 401);
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

  return formatResponse(true, company, "Company fetched successfully");
}

// =======================
// PUT: Update a company
// =======================
async function updateCompany(req: Request, { params }: { params: { id: string } }) {
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
    return formatResponse(false, parseResult.error.errors, "Validation failed", 400);
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
    return formatResponse(false, null, "Company not found or unauthorized", 404);
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

      AnalyticsConfig: analyticsConfig ? { update: analyticsConfig } : undefined,
      PaymentSettings: paymentSettings ? { update: paymentSettings } : undefined,
      ShippingSettings: shippingSettings ? { update: shippingSettings } : undefined,

      socialLinks: socialLinks ? { deleteMany: {}, create: socialLinks } : undefined,
      policies: policies ? { deleteMany: {}, create: policies } : undefined,
      faqs: faqs ? { deleteMany: {}, create: faqs } : undefined,
      testimonials: testimonials ? { deleteMany: {}, create: testimonials } : undefined,

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
              perks: p.perks ? p.perks.map((perk: any) => ({ ...perk, id: perk.id || undefined })) : [],
              trustLogos: p.trustLogos ? p.trustLogos.map((logo: any) => ({ ...logo, id: logo.id || undefined })) : [],
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
              sortOrder: sc.sortOrder ?? 0,
              categoryId: sc.categoryId,
              subcategories: sc.subcategories,
              allBrands: sc.allBrands,
            })),
          }
        : undefined,

        
    },
  });

  return formatResponse(true, updatedCompany, "Company updated successfully");
}

// =======================
// DELETE: Delete a company
// =======================
async function deleteCompany(req: Request, { params }: { params: { companyId: string } }) {
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
    return formatResponse(false, null, "Company not found or unauthorized", 404);
  }

  await prisma.$transaction(async (tx) => {
    if (companyToDelete.sEOId) await tx.sEO.delete({ where: { id: companyToDelete.sEOId } });
    if (companyToDelete.analyticsConfigId) await tx.analyticsConfig.delete({ where: { id: companyToDelete.analyticsConfigId } });
    if (companyToDelete.paymentSettingsId) await tx.paymentSettings.delete({ where: { id: companyToDelete.paymentSettingsId } });
    if (companyToDelete.shippingSettingsId) await tx.shippingSettings.delete({ where: { id: companyToDelete.shippingSettingsId } });

    await tx.company.delete({ where: { id: params.companyId } });
  });

  return formatResponse(true, null, "Company deleted successfully");
}

// =======================
// Export handlers with wrapper
// =======================
export const GET = withApiHandler(getCompany);
export const PUT = withApiHandler(updateCompany);
export const DELETE = withApiHandler(deleteCompany);
