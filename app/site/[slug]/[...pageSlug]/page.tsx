import { notFound } from "next/navigation";
import { loadStore } from "@/lib/loadStore";
import { StoreDataSync } from "@/contexts/StoreContext";
import WebsiteRenderer from "@/components/website-builder/WebsiteRenderer";

export const revalidate = 60;

interface CustomStorePageProps {
  params: Promise<{
    slug: string;
    pageSlug: string[];
  }>;
}

export default async function CustomStorePage({ params }: CustomStorePageProps) {
  const { slug, pageSlug } = await params;
  const currentSlug = pageSlug ? pageSlug.join("/") : "home";

  const { pageData, raw } = await loadStore(slug);

  const publishedConfig = raw?.website?.publishedConfig ? (raw.website.publishedConfig as any) : null;
  if (!publishedConfig) {
    notFound();
  }

  // Check if page exists in published website configuration
  const pageExists = (publishedConfig.pages || []).some(
    (p: any) => p.slug === currentSlug || (p.isHomepage && currentSlug === "home")
  );

  if (!pageExists) {
    notFound();
  }

  return (
    <main className="text-gray-900 dark:text-gray-100 min-h-screen w-full mx-auto">
      <StoreDataSync data={pageData} />
      <WebsiteRenderer
        config={publishedConfig}
        pageSlug={currentSlug}
        companyId={raw.id}
        storeLogoUrl={raw.logoUrl || raw.bannerUrl}
        contactPhone={raw.contactPhone}
        contactEmail={raw.contactEmail}
        address={raw.address || raw.addresses?.[0]?.address}
        socialLinks={raw.socialLinks}
      />
    </main>
  );
}
