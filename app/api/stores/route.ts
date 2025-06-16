import { NextResponse } from "next/server";
import prisma from "../../../server/db/prismadb";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Zod schemas
const urlSchema = z.string().url();
const timeRangeSchema = z.object({
  open: z.string(),  // optionally: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)?$/, "Invalid time format")
  close: z.string(),
});

const openingHoursSchema = z.record(
  z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  timeRangeSchema
);

const geoSchema = z.object({ lat: z.number(), lng: z.number() });
// const socialLinkSchema = z.object({ channel: z.string(), url: z.string() });
const policySchema = z.object({ type: z.string(), title: z.string().optional(), content: z.string() });
const socialLinkSchema = z.object({
  channel: z
    .enum(["TWITTER","FACEBOOK","INSTAGRAM" ])
    .transform((s) => s.toUpperCase()),
  url:     z.string() 
});
const faqSchema = z.object({ question: z.string(), answer: z.string(), order: z.number().optional() });
const testimonialSchema = z.object({ author: z.string(), quote: z.string(), avatarUrl: urlSchema.optional(), rating: z.number().min(1).max(5).optional(), order: z.number().optional() });
const slideSchema = z.object({ imageUrl: z.string(), headline: z.string(), subline: z.string().optional(), ctaText: z.string().optional(), ctaLink: z.string().optional(), order: z.number().optional() });
const promoSchema = z.object({ title: z.string(), description: z.string(), startsAt: z.string().optional(), endsAt: z.string().optional(), bannerUrl: z.string() });
const seoSchema = z.object({ title: z.string().optional(), description: z.string().optional(), keywords: z.array(z.string()).optional() });
const analyticsSchema = z.object({ googleTag: z.string().optional(), facebookTag: z.string().optional() });
const paymentSchema = z.object({ stripeKey: z.string().optional(), 
                                  paypalKey: z.string().optional(),
                                  mpesaShortcode: z.string().optional(),
                                  mpesaConsumerKey: z.string().optional(),
                                  mpesaConsumerSecret: z.string().optional(),
                                  mpesaCallbackUrl: z.string().optional(),
                      });
const shippingSchema = z.object({ 
                                  carrierName: z.string().optional(), 
                                  trackingUrl: z.string().optional(),
                                  regions: z.array(z.string()).optional(),
                                  enablePickup: z.boolean().optional(),
                                  pickupInstructions: z.string().optional(),
                                });
const storeCategorySchema = z.object({ id: z.string(), displayName: z.string().optional(), sortOrder: z.number().optional(), visible: z.boolean().optional() });
const awardsSchema = z.object({ name: z.string(), iconUrl: z.string() });
const metricsSchema =  z.object({ label: z.string(), value: z.string(), iconUrl: z.string().optional() }); 
const statsSchema = z.object({ label: z.string(), value: z.string(), iconUrl: z.string().optional() }); 

const storeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  domain: urlSchema.optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1),
  logoUrl: urlSchema.optional(),
  bannerUrl: urlSchema,
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  geoLocation: geoSchema.optional(),
  openingHours: openingHoursSchema.optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  policies: z.array(policySchema).optional(),
  faqs: z.array(faqSchema).optional(),
  testimonials: z.array(testimonialSchema).optional(),
  heroSlides: z.array(slideSchema).optional(),
  promotions: z.array(promoSchema).optional(),
  themeSettings: z.record(z.string(), z.any()).optional(),
  seo: seoSchema.optional(),
  analyticsConfig: analyticsSchema.optional(),
  paymentSettings: paymentSchema.optional(),
  shippingSettings: shippingSchema.optional(),
  storeCategories: z.array(storeCategorySchema).optional(),
  userId: z.string().min(1),
  currency: z.string().optional(),
  locale: z.string().optional(),
  awards:  z.array(awardsSchema).optional(),
  metrics: z.array(metricsSchema).optional(),
  stats:   z.array(statsSchema).optional(),
});

// GET /api/stores?ownerId=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const where = userId ? { userId: userId } : {};

  try {
    const stores = await prisma.company.findMany({
      where,
      // include: {
      //   // socialLinks: true,
      //   policies: true,
      //   faqs: true,
      //   testimonials: true,
      //   heroSlides: true,
      //   promotions: true,
      //   seo: true,
      //   AnalyticsConfig: true,
      //   PaymentSettings: true,
      //   ShippingSettings: true,
      //   StoreCategory: true
      // }
    });
    return NextResponse.json(stores, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching stores:", error);
    return NextResponse.json({ error: "Failed to fetch stores", detail: error.message }, { status: 500 });
  }
}

// POST /api/stores

