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
      analyticsConfig: true,
      paymentSettings: true,
      shippingSettings: true,
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
    stats,
    currency,
    locale,
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

          // ── ONE-TO-ONE: SEO (upsert or delete) ──
      // seo: seo
      // ? {
      //     upsert: {
      //       where: { id: params.id },
      //       create: {
      //         title: seo.title,
      //         description: seo.description,
      //         keywords: seo.keywords,
      //         // …any other SEO columns…
      //       },
      //       update: {
      //         title: seo.title,
      //         description: seo.description,
      //         keywords: seo.keywords,
      //         // …any other SEO columns…
      //       },
      //     },
      //   }
      // : { delete: true },

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


    // ── AnalyticsConfig (upsert or delete) ──
    // AnalyticsConfig: analyticsConfig
    //   ? {
    //       upsert: [
    //         {
    //           where: { id: analyticsConfig.id },
    //           update: {
    //             googleTag: analyticsConfig.googleTag,
    //             facebookTag: analyticsConfig.facebookTag,
    //             // …any other analytics columns…
    //           },
    //           create: {
    //             googleTag: analyticsConfig.googleTag,
    //             facebookTag: analyticsConfig.facebookTag,
    //             // …any other analytics columns…
    //           },
    //         },
    //       ],
    //     }
    //   : { deleteMany: {} },

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

    // ── junction table for categories (delete existing & recreate) ──
    // StoreCategory: storeCategories
    //   ? {
    //       deleteMany: {},
    //       create: (storeCategories || []).map((sc: any) => ({
    //         category: { connect: { id: sc.id } },
    //         displayName: sc.displayName,
    //         sortOrder: sc.sortOrder,
    //         visible: sc.visible,
    //       })),
    //     }
    //   : { deleteMany: {} },
    StoreCategory: storeCategories
  ? {
      deleteMany: {},
      create: (storeCategories || []).map((sc: any) => ({
        category:   { connect: { id: sc.id } },
        displayName: sc.name,
        icon:        sc.icon,
        sortOrder:   sc.sortOrder ?? 0,
        visible:     sc.visible ?? true,
        items:       sc.items  // <-- sc.items must be an array of subcategory objects
      })),
    }
  : { deleteMany: {} },


      // ── ONE‐TO‐ONE: AnalyticsConfig ──
      // AnalyticsConfig: analyticsConfig
      //   ? {
      //       upsert: {
      //         where: { id: analyticsConfig.id }, // use the AnalyticsConfig row’s ID
      //         create: {
      //           googleTag: analyticsConfig.googleTag,
      //           facebookTag: analyticsConfig.facebookTag,
      //           // …other AnalyticsConfig columns…
      //           // company: { connect: { id: params.id } },
      //         },
      //         update: {
      //           googleTag: analyticsConfig.googleTag,
      //           facebookTag: analyticsConfig.facebookTag,
      //           // …other AnalyticsConfig columns…
      //         },
      //       },
      //     }
      //   : {
      //       delete: true,
      //     },

      // // ── ONE‐TO‐ONE: PaymentSettings ──
      // PaymentSettings: paymentSettings
      //   ? {
      //       upsert: {
      //         where: { id: paymentSettings.id }, // use the PaymentSettings row’s ID
      //         create: {
      //           mpesaShortcode: paymentSettings.mpesaShortcode,
      //           mpesaConsumerKey: paymentSettings.mpesaConsumerKey,
      //           mpesaConsumerSecret: paymentSettings.mpesaConsumerSecret,
      //           mpesaCallbackUrl: paymentSettings.mpesaCallbackUrl,
      //           // …any other PaymentSettings columns…
      //           // company: { connect: { id: params.id } },
      //         },
      //         update: {
      //           mpesaShortcode: paymentSettings.mpesaShortcode,
      //           mpesaConsumerKey: paymentSettings.mpesaConsumerKey,
      //           mpesaConsumerSecret: paymentSettings.mpesaConsumerSecret,
      //           mpesaCallbackUrl: paymentSettings.mpesaCallbackUrl,
      //           // …any other PaymentSettings columns…
      //         },
      //       },
      //     }
      //   : {
      //       delete: true,
      //     },

      // // ── ONE‐TO‐ONE: ShippingSettings ──
      // ShippingSettings: shippingSettings
      //   ? {
      //       upsert: {
      //         where: { id: shippingSettings.id }, // use the ShippingSettings row’s ID
      //         create: {
      //           carrierName: shippingSettings.carrierName,
      //           trackingUrl: shippingSettings.trackingUrl,
      //           regions: shippingSettings.regions,
      //           enablePickup: shippingSettings.enablePickup,
      //           pickupInstructions: shippingSettings.pickupInstructions,
      //           // …any other ShippingSettings columns…
      //           // company: { connect: { id: params.id } },
      //         },
      //         update: {
      //           carrierName: shippingSettings.carrierName,
      //           trackingUrl: shippingSettings.trackingUrl,
      //           regions: shippingSettings.regions,
      //           enablePickup: shippingSettings.enablePickup,
      //           pickupInstructions: shippingSettings.pickupInstructions,
      //           // …any other ShippingSettings columns…
      //         },
      //       },
      //     }
      //   : {
      //       delete: true,
      //     },

      // // ── Junction table: StoreCategory ──
      // // We “deleteMany” all existing category‐rows, then re‐create them from the payload.
      // StoreCategory: storeCategories
      //   ? {
      //       deleteMany: {},
      //       create: (storeCategories || []).map((sc: any) => ({
      //         // The front end sent sc.id (the ProductCategory ID) and sc.name.
      //         // We’ll use “sc.name” as the “displayName” in the join table,
      //         // and provide defaults for “sortOrder” + “visible” (which the user didn’t actually edit).
      //         category: { connect: { id: sc.id } },
      //         displayName: sc.name ?? "",     // use “name” as “displayName”
      //         sortOrder: 0,                   // default to 0; adjust if you have a UI to reorder
      //         visible: true,                  // default to “true”; adjust if you let the user toggle visibility
      //       })),
      //     }
      //   : {
      //       deleteMany: {},
      //     },
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
