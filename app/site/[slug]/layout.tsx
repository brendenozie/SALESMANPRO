import { notFound } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';

import { StoreContextProvider } from '@/contexts/StoreContext';
import categoryHeaderFooterLayoutMap from '@/components/site/layouts/categoryHeaderFooterLayoutMap';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';
import LoadingSpinner from '@/components/site/LoadingSpinner';
import { SITE_CATEGORIES } from '@/utils/sitedata';
import { findCompanyCached } from '@/lib/company-fetcher';
import WhatsAppBubble from '@/components/WhatsAppBubble';

import siteMetadata from '@/data/siteMetadata';
import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';
import { SubscriptionGraceBanner, SubscriptionInactiveView } from './SubscriptionGraceBanner';

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
  const isPastDueGracePeriod = subStatus === 'past_due' && renewalDate && new Date(renewalDate) > new Date(); 
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
  const category = normalize(storeFormData.category || 'other');
  const variant = normalize(storeFormData.variant || '');
  const categoryMap = new Map(SITE_CATEGORIES.map(c => [normalize(c.name), c]));

  let LayoutComponent = categoryHeaderFooterLayoutMap[variant] 
    || categoryHeaderFooterLayoutMap[category]
    || (() => {
      const matchedCategory = categoryMap.get(category);
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
    <StoreContextProvider initialStore={storeFormData} userRole="ADMIN" userId={userId}>
      <div className="bg-slate-50 dark:bg-gray-900 w-full mx-auto text-gray-900 dark:text-gray-100 min-h-screen">
        
        {/* ⚠️ Render Grace Period Banner if payment is past due but store remains accessible */}
        {isPastDueGracePeriod && (
          <SubscriptionGraceBanner storeName={raw.name} daysLeft={3} />
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
  );
}