export async function POST(req: Request) {
  const body = await req.json();
  const parseResult = storeSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ errors: parseResult.error.errors }, { status: 400 });
  }

  const data = parseResult.data;

  try {
    const store = await prisma.company.create({
      data: {
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
        geoLocation: data.geoLocation,
        openingHours: data.openingHours,
        themeSettings: data.themeSettings,
        currency: data.currency,
        locale: data.locale,
        awards: data.awards,
        metrics: data.metrics,
        stats: data.stats,
        user: {
          connect: { id: data.userId }
        },

        // ── Relations ──
        socialLinks: data.socialLinks
          ? {
              create: data.socialLinks.map((link: any) => ({
                ...link,
                channel: link.channel as any,
              })),
            }
          : undefined,

        policies: data.policies
          ? {
              create: data.policies.map((policy: any) => ({
                type: policy.type as any,
                title: policy.title,
                content: policy.content,
              })),
            }
          : undefined,

        faqs: data.faqs
          ? {
              create: data.faqs.map((f) => ({
                question: f.question,
                answer: f.answer,
                order: f.order ?? 0,
              })),
            }
          : undefined,

        testimonials: data.testimonials
          ? {
              create: data.testimonials.map((t) => ({
                author: t.author,
                quote: t.quote,
                avatarUrl: t.avatarUrl,
                rating: t.rating ?? 5,
                order: t.order ?? 0,
              })),
            }
          : undefined,

        heroSlides: data.heroSlides
          ? {
              create: data.heroSlides.map((h) => ({
                imageUrl: h.imageUrl,
                headline: h.headline,
                subline: h.subline,
                ctaText: h.ctaText,
                ctaLink: h.ctaLink,
                order: h.order ?? 0,
              })),
            }
          : undefined,

        promotions: data.promotions
          ? {
              create: data.promotions.map((p) => ({
                title: p.title,
                description: p.description,
                bannerUrl: p.bannerUrl,
                startsAt: p.startsAt ? new Date(p.startsAt) : undefined,
                endsAt: p.endsAt ? new Date(p.endsAt) : undefined,
              })),
            }
          : undefined,

        seo: data.seo
          ? {
              create: {
                title: data.seo.title,
                description: data.seo.description,
                keywords: data.seo.keywords,
              },
            }
          : undefined,

        analyticsConfig: data.analyticsConfig
          ? {
              create: {
                googleTag: data.analyticsConfig.googleTag,
                facebookTag: data.analyticsConfig.facebookTag,
              },
            }
          : undefined,

        paymentSettings: data.paymentSettings
          ? {
              create: {
                mpesaShortcode: data.paymentSettings.mpesaShortcode,
                mpesaConsumerKey: data.paymentSettings.mpesaConsumerKey,
                mpesaConsumerSecret: data.paymentSettings.mpesaConsumerSecret,
                mpesaCallbackUrl: data.paymentSettings.mpesaCallbackUrl,
              },
            }
          : undefined,

        shippingSettings: data.shippingSettings
          ? {
              create: {
                carrierName: data.shippingSettings.carrierName,
                trackingUrl: data.shippingSettings.trackingUrl,
                regions: data.shippingSettings.regions,
                enablePickup: data.shippingSettings.enablePickup,
                pickupInstructions: data.shippingSettings.pickupInstructions,
              },
            }
          : undefined,

        StoreCategory: data.storeCategories
          ? {
              create: data.storeCategories.map((sc: any) => ({
                category: { connect: { id: sc.id } },
                displayName: sc.displayName ?? "",
                icon: sc.icon ?? null,
                sortOrder: sc.sortOrder ?? 0,
                visible: sc.visible ?? true,
                items: sc.items as Prisma.InputJsonValue,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error: any) {
    console.error("❌ Store creation failed:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: error.message },
      { status: 500 }
    );
  }
}
















// export async function POST(req: Request) {
//   const body = await req.json();
//   const parseResult = storeSchema.safeParse(body);
//   if (!parseResult.success) {
//     return NextResponse.json({ errors: parseResult.error.errors }, { status: 400 });
//   }
//   const data = parseResult.data;

//   try {
//     const store = await prisma.company.create({
//       data: {
//         name: data.name,
//         slug: data.slug,
//         domain: data.domain,
//         tagline: data.tagline,
//         description: data.description,
//         category: data.category,
//         logoUrl: data.logoUrl,
//         bannerUrl: data.bannerUrl,
//         contactEmail: data.contactEmail,
//         contactPhone: data.contactPhone,
//         address: data.address,
//         geoLocation: data.geoLocation,
//         openingHours: data.openingHours,
//         themeSettings: data.themeSettings,
//         user: { connect: { id: data.userId } },
//         socialLinks: data.socialLinks
//           ? {
//               create: data.socialLinks.map((link: any) => ({
//                 ...link,
//                 channel: link.channel as any // Cast to enum type; replace 'any' with 'SocialChannel' if imported
//               }))
//             }
//           : undefined,
//         policies: data.policies
//           ? {
//               create: data.policies.map((policy: any) => ({
//                 ...policy,
//                 type: policy.type as any // Replace 'any' with 'PolicyType' if you have imported the enum
//               }))
//             }
//           : undefined,
//         faqs: data.faqs ? { create: data.faqs } : undefined,
//         testimonials: data.testimonials ? { create: data.testimonials } : undefined,
//         heroSlides: data.heroSlides ? { create: data.heroSlides } : undefined,
//         promotions: data.promotions ? { create: data.promotions.map(p => ({ ...p, startsAt: p.startsAt ? new Date(p.startsAt) : undefined, endsAt: p.endsAt ? new Date(p.endsAt) : undefined })) } : undefined,
//         seo: data.seo ? { create: data.seo } : undefined,
//         AnalyticsConfig: data.analyticsConfig ? { create: data.analyticsConfig } : undefined,
//         PaymentSettings: data.paymentSettings ? { create: data.paymentSettings } : undefined,
//         ShippingSettings: data.shippingSettings ? { create: data.shippingSettings } : undefined,
//         awards:  data.awards ,
//         metrics: data.metrics ,
//         stats:   data.stats ,
//         StoreCategory: data.storeCategories ? { create: data.storeCategories.map((sc:any) => ({ category: { connect: { id: sc.id } }, displayName: sc.displayName, sortOrder: sc.sortOrder, visible: sc.visible })) } : undefined
//       }
//     });
//     return NextResponse.json(store, { status: 201 });
//   } catch (error: any) {
//     console.error("Store creation error:", error);
//     return NextResponse.json({ error: "Internal server error", detail: error.message }, { status: 500 });
//   }
// }
