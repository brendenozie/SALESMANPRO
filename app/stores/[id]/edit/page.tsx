// app/stores/[id]/edit/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import CreateStoreForm from "../../../../components/stores/create/CreateStoreForm/CreateStoreForm";
import prisma from "../../../../server/db/prismadb";
import { StoreForm } from "../../../../types/typings";

export const dynamic = "force-dynamic";

export default async function EditStorePage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  // ── Fetch the company WITH its one‐to‐one relations ──
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

      // Now singular, not array:
      analyticsConfig: true,
      paymentSettings: true,
      shippingSettings: true,

      StoreCategory: {
        include: { category: true },
      },
    },
  });


  console.log(store);

  if (!store) {
    // If not found, redirect out
    redirect("/stores");
  }

  // ── Fetch “availableCategories” from your external API ──
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/get-all-categories`,
    { cache: "no-store" }
  );
  
  const  data  = await res.json();
  
  const availableCategories = data.results;

  console.log(availableCategories);

  // ── Map the Prisma object into your StoreForm shape ──
  const storeFormData: StoreForm = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    domain: store.domain ?? "",
    tagline: store.tagline ?? "",
    description: store.description ?? "",
    category: store.category,
    logoUrl: store.logoUrl ?? "",
    bannerUrl: store.bannerUrl ?? "",
    contactEmail: store.contactEmail ?? "",
    contactPhone: store.contactPhone ?? "",
    address: store.address ?? "",
    geoLocation:
      typeof store.geoLocation === "string"
        ? JSON.parse(store.geoLocation)
        : store.geoLocation,

    openingHours:
      typeof store.openingHours === "string"
        ? JSON.parse(store.openingHours)
        : store.openingHours,

    socialLinks: store.socialLinks.map((s) => ({
      id: s.id,
      channel: s.channel,
      url: s.url,
    })),

    policies: store.policies.map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title ?? undefined,
      content: p.content,
    })),

    faqs: store.faqs.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      order: f.order,
    })),

    testimonials: store.testimonials.map((t) => ({
      id: t.id,
      author: t.author,
      quote: t.quote,
      rating: t.rating ?? undefined,
      avatarUrl: t.avatarUrl ?? undefined,
      order: t.order,
    })),

    heroSlides: store.heroSlides.map((h) => ({
      id: h.id,
      imageUrl: h.imageUrl,
      headline: h.headline ?? "",
      subline: h.subline ?? "",
      ctaText: h.ctaText ?? "",
      ctaLink: h.ctaLink ?? "",
      order: h.order,
    })),

    promotions: store.promotions.map((p) => ({
      id: p.id,
      code: p.code ?? undefined,
      title: p.title,
      description: p.description ?? "",
      startsAt: p.startsAt?.toISOString() ?? undefined,
      endsAt: p.endsAt?.toISOString() ?? undefined,
      bannerUrl: p.bannerUrl ?? "",
    })),

    // ── ONE‐TO‐ONE: seo (always object for Record<string, any>) ──
    seo: store.seo
      ? {
          id: store.seo.id,
          title: store.seo.title,
          description: store.seo.description,
          keywords: store.seo.keywords,
        }
      : {},

    // ── ONE‐TO‐ONE: analyticsConfig (or undefined) ──
    analyticsConfig: store.analyticsConfig
      ? {
          id: store.analyticsConfig.id,
          googleTag: store.analyticsConfig.googleTag ?? "",
          facebookTag: store.analyticsConfig.facebookTag ?? "",
          // companyId: store.analyticsConfig.companyId,
        }
      : {},

    // ── ONE‐TO‐ONE: paymentSettings (or undefined) ──
    paymentSettings: store.paymentSettings
      ? {
          id: store.paymentSettings.id,
          stripeKey: store.paymentSettings.stripeKey ?? "",
          paypalKey: store.paymentSettings.paypalKey ?? "",
          mpesaShortcode: store.paymentSettings.mpesaShortcode ?? "",
          mpesaConsumerKey: store.paymentSettings.mpesaConsumerKey ?? "",
          mpesaConsumerSecret: store.paymentSettings.mpesaConsumerSecret ?? "",
          mpesaCallbackUrl: store.paymentSettings.mpesaCallbackUrl ?? "",
          // companyId: store.paymentSettings.companyId,
        }
      : {},

    // ── ONE‐TO‐ONE: shippingSettings (or undefined) ──
    shippingSettings: store.shippingSettings
      ? {
          id: store.shippingSettings.id,
          carrierName: store.shippingSettings.carrierName ?? "",
          trackingUrl: store.shippingSettings.trackingUrl ?? "",
          regions: store.shippingSettings.regions ?? [],
          enablePickup: store.shippingSettings.enablePickup ?? false,
          pickupInstructions: store.shippingSettings.pickupInstructions ?? "",
          // companyId: store.shippingSettings.companyId,
        }
      : {},

    // ── JUNCTION TABLE: StoreCategory[] ──
    storeCategories: store.StoreCategory.map((sc) => ({
      id: sc.categoryId,
      name: sc.displayName ?? sc.category.name,
      icon: sc.icon ?? undefined,
      items: Array.isArray(sc.items)
        ? sc.items
        : typeof sc.items === "string"
        ? JSON.parse(sc.items)
        : [],
      sortOrder: sc.sortOrder,
      visible: sc.visible,
    })),

    awards: Array.isArray(store.awards) ? store.awards : typeof store.awards === "string" ? JSON.parse(store.awards) : undefined,
    metrics: Array.isArray(store.metrics) ? store.metrics : typeof store.metrics === "string" ? JSON.parse(store.metrics) : undefined,
    stats: Array.isArray(store.stats) ? store.stats : typeof store.stats === "string" ? JSON.parse(store.stats) : undefined,
    
    themeSettings:
      typeof store.themeSettings === "string"
        ? JSON.parse(store.themeSettings)
        : store.themeSettings ?? undefined,
  };

  return (
    <CreateStoreForm
      availableCategories={availableCategories}
      initialData={storeFormData}
    />
  );
}
