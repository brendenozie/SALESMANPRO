// app/stores/[id]/edit/page.tsx

import React from "react";
import { redirect } from "next/navigation";
import CreateStoreForm from "@/components/stores/create/CreateStoreForm/CreateStoreForm";
import prisma from "@/server/db/prismadb";
import {
  ILocation,
  IProductCategory,
  IStoreCategory,
  ISubcategory,
  PolicyType,
  SocialChannel,
  StoreForm,
} from "@/types/typings";

export const dynamic = "force-dynamic";

// Helper function to safely parse JSON fields from the database
const safeJsonParse = (jsonField: any, fallback: any = null) => {
  if (typeof jsonField === "object" && jsonField !== null) {
    return jsonField; // It's already a parsed object
  }
  if (typeof jsonField === "string") {
    try {
      return JSON.parse(jsonField);
    } catch (e) {
      console.error("Failed to parse JSON field:", e);
      return fallback;
    }
  }
  return fallback; // Return fallback for other types or null/undefined
};

export default async function EditStorePage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  // --- Fetch the company with ALL its one-to-many and one-to-one relations ---
  const store = await prisma.company.findUnique({
    where: { id },
    include: {
      // One-to-many relations
      socialLinks: true,
      policies: true,
      faqs: true,
      testimonials: { include: { author: true } },
      heroSlides: true, // Banners
      promotions: true,
      blogs: true,
      PageSection: true,
      appPromos: true,
      events: true,
      courses: true,
      Writer: {
        include: {
          user: true, // or whatever relation gives the full user object
        },
      },
      
      salesAgents: true,
      Doctor: {
        include: {
          User: true, // fetch the full user record
        },
      },

      Podcast: true,
      services: true,
      marketplaceListings: true,
      Announcement: true,

      // One-to-one relations (which are technically one-to-many in the schema)
      settings: true,
      SEO: true,
      AnalyticsConfig: true,
      PaymentSettings: true,
      ShippingSettings: true,

      // Junction/Join Tables
      StoreCategory: {
        include: {
          category: true,
        },
      },
      CompanyLocation: {
        include: {
          location: true,
        },
      },
    },
  });

  if (!store) {
    redirect("/stores");
  }

  // --- Fetch available categories and locations for the form selectors ---
  const categoryRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/get-all-categories`,
    { cache: "no-store" }
  );
  const categoryData = await categoryRes.json();
  const availableCategories: IProductCategory[] = categoryData.results || [];

  const locationRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/locations`
  );
  const locationData = await locationRes.json();
  const availableLocations: ILocation[] = locationData.data || [];

  // Safely get the first item from relations defined as arrays but used as one-to-one
  const seoData = store.SEO && store.SEO.length > 0 ? store.SEO[0] : null;
  const analyticsConfigData =
    store.AnalyticsConfig && store.AnalyticsConfig.length > 0
      ? store.AnalyticsConfig[0]
      : null;
  const paymentSettingsData =
    store.PaymentSettings && store.PaymentSettings.length > 0
      ? store.PaymentSettings[0]
      : null;
  const shippingSettingsData =
    store.ShippingSettings && store.ShippingSettings.length > 0
      ? store.ShippingSettings[0]
      : null;

  // --- Map the comprehensive Prisma object to the StoreForm shape ---
  const storeFormData: StoreForm = {
    // Spread direct fields from the store object
    id: store.id,
    name: store.name,
    slug: store.slug,
    userId: store.userId,
    companyCategoryId: store.companyCategoryId,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
    deletedAt: store.deletedAt,
    sEOId: store.sEOId,
    site: store.site,
    category: store.category,

    // Safely handle nullable and JSON fields
    tagline: store.tagline ?? "",
    description: store.description ?? "",
    hasWebsite: store.hasWebsite ?? false,
    domain: store.domain ?? "",
    logoUrl: store.logoUrl ?? "",
    bannerUrl: store.bannerUrl ?? "",
    contactEmail: store.contactEmail,
    contactPhone: store.contactPhone ?? "",
    address: store.address ?? "",
    currency: store.currency ?? "KES",
    locale: store.locale ?? "en-US",

    // Safely parse JSON fields using the helper
    geoLocation: safeJsonParse(store.geoLocation, { lat: 0, lng: 0 }),
    openingHours: safeJsonParse(store.openingHours, {}),
    themeSettings: safeJsonParse(store.themeSettings, {}),
    awards: safeJsonParse(store.awards, []),
    metrics: safeJsonParse(store.metrics, []),
    stats: safeJsonParse(store.stats, []),
    pricingTiers: safeJsonParse(store.pricingTiers, []),

    // Map one-to-many relations
    socialLinks: store.socialLinks.map((s) => ({
      ...s,
      channel: s.channel as unknown as SocialChannel,
    })),
    policies: store.policies.map((p) => ({
      ...p,
      type: p.type as unknown as PolicyType,
      title: p.title ?? undefined,
    })),
    faqs: store.faqs,
    testimonials: store.testimonials,
    heroSlides: store.heroSlides,
    promotions: store.promotions,
    blogs: store.blogs,
    pageSections: store.PageSection,

    // FIXED: Explicitly map `appPromos` and parse the `buttons` JSON field.
    appPromos: store.appPromos.map((p) => ({
      ...p,
      buttons: safeJsonParse(p.buttons, []), // Parse the JSON buttons field
    })),

    events: store.events,
    courses: store.courses,
    
    Writer: store.Writer.map((w) => ({
      ...w.user, // spread the full user fields
      // and add writer-specific fields if any
    })),
    salesAgents: store.salesAgents,
    
    Doctor: store.Doctor.map(d => ({
      id: d.id,
      name: null,
      address: d.address ?? null,
      createdAt: d.createdAt ?? null,
      updatedAt: d.updatedAt ?? null,
      companyId: d.companyId ?? null,
      status: null, // or cast if you can map DoctorStatus → UserStatus
      phone: d.phone ?? null,
      bio: null,
      profilePicture: null,
      email: "",
      password: null,
      role: null,
      emailVerified: null,
      image: null,
      username: null,
      dateOfBirth: null,
      gender: null,
      settingsId: null,
      studentId: null,
      educatorId: null,
      parentId: null,
      headTeacherId: null,
      lastLogin: null,
    })),


    Podcast: store.Podcast,
    services: store.services,
    marketplaceListings: store.marketplaceListings,
    
    Announcement: store.Announcement,

    // Handle one-to-one relations
    settings: store.settings ?? null,
    seo: seoData,
    analyticsConfig: analyticsConfigData,
    paymentSettings: paymentSettingsData,
    shippingSettings: shippingSettingsData,

    // Map junction tables
    StoreCategory: store.StoreCategory.map((sc) => ({
      ...sc,
      displayName: sc.displayName ?? sc.category.name,
      icon: sc.icon ?? "",
      subcategories: safeJsonParse(sc.subcategories, []) as ISubcategory[],
      allBrands: safeJsonParse(sc.allBrands, []) as string[],
      category: {
        ...sc.category,
        subcategories: (sc.category.subcategories ?? []) as unknown as ISubcategory[],
      },
    })),


    CompanyLocation: store.CompanyLocation.map((cl) => ({
      ...cl,
      displayName: cl.displayName ?? null, // ✅ now matches string | null
    })),
    
  };

  return (
    <CreateStoreForm
      availableCategories={availableCategories}
      availableLocations={availableLocations}
      initialData={storeFormData}
    />
  );
}