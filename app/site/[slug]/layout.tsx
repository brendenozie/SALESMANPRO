import { notFound } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';

import { StoreContextProvider } from '@/contexts/StoreContext';
import { EditableContentProvider } from '@/contexts/EditableContentContext';
import categoryHeaderFooterLayoutMap from '@/components/site/layouts/categoryHeaderFooterLayoutMap';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';
import LoadingSpinner from '@/components/site/LoadingSpinner';
import { SITE_CATEGORIES } from '@/utils/sitedata';
import { findCompanyCached } from '@/lib/company-fetcher';
import WhatsAppBubble from '@/components/WhatsAppBubble';

import siteMetadata from '@/data/siteMetadata';
import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';
import { SubscriptionGraceBanner, SubscriptionInactiveView } from './SubscriptionGraceBanner';
import { resolveCanonicalTemplate } from '@/lib/website-builder/template-registry';

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

// --- HELPER FUNCTIONS ---

function normalize(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9&() ]/g, '')
    .replace(/\s+/g, ' ');
}

function extractSEO(company: any) {
  return company?.SEO ?? company?.sEO ?? {};
}

function getCleanSiteUrl() {
  return siteMetadata.siteUrl.replace(/\/$/, '');
}

// --- METADATA ---

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const company = await findCompanyCached(slug, 'lean');

  // 🛑 1. If company strictly does NOT exist in DB, show 404 metadata
  if (!company) {
    return {
      title: 'Store Not Found',
      description: 'The requested store could not be found.',
    };
  }

  const subStatus = company.subscription?.status?.toLowerCase() || 'inactive';
  const isSubscriptionActive = company.subscription?.isActive || subStatus === 'active' || subStatus === 'past_due';

  // 🛑 2. If subscription is fully expired, return temporary offline metadata + noindex
  if (!isSubscriptionActive) {
    return {
      title: `${company.name} | Temporarily Offline`,
      description: 'This store is currently undergoing brief maintenance. Please check back soon.',
      robots: {
        index: false, // Prevents search engines from de-indexing existing store links
        follow: false,
      },
    };
  }

  const seo = extractSEO(company);
  const title = seo.title || company.name;
  const description = seo.description || 'Discover our exclusive collection.';
  const previousImages = (await parent).openGraph?.images || [];
  const images = company.logoUrl ? [company.logoUrl] : previousImages;
  
  const cleanBaseUrl = getCleanSiteUrl();
  const canonicalUrl = `${cleanBaseUrl}/${slug}`;

  return {
    title,
    description,
    icons: company.logoUrl ? { icon: company.logoUrl, apple: company.logoUrl } : undefined,
    keywords: seo.keywords || 'ecommerce, ghuba, shops, marketplace',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}

// --- LAYOUT ---

interface StoreLayoutProps {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}

