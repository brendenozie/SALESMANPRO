// // // app/stores/[id]/edit/page.tsx
/* File: app/stores/[id]/edit/page.tsx */
import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import prisma from "@/server/db/prismadb";

// 1. Ingest ultra-fast data services directly (Bypasses local HTTP loops)
import { 
  getCachedAdminCategories, 
  getCachedLocations, 
  getCachedSiteCategories 
} from "@/lib/services/store-data";

import {
  ILocation,
  IProductCategory,
  IStoreCategory,
  ISubcategory,
  StoreForm,  
  PolicyType,
  SocialChannel,
} from "@/types/typings";

// 2. Progressive Code Splitting: Lazy load the heavy client-side multi-step form UI shell
const CreateStoreForm = dynamic(
  () => import("@/components/stores/create/CreateStoreForm/CreateStoreForm"),
  {
    ssr: true,
    loading: () => <FormLoaderFallback />
  }
);

// --------------------
// Utils
// --------------------
const safeJsonParse = <T,>(value: any, fallback: T): T => {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditStorePage({ params }: PageProps) {
  const { id : slug } = await params;

  // --------------------
  // 1. Parallel Data Fetching
  // --------------------
  // We execute the dynamic database query for the store AT THE SAME TIME 
  // as retrieving the in-memory cached dropdown lists.
  const [store, categoriesRes, locationsRes, siteCategoriesRes] = await Promise.all([
    // Core store data
    prisma.company.findUnique({
      where: { slug },
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
        Writer: { include: { user: false } },
        salesAgents: { include: { user: false } },
        Doctor: { include: { User: false } },
        Podcast: true,
        services: true,
        CoreValues: true,
        Announcement: true,
        settings: true,
        SEO: true,
        AnalyticsConfig: true,
        PaymentSettings: true,
        ShippingSettings: true,
        galleries: true,
        StoreCategory: { include: { category: true } },
        CompanyLocation: { include: { location: true } },
        addresses: true,
      },
    }),
    // Cached global lists
    getCachedAdminCategories(100),
    getCachedLocations(),
    getCachedSiteCategories(100)
  ]);

  // If the store doesn't exist, exit early
  if (!store) redirect("/stores");

  // --------------------
  // 2. Resolve Available Lists
  // --------------------
  const availableCategories: IProductCategory[] = (categoriesRes?.results ?? []).map(
    (c: any) => ({
      // ensure subcategories is either an array or undefined to satisfy IProductCategory
      ...c,
      subcategories: Array.isArray(c?.subcategories) ? c.subcategories : undefined,
    } as IProductCategory)
  );
  const availableLocations: ILocation[] = (locationsRes?.data ?? []).map(
    (l: any) => ({
      ...l,
    } as ILocation)
  );
  const siteCategories = siteCategoriesRes ?? [];

  // --------------------
  // 3. Normalize store → StoreForm (lightweight only)
  // --------------------
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

    salesAgents: [],
    Writer: [],
    Doctor: [],

    Podcast: store.Podcast,
    services: store.services,
    marketplaceListings: [],
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
        subcategories: (sc.category?.subcategories ?? []) as unknown as ISubcategory[],
      },
    })) : ([] as IStoreCategory[]),
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
    addresses: store.addresses.map((addr) => ({
      ...addr,
      id: addr.id ?? null,
      lat: addr.lat ?? 0,
      lng: addr.lng ?? 0,
    })),

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
        .filter((p): p is { src: string; alt: string; } => p !== null);
    })(),
    founderName: store.founderName || '',
    founderQuote: store.founderQuote || '',
    founderImage: store.founderImage || '',

    sectionTitle: store.sectionTitle || '',
    sectionSubtitle: store.sectionSubtitle || '',
    sectionDescription: store.sectionDescription || '',
    galleries: (store.galleries || []).map((g: any) => ({
      ...g,
      items: Array.isArray(g.items) ? g.items : [],
    })),
    subscription: null
  };
  
  // --------------------
  // 4. Render Layout 
  // --------------------
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/20 py-8">
      <Suspense fallback={<FormLoaderFallback />}>
        <CreateStoreForm
          initialData={storeFormData}
          availableCategories={availableCategories}
          availableLocations={availableLocations}
          siteCategories={siteCategories}
        />
      </Suspense>
    </div>
  );
}

/**
 * Premium skeleton loader matching your design language 
 * displaying while the main JS bundle hydrates the massive StoreForm
 */
function FormLoaderFallback() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-4 w-72 bg-gray-100 dark:bg-zinc-900 rounded-md" />
      </div>
      <div className="space-y-4 border border-gray-100 dark:border-zinc-900 p-6 rounded-2xl bg-white dark:bg-zinc-900/40 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-800 rounded" />
            <div className="h-10 w-full bg-gray-100 dark:bg-zinc-900 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-gray-200 dark:bg-zinc-800 rounded" />
            <div className="h-10 w-full bg-gray-100 dark:bg-zinc-900 rounded-xl" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 w-16 bg-gray-200 dark:bg-zinc-800 rounded" />
          <div className="h-24 w-full bg-gray-100 dark:bg-zinc-900 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
