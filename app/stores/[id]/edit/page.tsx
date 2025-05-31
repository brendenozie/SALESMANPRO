// app/stores/[id]/edit/page.tsx
import React from "react";
import { redirect } from "next/navigation";
// Import client component below
import CreateStoreForm from '../../../../components/stores/create/CreateStoreForm/CreateStoreForm';

import prisma from "../../../../server/db/prismadb";

export const dynamic = "force-dynamic";

export default async function EditStorePage({ params }: { params: { id: string } }) {
  const id = params.id;
  // fetch the store, include the same relations your GET API does
  const store = await prisma.company.findUnique({
    where: { id },

  });

  // const store = await getCompanyForEdit(id);

  if (!store) {
    // redirect or show 404
    redirect("/stores");
  }

  console.log(store);

  // fetch categories as before
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shop/categories`, { cache: "no-store" });
  const { categories } = await res.json();
  const availableCategories = categories.map((c: any) => ({ id: c.id, name: c.name }));

  // Convert null fields to undefined for compatibility with Partial<StoreForm>
  const storeFormData = {
    ...store,
    domain: store.domain ?? undefined,
    tagline: store.tagline ?? undefined,
    description: store.description ?? undefined,
    logoUrl: store.logoUrl ?? undefined,
    name: store.name ?? undefined,
    slug: store.slug ?? undefined,
    category: store.category ?? undefined,
    bannerUrl: store.bannerUrl ?? undefined,
    contactEmail: store.contactEmail ?? undefined,
    contactPhone: store.contactPhone ?? undefined,
    address: store.address ?? undefined,
    geoLocation: store.geoLocation
      ? typeof store.geoLocation === "string"
        ? JSON.parse(store.geoLocation)
        : store.geoLocation
      : undefined,
    openingHours:
      store.openingHours && typeof store.openingHours === "string"
        ? JSON.parse(store.openingHours)
        : store.openingHours ?? undefined,
    socialLinks: store.socialLinks ?? undefined,
    policies: store.policies
      ? store.policies.map((policy: any) => ({
          ...policy,
          title: policy.title === null ? undefined : policy.title,
        }))
      : undefined,
    faqs: store.faqs ?? undefined,
    testimonials: store.testimonials
      ? store.testimonials.map((t: any) => ({
          ...t,
          avatarUrl: t.avatarUrl === null ? undefined : t.avatarUrl,
        }))
      : undefined,
    heroSlides: store.heroSlides
      ? store.heroSlides.map((slide: any) => ({
          ...slide,
          headline: slide.headline ?? "",
          subline: slide.subline ?? "",
          ctaText: slide.ctaText ?? "",
          ctaLink: slide.ctaLink ?? "",
        }))
      : undefined,
    promotions: store.promotions
      ? store.promotions.map((promotion: any) => ({
          ...promotion,
          description: promotion.description === null ? "" : promotion.description,
        }))
      : undefined,
    awards: Array.isArray(store.awards)
      ? store.awards
      : typeof store.awards === "string"
        ? JSON.parse(store.awards)
        : undefined,
    metrics: Array.isArray(store.metrics)
      ? store.metrics
      : typeof store.metrics === "string"
        ? JSON.parse(store.metrics)
        : undefined,
    stats:
      Array.isArray(store.stats)
        ? store.stats
        : typeof store.stats === "string"
        ? JSON.parse(store.stats)
        : undefined,
    themeSettings:
      typeof store.themeSettings === "string"
        ? JSON.parse(store.themeSettings)
        : store.themeSettings ?? undefined,
    seo: store.seo ?? undefined,
    analyticsConfig: store.AnalyticsConfig ?? undefined,
    paymentSettings: store.PaymentSettings ?? undefined,
    shippingSettings: store.ShippingSettings ?? undefined,
    storeCategories: Array.isArray(store.StoreCategory)
      ? store.StoreCategory.map((cat: any) => ({
          id: cat.categoryId,
          name: cat.displayName ?? "", // fallback to empty string if displayName is null
        }))
      : undefined,
    // Add similar conversions for other fields if needed
  };

  return (
    <CreateStoreForm
      availableCategories={availableCategories}
      initialData={storeFormData}
    />
  );
}

export async function getCompanyForEdit(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      // 1) The “flat” JSON fields you stored directly on Company:
      awards: true,
      metrics: true,
      stats: true,

      // 2) One‐to‐many relations on Company:
      socialLinks: true,            // pulls [{ id, channel, url, … }]
      policies: true,               // pulls [{ id, type, content, … }]
      faqs: true,                   // pulls [{ id, question, answer, order, … }]
      testimonials: true,           // pulls [{ id, author, quote, avatarUrl, rating, order }]
      heroSlides: true,             // pulls [{ id, imageUrl, headline, subline, ctaText, ctaLink, order }]
      promotions: true,             // pulls [{ id, code, title, description, startsAt, endsAt, bannerUrl }]
      seo: true,                    // pulls the single SEO record (relation)
      analyticsConfig: true,        // pulls the single AnalyticsConfig record
      paymentSettings: true,        // pulls the single PaymentSettings record
      shippingSettings: true,       // pulls the single ShippingSettings record

      // 3) The “junction table” that connects Company to ProductCategory (i.e. StoreCategory),
      //    including any overrides at the store level. Here we include StoreCategory → ProductCategory:
      StoreCategory: {
        include: {
          category: true   // inner ProductCategory (so you get category.name, category.slug, etc.)
        }
      }
    }
  });

  if (!company) return null;

  //
  // Prisma will return JavaScript Date objects for any DateTime fields (e.g. startsAt, endsAt, createdAt).
  // When you send them into a Next.js “use client” component as props, Next.js will automatically
  // serialize them for you (unless you're in pages‐dir getServerSideProps, in which case you might want
  // to call .toISOString() on each Date). If you run into a serialization error, you can explicitly
  // transform those Date objects to strings before returning.
  //

  return company;
}