export default async function StoreLayout({ params, children }: StoreLayoutProps) {
  const { slug } = await params;
  const raw = await findCompanyCached(slug, 'lean');

  // 🛑 1. ONLY trigger true 404 if the company record does not exist in the database
  if (!raw) {
    notFound();
  }

  const subStatus = raw.subscription?.status?.toLowerCase() || 'inactive';
  const renewalDate = raw.subscription?.renewalDate || null;
  const isActiveFlag = raw.subscription?.isActive ?? false;
  
  // Categorize subscription state
  const isFullyActive = isActiveFlag && subStatus === 'active';
  
  // 7-day grace period after payment becomes past due
  const GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;
  const gracePeriodEnd = renewalDate
    ? new Date(new Date(renewalDate).getTime() + GRACE_PERIOD_MS)
    : null;
  const isWithinGrace = gracePeriodEnd ? gracePeriodEnd.getTime() > Date.now() : false;
  const graceDaysLeft = gracePeriodEnd
    ? Math.max(1, Math.ceil((gracePeriodEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 3;

  const isPastDueGracePeriod = subStatus === 'past_due' && isWithinGrace;
  const isSubscriptionValid = isFullyActive || isPastDueGracePeriod;

  // 🛑 2. Soft Stop: If subscription is EXPIRED or INACTIVE, render a polite maintenance view
  if (!isSubscriptionValid) {
    return (
      <SubscriptionInactiveView
        storeName={raw.name}
        logoUrl={raw.logoUrl || raw.bannerUrl}
        contactEmail={raw.contactEmail}
        contactPhone={raw.contactPhone}
      />
    );
  }

  const storeFormData = transformCompanyToStoreForm(raw);

  // Blend published website component overrides if available
  const publishedConfig = raw?.website?.publishedConfig as any;
  const overrides: Record<string, any> = publishedConfig?.componentOverrides || {};

  const headerBrand =
    overrides["Header.brandName"] ||
    overrides["Header.storeName"] ||
    overrides["header.brandName"] ||
    overrides["header.storeName"] ||
    overrides["header.title"] ||
    overrides["global.global.header.Header.main.storeName"];
  if (headerBrand) storeFormData.name = String(headerBrand);

  const headerLogo = overrides["Header.logoUrl"] || overrides["header.logoUrl"] || overrides["global.global.header.Header.main.logoUrl"];
  if (headerLogo) storeFormData.logoUrl = String(headerLogo);

  const footerBio = overrides["Footer.bio"] || overrides["footer.bio"] || overrides["footer.description"] || overrides["global.global.footer.Footer.main.description"];
  if (footerBio) storeFormData.description = String(footerBio);

  const footerPhone = overrides["Footer.contactPhone"] || overrides["footer.contactPhone"] || overrides["footer.phone"];
  if (footerPhone) (storeFormData as any).contactPhone = String(footerPhone);

  const footerEmail = overrides["Footer.contactEmail"] || overrides["footer.contactEmail"] || overrides["footer.email"];
  if (footerEmail) (storeFormData as any).contactEmail = String(footerEmail);

  const footerAddr = overrides["Footer.address"] || overrides["footer.address"];
  if (footerAddr) (storeFormData as any).address = String(footerAddr);

  const announcement = overrides["Header.announcementText"] || overrides["header.announcementText"];
  if (announcement) (storeFormData as any).tagline = String(announcement);

  (storeFormData as any).componentOverrides = overrides;

  const category = normalize(storeFormData.category || 'other');
  const variant = normalize(storeFormData.variant || '');
  const categoryMap = new Map(SITE_CATEGORIES.map(c => [normalize(c.name), c]));

  // Resolve canonical template identity deterministically
  const canonicalTemplate = resolveCanonicalTemplate(
    raw.category,
    raw.variant,
    raw.website?.templateKey
  );

  let LayoutComponent = 
    categoryHeaderFooterLayoutMap[canonicalTemplate.shellLayout]
    || categoryHeaderFooterLayoutMap[canonicalTemplate.variant] 
    || categoryHeaderFooterLayoutMap[canonicalTemplate.category]
    || categoryHeaderFooterLayoutMap[variant] 
    || categoryHeaderFooterLayoutMap[category]
    || (() => {
      const matchedCategory = categoryMap.get(category) as any;
      if (matchedCategory?.variants?.length) {
        const firstVariant = normalize(matchedCategory.variants[0].name);
        return categoryHeaderFooterLayoutMap[firstVariant];
      }
    })()
    || categoryHeaderFooterLayoutMap['default'];

  const userId = ''; 

  const seo = extractSEO(raw);
  const cleanBaseUrl = getCleanSiteUrl();
  
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: raw.name,
    url: `${cleanBaseUrl}/${slug}`,
    description: seo.description || 'Discover our exclusive collection.',
  };

  if (raw.logoUrl) {
    jsonLd.image = raw.logoUrl;
    jsonLd.logo = raw.logoUrl;
  }

  return (
    <EditableContentProvider
      componentOverrides={overrides}
      tenantSlug={slug}
      isEditorMode={false}
      isPreviewMode={true}
    >
      <StoreContextProvider initialStore={storeFormData} userRole="ADMIN" userId={userId}>
        <div className="bg-slate-50 dark:bg-gray-900 w-full mx-auto text-gray-900 dark:text-gray-100 min-h-screen">
          
          {/* ⚠️ Render Grace Period Banner if payment is past due but store remains accessible */}
          {isPastDueGracePeriod && (
            <SubscriptionGraceBanner storeName={raw.name} daysLeft={graceDaysLeft} />
          )}

          <LayoutComponent params={{ storeFormData }}>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
            <WhatsAppBubble productName={''} />
            <AnalyticsProvider config={raw.AnalyticsConfig} />
          </LayoutComponent>
        </div>
      </StoreContextProvider>
    </EditableContentProvider>
  );
}