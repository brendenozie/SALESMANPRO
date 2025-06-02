import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb";
import { getAuthSession } from "../../../../lib/auth";

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
      AnalyticsConfig: true,
      PaymentSettings: true,
      ShippingSettings: true,
      StoreCategory: {
        include: {
          category: true,
        },
      },
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

  // Verify that the user actually owns this store:
  const existing = await prisma.company.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!existing) {
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
    stats,
    currency,
    locale,
  } = data;

  const updated = await prisma.company.update({
    where: { id: params.id },
    data: {
      // ── top‐level fields ──
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

      // ── array relations (wipe & re‐create) ──
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

      // ── ONE-TO-ONE: SEO (upsert or delete) ──
      seo: seo
        ? {
            upsert: {
              where: { id: params.id },
              create: {
                title: seo.title,
                description: seo.description,
                keywords: seo.keywords,
                // …any other SEO columns…
              },
              update: {
                title: seo.title,
                description: seo.description,
                keywords: seo.keywords,
                // …any other SEO columns…
              },
            },
          }
        : { delete: true },

      // ── AnalyticsConfig (upsert or delete) ──
      AnalyticsConfig: analyticsConfig
        ? {
            upsert: [
              {
                where: { id: analyticsConfig.id },
                update: {
                  googleTag: analyticsConfig.googleTag,
                  facebookTag: analyticsConfig.facebookTag,
                  // …any other analytics columns…
                },
                create: {
                  googleTag: analyticsConfig.googleTag,
                  facebookTag: analyticsConfig.facebookTag,
                  // …any other analytics columns…
                },
              },
            ],
          }
        : { deleteMany: {} },

      // ── PaymentSettings (upsert or delete) ──
      PaymentSettings: paymentSettings
        ? {
            upsert: {
              where: { id: paymentSettings.id },
              update: {
                mpesaShortcode: paymentSettings.provider,
                mpesaConsumerKey: paymentSettings.apiKey,
                mpesaConsumerSecret: paymentSettings.provider,
                mpesaCallbackUrl: paymentSettings.apiKey,
                // …any other payment columns…
              },
              create: {
                mpesaShortcode: paymentSettings.provider,
                mpesaConsumerKey: paymentSettings.apiKey,
                mpesaConsumerSecret: paymentSettings.provider,
                mpesaCallbackUrl: paymentSettings.apiKey,
                // …any other payment columns…
              },
            },
          }
        : { deleteMany: {} },

      // ── ShippingSettings (upsert or delete) ──
      ShippingSettings: shippingSettings
        ? {
            upsert: [
              {
                where: { id: shippingSettings.id },
                create: {
                  carrierName: shippingSettings.carrierName,
                  regions: shippingSettings.regions,
                  enablePickup: shippingSettings.enablePickup,
                  pickupInstructions: shippingSettings.pickupInstructions
                  // …any other shipping columns…
                },
                update: {
                  carrierName: shippingSettings.carrierName,
                  regions: shippingSettings.regions,
                  enablePickup: shippingSettings.enablePickup,
                  pickupInstructions: shippingSettings.pickupInstructions
                  // …any other shipping columns…
                },
              },
            ],
          }
        : { deleteMany: {} },

      // ── junction table for categories (delete existing & recreate) ──
      StoreCategory: storeCategories
        ? {
            deleteMany: {},
            create: (storeCategories || []).map((sc: any) => ({
              category: { connect: { id: sc.id } },
              displayName: sc.displayName,
              sortOrder: sc.sortOrder,
              visible: sc.visible,
            })),
          }
        : { deleteMany: {} },
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
