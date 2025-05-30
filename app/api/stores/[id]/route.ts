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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await getStore(params.id, session.user.id);
  if (!store) {
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
    paymentSettings,
    shippingSettings,
    storeCategories,
    awards,
    metrics,
    stats,
    id,
    currency,
    locale,
    shippingSettingsId,
    userId,
    createdAt,
    updatedAt,
    deletedAt,
    sEOId,
    AnalyticsConfig,
    PaymentSettings,
    ShippingSettings,
    StoreCategory
  } = data;

  const updated = await prisma.company.update({
    where: { id: params.id },
    data: {
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
      awards,
      metrics,
      stats,
      currency,
      locale,
      shippingSettingsId,
      userId,
      createdAt,
      updatedAt,
      deletedAt,
      sEOId,
      AnalyticsConfig,
      PaymentSettings,
      ShippingSettings,
      StoreCategory
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

  const store = await getStore(params.id, session.user.id);
  if (!store) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.company.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
