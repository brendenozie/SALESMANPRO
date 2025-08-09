// app/stores/[id]/edit/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import CreateStoreForm from "@/components/stores/create/CreateStoreForm/CreateStoreForm";
import prisma from "@/server/db/prismadb";
import { PolicyType, SocialChannel, StoreForm } from "@/types/typings";

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

      CompanyLocation:{
        include:{
          location: true
        }
      }
    },
  });

  if (!store) {
    // If not found, redirect out
    redirect("/stores");
  }

  // ── Fetch “availableCategories” from your external API ──
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/get-all-categories`,
    { cache: 'no-store' }
  );
  const dataCategories = await res.json();
  
  const availableCategories = dataCategories.results;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/locations`);

  const dataLoctions = await response.json();
      
  const availableLocations = dataLoctions.data || [];

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
      channel: s.channel as unknown as SocialChannel,
      url: s.url,
    })),

    policies: store.policies.map((p) => ({
      id: p.id,
      type: p.type as unknown as unknown as PolicyType,
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
      authorId: t.authorId,
      authorName: t.authorName,
      author: t.authorId,
      quote: t.quote,
      rating: t.rating ?? undefined,
      avatarUrl: t.avatarUrl ?? undefined,
      order: t.order,
    })),

    heroSlides: store.heroSlides.map((h) => ({
      id: h.id,
      imageUrl: h.imageUrl,
      productImageUrl: h.productImageUrl ?? "",
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
      companyId: sc.companyId,
      categoryId: sc.categoryId,
      displayName: sc.displayName ?? sc.category.name,
      category: sc.category,
      id: sc.id,
      name: sc.displayName ?? sc.category.name,
      icon: sc.icon ?? "",
      items: Array.isArray(sc.items)
        ? sc.items
        : typeof sc.items === "string"
        ? JSON.parse(sc.items)
        : [],
      allBrands: Array.isArray(sc.allBrands)
        ? sc.allBrands
        : typeof sc.allBrands === "string"
        ? JSON.parse(sc.allBrands)
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

    marketplaceListings:[],

    // Add missing properties for StoreForm
    hasWebsite: typeof store.hasWebsite === "boolean" ? store.hasWebsite : false,
    pricingTiers: Array.isArray(store.pricingTiers)
      ? store.pricingTiers
      : typeof store.pricingTiers === "string"
      ? JSON.parse(store.pricingTiers)
      : [],

    companyLocations: store.CompanyLocation.map((cl) => ({
      ...cl,
      displayName: cl.displayName === null ? undefined : cl.displayName,
      addressLine1Override: cl.addressLine1Override === null ? undefined : cl.addressLine1Override,
      addressLine2Override: cl.addressLine2Override === null ? undefined : cl.addressLine2Override,
      cityOverride: cl.cityOverride === null ? undefined : cl.cityOverride,
      stateOverride: cl.stateOverride === null ? undefined : cl.stateOverride,
      postalCodeOverride: cl.postalCodeOverride === null ? undefined : cl.postalCodeOverride,
      countryOverride: cl.countryOverride === null ? undefined : cl.countryOverride,
      latitudeOverride: cl.latitudeOverride === null ? undefined : cl.latitudeOverride,
      longitudeOverride: cl.longitudeOverride === null ? undefined : cl.longitudeOverride,
      createdAt: cl.createdAt === null ? undefined : cl.createdAt,
      updatedAt: cl.updatedAt === null ? undefined : cl.updatedAt,
    }))
  };

  return (
    <CreateStoreForm
      availableCategories={availableCategories}
       availableLocations={availableLocations}
      initialData={storeFormData}
    />
  );
}
