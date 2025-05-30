// File: app/api/stores/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb";
import { getAuthSession } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

async function getStore(id: string, userId: string) {
  return prisma.company.findFirst({
    where: { id, userId },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await getStore(params.id, session.user.id);
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
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.company.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await req.json();
  // in your PUT handler, after `const data = await req.json();`
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
  seo,                   // this is a relation, handle below
  paymentSettings,       // relation
  shippingSettings,      // relation
  storeCategories,       // relation
  awards,
  metrics,
  stats,
  currency,
  locale,
} = data;


  const updated = await prisma.company.update({
    where: { id: params.id },
    data: {
      name, slug, domain, tagline, description, category,
      logoUrl, bannerUrl, contactEmail, contactPhone, address,
      geoLocation, openingHours, themeSettings, currency, locale,

      socialLinks: {
        deleteMany: {},
        create: socialLinks || []
      },
      policies: {
        deleteMany: {},
        create: policies?.map((p: { type: string; content: string }) => ({ type: p.type, content: p.content })) || []
      },
      faqs: {
        deleteMany: {},
        create: faqs?.map((f: { question: any; answer: any; }) => ({ question: f.question, answer: f.answer })) || []
      },
      testimonials: {
        deleteMany: {},
        create: testimonials?.map((t: { author: any; quote: any; rating: any; }) => ({ author: t.author, quote: t.quote, rating: t.rating })) || []
      },
      heroSlides: {
        deleteMany: {},
        create: heroSlides?.map((h: { imageUrl: any; headline: any; subline: any; ctaText: any; ctaLink: any; }) => ({
          imageUrl: h.imageUrl, headline: h.headline,
          subline: h.subline, ctaText: h.ctaText, ctaLink: h.ctaLink
        })) || []
      },
      promotions: {
        deleteMany: {},
        create: promotions?.map((p: { title: any; description: any; startsAt: string | number | Date; endsAt: string | number | Date; bannerUrl: any; }) => ({
          title: p.title, description: p.description,
          startsAt: p.startsAt ? new Date(p.startsAt) : null,
          endsAt:   p.endsAt   ? new Date(p.endsAt)   : null,
          bannerUrl: p.bannerUrl
        })) || []
      },
      awards: data.awards ? { set: JSON.stringify(data.awards) } : undefined,
      metrics: data.metrics ? { set: JSON.stringify(data.metrics) } : undefined,
      stats:   data.stats   ? { set: JSON.stringify(data.stats)   } : undefined,
    }
  });

  return NextResponse.json(updated);
}

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const session = await getAuthSession();
//   if (!session?.user?.id) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const store = await getStore(params.id, session.user.id);
//   if (!store) {
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   }

//   const data = await req.json();
//   const {
//     name,
//     slug,
//     domain,
//     tagline,
//     description,
//     category,
//     logoUrl,
//     bannerUrl,
//     contactEmail,
//     contactPhone,
//     address,
//     geoLocation,
//     openingHours,
//     socialLinks,
//     policies,
//     faqs,
//     testimonials,
//     heroSlides,
//     promotions,
//     themeSettings,
//     seo,
//     paymentSettings,
//     shippingSettings,
//     storeCategories,
//     awards,
//     metrics,
//     stats,
//     id,
//     currency,
//     locale,
//     shippingSettingsId,
//     userId,
//     createdAt,
//     updatedAt,
//     deletedAt,
//     sEOId,
//     AnalyticsConfig,
//     PaymentSettings,
//     ShippingSettings,
//     StoreCategory
//   } = data;

//   const updated = await prisma.company.update({
//     where: { id: params.id },
//     data: {
//       name,
//       slug,
//       domain,
//       tagline,
//       description,
//       category,
//       logoUrl,
//       bannerUrl,
//       contactEmail,
//       contactPhone,
//       address,
//       geoLocation,
//       openingHours,
//       socialLinks,
//       policies,
//       faqs,
//       testimonials,
//       heroSlides,
//       promotions,
//       themeSettings,
//       seo,
//       awards,
//       metrics,
//       stats,
//       currency,
//       locale,
//       shippingSettingsId,
//       userId,
//       createdAt,
//       updatedAt,
//       deletedAt,
//       sEOId,
//       AnalyticsConfig,
//       PaymentSettings,
//       ShippingSettings,
//       StoreCategory
//     },
//   });

//   return NextResponse.json(updated);
// }

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await getStore(params.id, session.user.id);
  if (!store) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.company.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
