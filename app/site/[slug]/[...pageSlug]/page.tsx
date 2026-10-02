import { notFound } from "next/navigation";
import { loadStore } from "@/lib/loadStore";
import { StoreDataSync } from "@/contexts/StoreContext";
import WebsiteRenderer from "@/components/website-builder/WebsiteRenderer";
import { compileWebsiteFromCompany } from "@/lib/website-builder/template-compiler";
import DiagnosticHudLoader from "@/components/website-builder/DiagnosticHudLoader";

import type { Metadata } from "next";
import { SEOService } from "@/lib/seo";
import { isGhubaMarketplace } from "@/lib/ghuba-helpers";

import { resolvePageSlugAlias } from "@/lib/website-builder/template-registry";
import OrderTrackingView from "@/components/site/OrderTrackingView";

export const revalidate = 60;

interface CustomStorePageProps {
  params: Promise<{
    slug: string;
    pageSlug: string[];
  }>;
}

export async function generateMetadata({ params }: CustomStorePageProps): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  const rawSlug = pageSlug ? pageSlug.join("/") : "home";
  const currentSlug = rawSlug.trim().toLowerCase();
  const targetSlug = resolvePageSlugAlias(currentSlug);
  const { raw } = await loadStore(slug);

  if (!raw) {
    return { title: "Page Not Found" };
  }

  let activeConfig = raw?.website?.publishedConfig as any;
  if (!activeConfig) {
    activeConfig = compileWebsiteFromCompany(raw);
  }

  const page = (activeConfig.pages || []).find(
    (p: any) =>
      p.slug === currentSlug ||
      p.slug === targetSlug ||
      (p.isHomepage && (currentSlug === "home" || targetSlug === "home"))
  );

  const pageTitle = page?.seo?.metaTitle || page?.title || currentSlug.replace(/-/g, " ");
  const pageDesc = page?.seo?.metaDescription || raw.description || undefined;

  const isGhuba = isGhubaMarketplace(slug, raw);

  const seoResult = SEOService.generate({
    siteType: isGhuba ? "GHUBA" : "TENANT_STORE",
    pageType: "CUSTOM",
    tenant: {
      id: raw.id,
      slug: raw.slug || slug,
      domain: raw.domain,
      name: raw.name,
      description: raw.description,
      logoUrl: raw.logoUrl,
      bannerUrl: raw.bannerUrl,
      address: raw.address,
      city: raw.city,
      country: raw.country,
      currency: raw.currency,
      contactPhone: raw.contactPhone,
      contactEmail: raw.contactEmail,
    },
    entity: {
      name: pageTitle,
      description: pageDesc,
    },
    currentPath: `/${currentSlug}`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: pageTitle, url: `/${currentSlug}` },
    ],
  });

  return seoResult.metadata;
}

export default async function CustomStorePage({ params }: CustomStorePageProps) {
  const { slug, pageSlug } = await params;
  const rawSlug = pageSlug ? pageSlug.join("/") : "home";
  const currentSlug = rawSlug.trim().toLowerCase();
  const targetSlug = resolvePageSlugAlias(currentSlug);

  const { pageData, raw, canonicalTemplate } = await loadStore(slug);

  // Direct render for order tracking requests across all template sites
  if (["track", "trackorder", "track-order", "ordertracking", "order-tracking"].includes(currentSlug)) {
    return (
      <main className="text-gray-900 dark:text-gray-100 min-h-screen w-full mx-auto bg-slate-50 dark:bg-slate-950">
        <StoreDataSync data={pageData} />
        <div className="pt-6 pb-16">
          <OrderTrackingView storeSlug={slug} storeName={raw?.name} />
        </div>
      </main>
    );
  }

  let activeConfig = raw?.website?.publishedConfig as any;

  // Compile from template defaults lazily (once) only if needed.
  let compiledFallback: ReturnType<typeof compileWebsiteFromCompany> | null = null;
  const getCompiledFallback = () => {
    if (!compiledFallback) compiledFallback = compileWebsiteFromCompany(raw);
    return compiledFallback;
  };

  if (!activeConfig) {
    activeConfig = getCompiledFallback();
  }

  // 1. Direct match on currentSlug or targetSlug in activeConfig.pages
  let matchedPage = (activeConfig.pages || []).find(
    (p: any) =>
      p.slug === currentSlug ||
      p.slug === targetSlug ||
      (p.isHomepage && (currentSlug === "home" || targetSlug === "home"))
  );

  // 2. If not found in active config, check template defaultPages or compiled fallback
  if (!matchedPage) {
    const freshConfig = getCompiledFallback();
    matchedPage = (freshConfig.pages || []).find(
      (p: any) =>
        p.slug === currentSlug ||
        p.slug === targetSlug ||
        (p.isHomepage && (currentSlug === "home" || targetSlug === "home"))
    );

    if (matchedPage) {
      activeConfig = {
        ...activeConfig,
        pages: [...(activeConfig.pages || []), { ...matchedPage, slug: currentSlug }],
      };
    }
  }

  // 3. Fallback for common navigation items (e.g. products/shop, categories, about, contact)
  if (!matchedPage) {
    const freshConfig = getCompiledFallback();
    // Try matching any page by pageType
    if (["shop", "products", "catalog", "store"].includes(currentSlug)) {
      matchedPage = (freshConfig.pages || []).find((p: any) => p.pageType === "PRODUCT_LIST" || p.slug === "products");
    } else if (["categories", "departments", "collections"].includes(currentSlug)) {
      matchedPage = (freshConfig.pages || []).find((p: any) => p.pageType === "CATEGORY_LIST" || p.slug === "categories");
    } else if (["about", "about-us", "story", "our-story"].includes(currentSlug)) {
      matchedPage = (freshConfig.pages || []).find((p: any) => p.pageType === "ABOUT" || p.slug === "about");
    } else if (["contact", "contact-us", "support"].includes(currentSlug)) {
      matchedPage = (freshConfig.pages || []).find((p: any) => p.pageType === "CONTACT" || p.slug === "contact");
    }

    if (matchedPage) {
      activeConfig = {
        ...activeConfig,
        pages: [...(activeConfig.pages || []), { ...matchedPage, slug: currentSlug }],
      };
    }
  }

  if (!matchedPage) {
    notFound();
  }

  // Effective slug to pass down to renderer (matching activePage)
  const effectiveSlug = matchedPage.slug || currentSlug;

  return (
    <main className="text-gray-900 dark:text-gray-100 min-h-screen w-full mx-auto">
      <StoreDataSync data={pageData} />
      <WebsiteRenderer
        config={activeConfig}
        pageSlug={effectiveSlug}
        companyId={raw.id}
        storeLogoUrl={raw.logoUrl || raw.bannerUrl}
        contactPhone={raw.contactPhone}
        contactEmail={raw.contactEmail}
        address={raw.address || raw.addresses?.[0]?.address}
        socialLinks={raw.socialLinks}
      />
      {process.env.NODE_ENV !== 'production' && (
        <DiagnosticHudLoader
          slug={slug}
          template={canonicalTemplate}
          pageSlug={currentSlug}
          hasPublishedConfig={!!raw?.website?.publishedConfig}
          sectionsCount={canonicalTemplate.authenticSections.length}
          category={raw?.category}
          variant={raw?.variant}
        />
      )}
    </main>
  );
}

