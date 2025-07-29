import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "../../../../lib/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.company.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      socialLinks: true,
      policies: true,
      faqs: true,
      testimonials: true,
      heroSlides: true,
      promotions: true,
      seo: true,
      analyticsConfig: true,
      paymentSettings: true,
      shippingSettings: true,
      StoreCategory: {
        include: {
          category: true,
        },
      },
      CompanyLocation:{
        include:{
          location:true
        }
      }
    },
  });

  if (!store) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify that the store belongs to the current user
  const existingStore = await prisma.company.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!existingStore) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = await req.json();

  const {
    name,
    slug,
    domain,
    tagline,
    description,
    category,
    logoUrl,
    bannerUrl,
    contactEmail,
    contactPhone,
    address,
    geoLocation,
    openingHours,
    socialLinks,
    policies,
    faqs,
    testimonials,
    heroSlides,
    promotions,
    themeSettings,
    seo,
    analyticsConfig,
    paymentSettings,
    shippingSettings,
    storeCategories,
    awards,
    metrics,
    pricingTiers,
    stats,
    currency,
    locale,
    hasWebsite,
    companyLocations
  } = data;

  const updated = await prisma.company.update({
    where: { id: params.id },
    data: {
      // ── Top‐level Company fields ──
      name,
      slug,
      domain,
      tagline,
      description,
      category,
      logoUrl,
      bannerUrl,
      contactEmail,
      contactPhone,
      address,
      geoLocation,
      openingHours,
      themeSettings,
      currency,
      locale,
      awards,
      metrics,
      stats,
      pricingTiers,
      hasWebsite,

      // ── Array relations: wipe & re‐create ──
      socialLinks: {
        deleteMany: {},
        create: (socialLinks || []).map(({ id, companyId, ...rest }: any) => rest),
      },
      policies: {
        deleteMany: {},
        create: (policies || []).map(({ id, companyId, ...p }: any) => ({
          type: p.type,
          content: p.content,
        })),
      },
      faqs: {
        deleteMany: {},
        create: (faqs || []).map(({ id, companyId, ...f }: any) => ({
          question: f.question,
          answer: f.answer,
        })),
      },
      testimonials: {
        deleteMany: {},
        create: (testimonials || []).map(({ id, companyId, ...t }: any) => ({
          author: t.author,
          quote: t.quote,
          rating: t.rating,
        })),
      },
      heroSlides: {
        deleteMany: {},
        create: (heroSlides || []).map(({ id, companyId, ...h }: any) => ({
          imageUrl: h.imageUrl,
          productImageUrl: h.productImageUrl,
          headline: h.headline,
          subline: h.subline,
          ctaText: h.ctaText,
          ctaLink: h.ctaLink,
        })),
      },
      promotions: {
        deleteMany: {},
        create: (promotions || []).map(({ id, companyId, ...p }: any) => ({
          title: p.title,
          description: p.description,
          startsAt: p.startsAt ? new Date(p.startsAt) : null,
          endsAt: p.endsAt ? new Date(p.endsAt) : null,
          bannerUrl: p.bannerUrl,
        })),
      },

      
      // ── ONE‐TO‐ONE: SEO ──
      // The “where” here must point to the SEO row’s own unique field.
      seo: seo
        ? {
            upsert: {
              where: { id: seo.id }, // use the actual SEO row’s ID
              create: {
                title: seo.title,
                description: seo.description,
                // If your SEO table has a “keywords” field of type JSON or String[], you can insert it directly:
                keywords: seo.keywords,
                // …any other SEO columns…
                // company: { connect: { id: params.id } },
              },
              update: {
                title: seo.title,
                description: seo.description,
                keywords: seo.keywords,
                // …any other SEO columns…
              },
            },
          }
        : {
            // If the client removed the SEO payload, delete the existing SEO row entirely
            delete: true,
          },
          
      analyticsConfig: analyticsConfig
        ? {
            upsert: {
              where: { id: analyticsConfig.id },
              create: {
                googleTag: analyticsConfig.googleTag,
                facebookTag: analyticsConfig.facebookTag,
              },
              update: {
                googleTag: analyticsConfig.googleTag,
                facebookTag: analyticsConfig.facebookTag,
              },
            },
          }
        : { delete: true },
    // ── PaymentSettings (upsert or delete) ──
    paymentSettings: paymentSettings
      ? {
          upsert: {
            where: { id: paymentSettings.id },
            update: {
              mpesaShortcode: paymentSettings.mpesaShortcode,
              mpesaConsumerKey: paymentSettings.mpesaConsumerKey,
              mpesaConsumerSecret: paymentSettings.mpesaConsumerSecret,
              mpesaCallbackUrl: paymentSettings.mpesaCallbackUrl,
              // …any other payment columns…
            },
            create: {
              mpesaShortcode: paymentSettings.mpesaShortcode,
              mpesaConsumerKey: paymentSettings.mpesaConsumerKey,
              mpesaConsumerSecret: paymentSettings.mpesaConsumerSecret,
              mpesaCallbackUrl: paymentSettings.mpesaCallbackUrl,
              // …any other payment columns…
            },
          },
        }
      : { delete: true },

    // ── ShippingSettings (upsert or delete) ──
    shippingSettings: shippingSettings
      ? {
          upsert: {
            update: {
              carrierName: shippingSettings.carrierName,
              regions: shippingSettings.regions,
              enablePickup: shippingSettings.enablePickup,
              trackingUrl:shippingSettings.trackingUrl,
              pickupInstructions: shippingSettings.pickupInstructions
              // …any other shipping columns…
            },
            create: {
              carrierName: shippingSettings.carrierName,
              regions: shippingSettings.regions,
              enablePickup: shippingSettings.enablePickup,
              trackingUrl:shippingSettings.trackingUrl,
              pickupInstructions: shippingSettings.pickupInstructions
              // …any other shipping columns…
            },
          },
        }
      : { delete: true },

      StoreCategory: {
        // 1) delete any links *not* in our new list
        deleteMany: {
          categoryId: { notIn: data.storeCategories.map((sc:any) => sc.categoryId) },
        },
        // 2) for each incoming item, upsert on the composite unique
        upsert: storeCategories.map((sc:any, idx:any) => ({
          where: {
            companyId_categoryId: {
              companyId: params.id,
              categoryId: sc.categoryId,
            },
          },
          create: {
            category:    { connect: { id: sc.categoryId } },
            displayName: sc.displayName ?? sc.name,
            icon:        sc.icon ?? null,
            sortOrder:   sc.sortOrder ?? idx,
            visible:     sc.visible ?? true,
            items:       sc.items as Prisma.InputJsonValue,
          },
          update: {
            displayName: sc.displayName ?? sc.name,
            icon:        sc.icon ?? null,
            sortOrder:   sc.sortOrder ?? idx,
            visible:     sc.visible ?? true,
            items:       sc.items as Prisma.InputJsonValue,
          },
        })),
      },

       CompanyLocation: {
          // 1) Delete any StoreCategory links that are no longer in the incoming list
          deleteMany: {
            locationId: { notIn: companyLocations.map((cl: any) => cl.locationId) }, // Use locationId from incoming companyLocations
            companyId: params.id, // Ensure we only delete for this company
          },
          // 2) For each incoming CompanyLocation, upsert the StoreCategory
          upsert: companyLocations.map((cl: any, idx: number) => ({
            where: {
              companyId_locationId: { // Use the unique constraint for CompanyLocation
                companyId: params.id,
                locationId: cl.locationId,
              },
            },
            create: {
              // Connect to the Location model using locationId
              location: { connect: { id: cl.locationId } },
              // Add other fields from CompanyLocationType
              displayName: cl.displayName,
              addressLine1Override: cl.addressLine1Override,
              addressLine2Override: cl.addressLine2Override,
              cityOverride: cl.cityOverride,
              stateOverride: cl.stateOverride,
              postalCodeOverride: cl.postalCodeOverride,
              countryOverride: cl.countryOverride,
              latitudeOverride: cl.latitudeOverride,
              longitudeOverride: cl.longitudeOverride,
              sortOrder: cl.sortOrder ?? idx, // Use incoming sortOrder or default to index
              visible: cl.visible ?? true, // Use incoming visible or default to true
            },
            update: {
              displayName: cl.displayName,
              addressLine1Override: cl.addressLine1Override,
              addressLine2Override: cl.addressLine2Override,
              cityOverride: cl.cityOverride,
              stateOverride: cl.stateOverride,
              postalCodeOverride: cl.postalCodeOverride,
              countryOverride: cl.countryOverride,
              latitudeOverride: cl.latitudeOverride,
              longitudeOverride: cl.longitudeOverride,
              sortOrder: cl.sortOrder ?? idx,
              visible: cl.visible ?? true,
            },
          })),
        },
    
        },
    
  });

  return NextResponse.json(updated);
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.company.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!store) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.company.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
