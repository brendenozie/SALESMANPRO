// app/site/[tenantSlug]/layout.tsx
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

// ISR Activation: Allows caching static pages on the edge for 60 seconds
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

// Safely extract SEO regardless of Prisma casing quirks
function extractSEO(company: any) {
  return company?.SEO ?? company?.sEO ?? {};
}

// Ensure no double slashes when joining URLs
function getCleanSiteUrl() {
  return siteMetadata.siteUrl.replace(/\/$/, '');
}

// --- METADATA ---

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  // Blazing fast cache read using only the parsed param string
  const company = await findCompanyCached(slug, 'lean');

  // 🛑 Generate 404 if the company doesn't exist OR subscription is inactive
  if (!company || !company.subscription?.isActive) {
    return { 
      title: 'Store not found',
      description: 'The requested store could not be found or is currently inactive.'
    };
  }

  const seo = extractSEO(company);
  const title = seo.title || company.name;
  const description = seo.description || 'Discover our exclusive collection.';

  // Safely fallback to the root layout's social banner if the store has no logo
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

  // React dedupes this call automatically
  const raw = await findCompanyCached(slug, 'lean');
  
  // 🛑 Generate 404 page if company doesn't exist OR subscription is inactive
  if (!raw || !raw.subscription?.isActive || raw.subscription?.status?.toLowerCase() !== 'active') {
    notFound();
  }

  // NOTE: Ensure your `transformCompanyToStoreForm` utility handles the 
  // "ghuba" domain/slug overrides internally to keep this layout clean.
  const storeFormData = transformCompanyToStoreForm(raw);

  const category = normalize(storeFormData.category || 'other');
  const variant = normalize(storeFormData.variant || '');

  const categoryMap = new Map(SITE_CATEGORIES.map(c => [normalize(c.name), c]));

  // Determine the Layout Component dynamically
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

  const userId = ''; // Replace with session data when needed

  // Build the JSON-LD object safely
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
      <div className="bg-slate-50 dark:bg-gray-900 w-full mx-auto text-gray-900 dark:text-gray-100">
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