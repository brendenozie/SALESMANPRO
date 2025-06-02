// ── app/stores/[id]/edit/page.tsx ──
import React from "react";
import { redirect } from "next/navigation";
import CreateStoreForm from "../../../../components/stores/create/CreateStoreForm/CreateStoreForm";
import prisma from "../../../../server/db/prismadb";
import { StoreForm } from "../../../../types/typings";

export const dynamic = "force-dynamic";

export default async function EditStorePage({ params }: { params: { id: string } }) {
  const id = params.id;

  // Instead of calling a separate `getCompanyForEdit`, just inline it here:
  const store = await prisma.company.findUnique({
    where: { id },
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
        include: { category: true },
      },
    },
  });

  if (!store) {
    redirect("/stores");
  }

  // At this point, “store” definitely has those nested objects.
  // Convert fields to match CreateStoreForm’s “Partial<StoreForm>” shape:

    // fetch categories as before
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shop/categories`, { cache: "no-store" });
    const { categories } = await res.json();
    const availableCategories = categories.map((c: any) => ({ id: c.id, name: c.name }));

  const storeFormData : StoreForm = {
    id: store.id ?? "",
    name: store.name ?? "",
    slug: store.slug ?? "",
    domain: store.domain ?? "",
    tagline: store.tagline ?? "",
    description: store.description ?? "",
    category: store.category ?? undefined,
    logoUrl: store.logoUrl ?? "",
    bannerUrl: store.bannerUrl ?? "",
    contactEmail: store.contactEmail ?? undefined,
    contactPhone: store.contactPhone ?? "",
    address: store.address ?? "",
    geoLocation:
      store.geoLocation && typeof store.geoLocation === "string"
        ? JSON.parse(store.geoLocation)
        : store.geoLocation ?? undefined,

    openingHours:
      store.openingHours && typeof store.openingHours === "string"
        ? JSON.parse(store.openingHours)
        : store.openingHours ?? undefined,

    socialLinks: store.socialLinks.map((s: any) => ({
      id: s.id,
      channel: s.channel,
      url: s.url,
    })),

    policies: store.policies.map((p: any) => ({
      id: p.id,
      type: p.type,
      content: p.content,
    })),

    faqs: store.faqs.map((f: any) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      order: f.order,
    })),

    testimonials: store.testimonials.map((t: any) => ({
      id: t.id,
      author: t.author,
      quote: t.quote,
      rating: t.rating,
      avatarUrl: t.avatarUrl ?? undefined,
      order: t.order,
    })),

    heroSlides: store.heroSlides.map((h: any) => ({
      id: h.id,
      imageUrl: h.imageUrl,
      headline: h.headline ?? "",
      subline: h.subline ?? "",
      ctaText: h.ctaText ?? "",
      ctaLink: h.ctaLink ?? "",
      order: h.order,
    })),

    promotions: store.promotions.map((p: any) => ({
      id: p.id,
      code: p.code,
      title: p.title,
      description: p.description ?? "",
      startsAt: p.startsAt?.toISOString(),
      endsAt: p.endsAt?.toISOString(),
      bannerUrl: p.bannerUrl,
    })),

    // ONE-TO-ONES
    seo: store.seo
      ? {
          id: store.seo.id,
          title: store.seo.title,
          description: store.seo.description,
          keywords: store.seo.keywords,
          // …etc
        }
      : {},

    analyticsConfig: Array.isArray(store.AnalyticsConfig) && store.AnalyticsConfig.length > 0
      ? {
          id: store.AnalyticsConfig[0].id,
          googleTag: store.AnalyticsConfig[0].googleTag,
          facebookTag: store.AnalyticsConfig[0].facebookTag,
          companyId: store.AnalyticsConfig[0].companyId,
          // Add other fields as needed
        }
      : {},

    paymentSettings: Array.isArray(store.PaymentSettings) && store.PaymentSettings.length > 0
      ? {
          id: store.PaymentSettings[0].id,
          mpesaShortcode: store.PaymentSettings[0].mpesaShortcode,
          mpesaConsumerKey: store.PaymentSettings[0].mpesaConsumerKey,
          mpesaConsumerSecret: store.PaymentSettings[0].mpesaConsumerSecret,
          mpesaCallbackUrl: store.PaymentSettings[0].mpesaCallbackUrl,
          companyId: store.PaymentSettings[0].companyId,
          // …etc
        }
      : {},

    shippingSettings: Array.isArray(store.ShippingSettings) && store.ShippingSettings.length > 0
      ? {
          id: store.ShippingSettings[0].id,
          carrierName: store.ShippingSettings[0].carrierName,
          regions: store.ShippingSettings[0].regions,
          enablePickup: store.ShippingSettings[0].enablePickup,
          pickupInstructions: store.ShippingSettings[0].pickupInstructions,
          companyId: store.ShippingSettings[0].companyId,
          
        }
      : {},

    // JUNCTION TABLE: pull out exactly (categoryId, displayName, sortOrder, visible)
    storeCategories: store.StoreCategory.map((sc: any) => ({
      // `sc` looks like { id, companyId, categoryId, displayName, sortOrder, visible, category: { id, name, slug } }
      id: sc.categoryId,
      name: sc.name ?? "",
      sortOrder: sc.sortOrder ?? 0,
      visible: sc.visible ?? true,
    })),

    awards: Array.isArray(store.awards) ? store.awards : typeof store.awards === "string" ? JSON.parse(store.awards) : undefined,
    metrics: Array.isArray(store.metrics) ? store.metrics : typeof store.metrics === "string" ? JSON.parse(store.metrics) : undefined,
    stats: Array.isArray(store.stats) ? store.stats : typeof store.stats === "string" ? JSON.parse(store.stats) : undefined,
    themeSettings:
      typeof store.themeSettings === "string" ? JSON.parse(store.themeSettings) : store.themeSettings ?? undefined,
  };

  // Finally, pass that into your form:
  return (
    <CreateStoreForm
      availableCategories={availableCategories}
      initialData={storeFormData}
    />
  );
}
