import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth"; // Your session utility
import { companySchema } from "@/lib/validations/company"; // Your Zod schema
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET all companies for the authenticated user
export async function GET(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const companies = await prisma.company.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST a new company
export async function POST(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parseResult = companySchema.safeParse(body);
  
  if (!parseResult.success) {
    return NextResponse.json({ errors: parseResult.error.errors }, { status: 400 });
  }

  const data = parseResult.data;

  try {
    // Note: 'heroSlides' in your schema is the 'Banner' model. Adjust field names as needed.
    const newCompany = await prisma.company.create({
      data: {
        // Spread all the direct fields from the validated data
        name: data.name,
        slug: data.slug,
        domain: data.domain,
        tagline: data.tagline,
        description: data.description,
        category: data.category,
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        hasWebsite: data.hasWebsite,
        currency: data.currency,
        locale: data.locale,
        geoLocation: data.geoLocation,
        openingHours: data.openingHours,
        themeSettings: data.themeSettings,
        awards: data.awards,
        metrics: data.metrics,
        stats: data.stats,
        pricingTiers: data.pricingTiers,

        // Securely associate with the logged-in user
        user: { connect: { id: session.user.id } },
        
        // --- Handle Nested Relations on Create ---

        // One-to-One relations
        SEO: data.seo ? { create: data.seo } : undefined,
        AnalyticsConfig: data.analyticsConfig ? { create: data.analyticsConfig } : undefined,
        PaymentSettings: data.paymentSettings ? { create: data.paymentSettings } : undefined,
        ShippingSettings: data.shippingSettings ? { create: data.shippingSettings } : undefined,
        
        // One-to-Many relations
        socialLinks: data.socialLinks ? { create: data.socialLinks } : undefined,
        policies: data.policies ? { create: data.policies } : undefined,
        faqs: data.faqs ? { create: data.faqs } : undefined,
        testimonials: data.testimonials ? { create: data.testimonials } : undefined,
        heroSlides: data.heroSlides ? { create: data.heroSlides.map(h => ({...h, endsAt: h.endsAt ? new Date(h.endsAt) : undefined})) } : undefined,
        promotions: data.promotions ? { create: data.promotions.map(p => ({...p, startsAt: p.startsAt ? new Date(p.startsAt) : undefined, endsAt: p.endsAt ? new Date(p.endsAt) : undefined})) } : undefined,
        
        // Many-to-Many relation through 'StoreCategory' join table
        StoreCategory: data.StoreCategory ? {
            create: data.StoreCategory.map(sc => ({
                displayName: sc.displayName,
                icon: sc.icon,
                sortOrder: sc.sortOrder,
                visible: sc.visible,
                subcategories: sc.subcategories,
                allBrands: sc.allBrands,
                category: { connect: { id: sc.id } } // Connect to an existing ProductCategory
            }))
        } : undefined,
      },
    });
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || [];
        return NextResponse.json(
          { error: `The slug or domain is already taken.` },
          { status: 409 }
        );
     }
    console.error("❌ Company creation failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { getAuthSession } from "@/lib/auth";
// import { companySchema } from "@/lib/validations/company";
// import { Prisma } from "@prisma/client";
// import { z } from "zod";

// export const dynamic = "force-dynamic";

// // GET all companies for the authenticated user
// export async function GET(req: Request) {
//   const session = await getAuthSession();

//   if (!session?.user?.id) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const companies = await prisma.company.findMany({
//       where: { userId: session.user.id },
//       orderBy: { createdAt: 'asc' }
//     });
//     return NextResponse.json(companies);
//   } catch (error) {
//     console.error("Failed to fetch companies:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }


// // POST a new company
// export async function POST(req: Request) {
//   const session = await getAuthSession();

//   if (!session?.user?.id) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const body = await req.json();
//   const parseResult = companySchema.safeParse(body);

//   if (!parseResult.success) {
//     return NextResponse.json({ errors: parseResult.error.errors }, { status: 400 });
//   }

//   const data = parseResult.data;

//   try {
//     const newCompany = await prisma.company.create({
//       data: {
//         ...data,
//         user: { connect: { id: session.user.id } },
//         // Handle nested relations on create
//         socialLinks: data.socialLinks ? { create: data.socialLinks } : undefined,
//         policies: data.policies ? { create: data.policies } : undefined,
//         faqs: data.faqs ? { create: data.faqs } : undefined,
//         testimonials: data.testimonials ? { create: data.testimonials } : undefined,
//         heroSlides: data.heroSlides ? { create: data.heroSlides.map(h => ({...h, endsAt: h.endsAt ? new Date(h.endsAt) : null})) } : undefined,
//         promotions: data.promotions ? { create: data.promotions.map(p => ({...p, startsAt: p.startsAt ? new Date(p.startsAt) : null, endsAt: p.endsAt ? new Date(p.endsAt) : null})) } : undefined,
//         SEO: data.seo ? { create: data.seo } : undefined,
//         AnalyticsConfig: data.analyticsConfig ? { create: data.analyticsConfig } : undefined,
//         PaymentSettings: data.paymentSettings ? { create: data.paymentSettings } : undefined,
//         ShippingSettings: data.shippingSettings ? { create: data.shippingSettings } : undefined,
//         StoreCategory: data.storeCategories ? {
//             create: data.storeCategories.map((sc, idx) => ({
//                 category: { connect: { id: sc.id } },
//                 displayName: sc.displayName,
//                 icon: sc.icon,
//                 sortOrder: sc.sortOrder ?? idx,
//                 visible: sc.visible ?? true,
//                 subcategories: sc.subcategories,
//                 allBrands: sc.allBrands,
//             }))
//         } : undefined,
//         CompanyLocation: data.companyLocations ? {
//             create: data.companyLocations.map((cl, idx) => ({
//                 location: { connect: {id: cl.locationId} },
//                 ...cl
//             }))
//         } : undefined,
//       },
//     });
//     return NextResponse.json(newCompany, { status: 201 });
//   } catch (error) {
//      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
//         const target = (error.meta?.target as string[]) || [];
//         return NextResponse.json(
//           { error: `The slug or domain '${target.join(', ')}' is already taken.` },
//           { status: 409 }
//         );
//     }
//     console.error("❌ Company creation failed:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }