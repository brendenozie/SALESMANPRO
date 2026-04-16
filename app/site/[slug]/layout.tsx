import { notFound } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import { headers } from 'next/headers';
import type { Metadata } from 'next';

import { StoreContextProvider } from '@/contexts/StoreContext';
import categoryHeaderFooterLayoutMap from '@/components/site/layouts/categoryHeaderFooterLayoutMap';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';
import LoadingSpinner from '@/components/site/LoadingSpinner';
import { SITE_CATEGORIES } from '@/utils/sitedata';
import { findCompanyCached, leanShellInclude } from '@/lib/company-fetcher';
import WhatsAppBubble from '@/components/WhatsAppBubble';

// Cache for ISR (60 seconds)
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hdrs = await headers();
  const requestedHost = hdrs.get('x-requested-host');
  const requestedSubdomain = hdrs.get('x-requested-subdomain');

  // Request only data needed for shell & SEO. The cached `findCompany` is used.
  let company = await findCompanyCached(slug, requestedHost, requestedSubdomain, leanShellInclude());

  if (!company) {
    return { title: 'Store not found' };
  }

  // Normalize access to SEO data
  const seo = (company as any).SEO ?? (company as any).sEO;
  const title = seo?.title || company.name || 'Ghuba';
  const description = seo?.description || 'Discover our exclusive collection.';

  return {
    title,
    description,
    keywords: seo?.keywords || 'ecommerce, ghuba, shops, marketplace',
    openGraph: {
      title,
      description,
      images: [company.logoUrl || ''],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [company.logoUrl || ''],
    },
  };
}

interface StoreLayoutProps {
  params: { slug: string };
  children: ReactNode;
}

export default async function StoreLayout({ params, children }: StoreLayoutProps) {
  const { slug } = await params;
  const hdrs = await headers();
  const requestedHost = hdrs.get('x-requested-host');
  const requestedSubdomain = hdrs.get('x-requested-subdomain');

  // This call will be de-duplicated by React.cache, hitting the cache instead of the DB again.
  const raw = await findCompanyCached(slug, requestedHost, requestedSubdomain, leanShellInclude());
  if (!raw) {
    notFound();
  }

  const storeFormData = transformCompanyToStoreForm(raw);
  const category = normalize(storeFormData.category || 'other');
  const variant = normalize(storeFormData.variant || '');
  
  // --- Layout selection logic (remains the same) ---
  let LayoutComponent = categoryHeaderFooterLayoutMap[variant] || categoryHeaderFooterLayoutMap[category]
    || (() => {
      const matchedCategory = SITE_CATEGORIES.find((c) => normalize(c.name) === category);
      if (matchedCategory?.variants?.length) {
        const firstVariant = normalize(matchedCategory.variants[0].name);
        return categoryHeaderFooterLayoutMap[firstVariant];
      }
    })()
    || categoryHeaderFooterLayoutMap['default'];

  const userId = ''; // TODO: Replace with session data

  return (
    <StoreContextProvider initialStore={storeFormData} userRole="ADMIN" userId={userId}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 w-full mx-auto ">
        <LayoutComponent params={{ storeFormData }}>
          {/* Suspense is key for streaming UI while page data loads */}
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
          <WhatsAppBubble productName={''} />
        </LayoutComponent>
      </div>
    </StoreContextProvider>
  );
}

// Helper can remain or be moved to a utils file
function normalize(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9&() ]/g, '')
    .replace(/\s+/g, ' ');
}