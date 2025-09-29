import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { companySchema } from "@/lib/validations/company";

import { formatResponse } from "@/lib/formatResponse";

export const dynamic = "force-dynamic";

// GET a single company by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
   const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const company = await prisma.company.findFirst({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure the user owns this company
      },
      include: { // Include all related data to populate the edit form
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
        StoreCategory: {
          include: {
            category: true
          }
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Failed to fetch company:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT (update) a company
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
   const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


    // Destructure the id from params immediately
  const { id } = params;

  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use the destructured 'id' variable for the check
  if (!id) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  const body = await req.json();
  const parseResult = companySchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ errors: parseResult.error.errors }, { status: 400 });
  }

  const {
    // Destructure to separate relation data from direct company fields
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
    ...companyData // The rest are direct fields of the company
  } = parseResult.data;

  try {
    const companyToUpdate = await prisma.company.findFirst({
        where: { id: params.id, userId: session.user.id }
    });

    if (!companyToUpdate) {
        return NextResponse.json({ error: "Company not found or you do not have permission to edit it." }, { status: 404 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        // 1. Update direct company fields
        ...companyData,

        CompanyLocation: CompanyLocation ? {
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
        } : undefined,
        
        CoreValues: body.CoreValues ? {
          deleteMany: {}, // remove all existing core values for this company
          create: body.CoreValues.map((cv: any) => ({
            title: cv.title,
            description: cv.description,
            icon: cv.icon || "",
          }))
        } : undefined,
        
        // 2. Handle nested relations correctly
        
        SEO: seo ? {
          upsert: {
            create: seo,
            update: seo,
          }
        } : undefined,

        AnalyticsConfig: analyticsConfig ? { update: analyticsConfig } : undefined,
        PaymentSettings: paymentSettings ? { update: paymentSettings } : undefined,
        ShippingSettings: shippingSettings ? { update: shippingSettings } : undefined,

        socialLinks: socialLinks ? { deleteMany: {}, create: socialLinks } : undefined,
        policies: policies ? { deleteMany: {}, create: policies } : undefined,
        faqs: faqs ? { deleteMany: {}, create: faqs } : undefined,
        testimonials: testimonials ? { deleteMany: {}, create: testimonials } : undefined,
        
        heroSlides: heroSlides ? { 
            deleteMany: {}, 
            create: heroSlides.map(h => ({
                ...h, 
                endsAt: h.endsAt ? new Date(h.endsAt) : undefined
            })) 
        } : undefined,

        promotions: promotions ? { 
            deleteMany: {}, 
            create: promotions.map(p => ({
                ...p, 
                
                perks: p.perks ? p.perks.map((perk: any) => ({
                  ...perk,
                  id: perk.id || undefined,
                })) : [],
                trustLogos: p.trustLogos ? p.trustLogos.map((logo: any) => ({
                  ...logo,
                  id: logo.id || undefined,
                })) : [],
                startsAt: p.startsAt ? new Date(p.startsAt) : undefined, 
                endsAt: p.endsAt ? new Date(p.endsAt) : undefined,


            })) 
        } : undefined,

        // Simplified StoreCategory data processing
        StoreCategory: StoreCategory ? {
          deleteMany: {},
          create: StoreCategory.map((sc: any) => ({
            displayName: sc.displayName,
            icon: sc.icon,
            sortOrder: sc.sortOrder ?? 0,
            categoryId: sc.categoryId,
            subcategories: sc.subcategories, // Pass the whole JSON array as-is
            allBrands: sc.allBrands, // Pass the whole JSON array as-is
          })),
        } : undefined,
        
        // StoreCategory: StoreCategory ? {
        //   deleteMany: {},
        //   create: StoreCategory.map((sc: any) => ({
        //     displayName: sc.displayName,
        //     icon: sc.icon,
        //     sortOrder: sc.sortOrder ?? 0,
        //     category: {
        //       connect: { id: sc.categoryId },
        //     },
        //     // If subcategories are just an array of basic objects or strings:
        //     subcategories: Array.isArray(sc.subcategories) ? sc.subcategories : [],
        //     // If allBrands are just an array of strings:
        //     allBrands: Array.isArray(sc.allBrands) ? sc.allBrands : [],
        //   })),
        // } : undefined,


      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Failed to update company:", error);
    // Add more detailed logging for debugging
    if (error instanceof Error) {
        console.error(error.message);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE a company
export async function DELETE(
  req: Request,
  { params }: { params: { companyId: string } }
) {
   const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


    const session = await getAuthSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const companyToDelete = await prisma.company.findFirst({
            where: { id: params.companyId, userId: session.user.id },
            select: { sEOId: true, analyticsConfigId: true, paymentSettingsId: true, shippingSettingsId: true },
            orderBy: { createdAt: 'desc' }
        });

        if (!companyToDelete) {
            return NextResponse.json({ error: "Company not found or you do not have permission to delete it." }, { status: 404 });
        }

        // Use a transaction to ensure all related data is deleted successfully
        await prisma.$transaction(async (tx) => {
            // Manually delete related 1-to-1 records because of `onDelete: NoAction`
            if (companyToDelete.sEOId) await tx.sEO.delete({ where: { id: companyToDelete.sEOId }});
            if (companyToDelete.analyticsConfigId) await tx.analyticsConfig.delete({ where: { id: companyToDelete.analyticsConfigId }});
            if (companyToDelete.paymentSettingsId) await tx.paymentSettings.delete({ where: { id: companyToDelete.paymentSettingsId }});
            if (companyToDelete.shippingSettingsId) await tx.shippingSettings.delete({ where: { id: companyToDelete.shippingSettingsId }});

            // Now delete the company itself. Prisma will handle cascading deletes for other relations.
            await tx.company.delete({ where: { id: params.companyId } });
        });
        
        return NextResponse.json({ message: "Company deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Failed to delete company:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
