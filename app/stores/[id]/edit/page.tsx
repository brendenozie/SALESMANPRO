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
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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

interface EditStorePageProps {
  params: Promise<{ id: string }>;
}
export default async function EditStorePage({
  params,
}: EditStorePageProps) {

  const cookieHeader = (await cookies()).toString();
  const id = (await params).id;

  // --- Fetch the company with ALL its one-to-many and one-to-one relations ---
  const store = await prisma.company.findUnique({
    where: { id },
    include: {
      socialLinks: true,
      policies: true,
      faqs: true,
      testimonials: { include: { author: true } },
      heroSlides: true,
      promotions: true,
      blogs: true,
      PageSection: true,
      appPromos: true,
      events: true,
      courses: true,
      Writer: {
        include: {
          user: false,
        },
      },
      salesAgents: {
        include: {
          user: false,
        },
      },
      Doctor: {
        include: {
          User: false,
        },
      },
      Podcast: true,
      services: true,
      CoreValues: true,
      // marketplaceListings: true,
      Announcement: true,
      settings: true,
      SEO: true,
      AnalyticsConfig: true,
      PaymentSettings: true,
      ShippingSettings: true,
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
    `${apiBaseUrl}/admin/get-all-categories?limit=100`,
    { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } }
  );
  const categoryData = await categoryRes.json();
  const availableCategories: IProductCategory[] = categoryData.data?.results || [];

  const locationRes = await fetch(
    `${apiBaseUrl}/admin/locations`,
    { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } }
  );
  const locationData = await locationRes.json();
  const availableLocations: ILocation[] = locationData.data?.data || [];

  // --- Map the comprehensive Prisma object to the StoreForm shape ---
  const storeFormData: StoreForm = {
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
    category: store.category || "Default Category",
    variant: store.variant,
    tagline: store.tagline ?? "",
    description: store.description ?? "",
    hasWebsite: store.hasWebsite ?? false,
    domain: store.domain ?? "",
    logoUrl: store.logoUrl ?? "",
    bannerUrl: store.bannerUrl ?? "",
    videoUrl: store.videoUrl ?? "",
    contactEmail: store.contactEmail,
    contactPhone: store.contactPhone ?? "",
    address: store.address ?? "",
    currency: store.currency ?? "KES",
    locale: store.locale ?? "en-US",
    geoLocation: safeJsonParse(store.geoLocation, { lat: 0, lng: 0 }),
    openingHours: safeJsonParse(store.openingHours, {}),
    themeSettings: safeJsonParse(store.themeSettings, {}),
    awards: safeJsonParse(store.awards, []),
    metrics: safeJsonParse(store.metrics, []),
    stats: safeJsonParse(store.stats, []),
    pricingTiers: safeJsonParse(store.pricingTiers, []),
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
    promotions: store.promotions.map((p) => ({
      ...p,
      perks: safeJsonParse(p.perks, []),
      trustLogos: safeJsonParse(p.trustLogos, []),
      createdAt: p.createdAt ?? undefined,
      updatedAt: p.updatedAt ?? undefined,
      bannerUrl: p.bannerUrl ?? undefined,
      ctaText: p.ctaText ?? undefined,
      ctaLink: p.ctaLink ?? undefined,
      badgeText: p.badgeText ?? undefined,
      price: p.price ?? undefined,
      themePrimary: p.themePrimary ?? undefined,
      themeSecondary: p.themeSecondary ?? undefined,
    })),
    projects: [],
    blogs: store.blogs,
    pageSections: store.PageSection,
    appPromos: store.appPromos.map((p) => ({
      ...p,
      buttons: safeJsonParse(p.buttons, []),
    })),
    events: store.events,
    courses: store.courses,

    salesAgents: [], //store.salesAgents,
    Writer: [], //store.Writer.map((w) => w.user),
    Doctor: [], //store.Doctor.map((d) => d.User).filter((user): user is User => !!user),

    Podcast: store.Podcast,
    services: store.services,
    marketplaceListings: [], //store.marketplaceListings,
    Announcement: store.Announcement,
    settings: store.settings ?? null,
    seo: store.SEO ?? null,
    analyticsConfig: store.AnalyticsConfig ?? null,
    paymentSettings: store.PaymentSettings ?? null,
    shippingSettings: store.ShippingSettings ?? null,
    StoreCategory: store.StoreCategory ? store.StoreCategory.map((sc) => ({
      ...sc,
      displayName: sc.displayName ?? sc.category?.name ?? "",
      icon: sc.icon ?? "",
      subcategories: safeJsonParse(sc.subcategories, []) as ISubcategory[],
      allBrands: safeJsonParse(sc.allBrands, []) as string[],
      category: {
        ...sc.category,
        id: sc.category?.id ?? "",
        name: sc.category?.name ?? "",
        slug: sc.category?.slug ?? "",
        subcategories: (sc.category?.subcategories ??  []) as unknown as ISubcategory[],
      },
    })) : ( [] as IStoreCategory[]),
    CompanyLocation: store.CompanyLocation.map((cl) => ({
      ...cl,
      displayName: cl.displayName ?? null,
    })),
    Collection: [],
    CoreValues: store.CoreValues.map((cv) => ({
      ...cv,
      icon: cv.icon ?? "",
    })),
    Expert: [],
    Educator: [],
    packages: [],
    destinations: [],
    tourPackages: [],

    partnerLogos: (() => {
      const parsed = safeJsonParse(store.partnerLogos, []);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item: any) => {
          if (typeof item === "string" || typeof item === "number") {
            return { src: String(item), alt: "" };
          }
          if (item && typeof item === "object" && "src" in item && typeof (item as any).src === "string") {
            return {
              src: (item as any).src,
              alt: typeof (item as any).alt === "string" ? (item as any).alt : "",
            };
          }
          return null;
        })
        .filter((p): p is { src: string; alt: string } => p !== null);
    })(), // For marquee sections
    founderName: store.founderName || '',
    founderQuote: store.founderQuote || '',
    founderImage: store.founderImage || '',

    sectionTitle: store.sectionTitle || '',
    sectionSubtitle: store.sectionSubtitle || '',
    sectionDescription: store.sectionDescription || '',
  };

  return (
    <CreateStoreForm
      availableCategories={availableCategories}
      availableLocations={availableLocations}
      initialData={storeFormData}
    />
  );
}