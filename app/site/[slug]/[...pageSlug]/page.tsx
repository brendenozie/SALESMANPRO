import { notFound } from "next/navigation";
import { loadStore } from "@/lib/loadStore";
import { StoreDataSync } from "@/contexts/StoreContext";
import WebsiteRenderer from "@/components/website-builder/WebsiteRenderer";
import { resolveCanonicalTemplate } from "@/lib/website-builder/template-registry";
import { compileWebsiteFromCompany } from "@/lib/website-builder/template-compiler";
import TemplateDiagnosticHud from "@/components/website-builder/TemplateDiagnosticHud";

import type { Metadata } from "next";
import { SEOService } from "@/lib/seo";
import { isGhubaMarketplace } from "@/lib/ghuba-helpers";

export const revalidate = 60;

interface CustomStorePageProps {
  params: Promise<{
    slug: string;
    pageSlug: string[];
  }>;
}

export async function generateMetadata({ params }: CustomStorePageProps): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  const currentSlug = pageSlug ? pageSlug.join("/") : "home";
  const { raw } = await loadStore(slug);

  if (!raw) {
    return { title: "Page Not Found" };
  }

  let activeConfig = raw?.website?.publishedConfig as any;
  if (!activeConfig) {
    activeConfig = compileWebsiteFromCompany(raw);
  }

  const page = (activeConfig.pages || []).find(
    (p: any) => p.slug === currentSlug || (p.isHomepage && currentSlug === "home")
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
  const currentSlug = pageSlug ? pageSlug.join("/") : "home";

  const { pageData, raw } = await loadStore(slug);

  // Deterministically resolve canonical template
  const canonicalTemplate = resolveCanonicalTemplate(
    raw?.category,
    raw?.variant,
    raw?.website?.templateKey
  );

  let activeConfig = raw?.website?.publishedConfig as any;

  // If no published config exists, or if the page is a standard template page not yet explicitly saved,
  // synthesize from template defaults so customer navigation (/products, /categories, /about) never 404s
  if (!activeConfig) {
    activeConfig = compileWebsiteFromCompany(raw);
  }

  // Check if page exists in active config
  let pageExists = (activeConfig.pages || []).some(
    (p: any) => p.slug === currentSlug || (p.isHomepage && currentSlug === "home")
  );

  // If not found in custom pages, check if it's a known canonical template page
  if (!pageExists) {
    const isTemplatePage = canonicalTemplate.defaultPages.some((p) => p.slug === currentSlug);
    if (isTemplatePage) {
      // Re-synthesize clean template defaults for this page
      const freshConfig = compileWebsiteFromCompany(raw);
      activeConfig = {
        ...activeConfig,
        pages: [...(activeConfig.pages || []), ...(freshConfig.pages.filter((p) => p.slug === currentSlug))],
      };
      pageExists = true;
    }
  }

  if (!pageExists) {
    notFound();
  }

  return (
    <main className="text-gray-900 dark:text-gray-100 min-h-screen w-full mx-auto">
      <StoreDataSync data={pageData} />
      <WebsiteRenderer
        config={activeConfig}
        pageSlug={currentSlug}
        companyId={raw.id}
        storeLogoUrl={raw.logoUrl || raw.bannerUrl}
        contactPhone={raw.contactPhone}
        contactEmail={raw.contactEmail}
        address={raw.address || raw.addresses?.[0]?.address}
        socialLinks={raw.socialLinks}
      />
      <TemplateDiagnosticHud
        slug={slug}
        template={canonicalTemplate}
        pageSlug={currentSlug}
        hasPublishedConfig={!!raw?.website?.publishedConfig}
        sectionsCount={canonicalTemplate.authenticSections.length}
        category={raw?.category}
        variant={raw?.variant}
      />
    </main>
  );
}

