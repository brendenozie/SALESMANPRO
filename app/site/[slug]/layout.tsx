// app/site/[tenantSlug]/layout.tsx
import { notFound } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import type { Metadata } from 'next';

import { StoreContextProvider } from '@/contexts/StoreContext';
import categoryHeaderFooterLayoutMap from '@/components/site/layouts/categoryHeaderFooterLayoutMap';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';
import LoadingSpinner from '@/components/site/LoadingSpinner';
import { SITE_CATEGORIES } from '@/utils/sitedata';
import { findCompanyCached } from '@/lib/company-fetcher';
import WhatsAppBubble from '@/components/WhatsAppBubble';


// ISR Activation: Allows caching static pages on the edge for 60 seconds
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Blazing fast cache read using only the parsed param string
  const company = await findCompanyCached(slug, 'lean');

  if (!company) {
    return { title: 'Store not found' };
  }

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
  params: Promise<{ slug: string }>;
  children: ReactNode;
}

export default async function StoreLayout({ params, children }: StoreLayoutProps) {
  const { slug } = await params;

  // React dedupes this call automatically. It will hit the unstable_cache, not your database.
  const raw = await findCompanyCached(slug, 'lean');
  
  if (!raw) {
    notFound();
  }

  const storeFormData = transformCompanyToStoreForm(raw);
  const category = normalize(storeFormData.category || 'other');
  const variant = normalize(storeFormData.variant || '');

  const categoryMap = new Map(SITE_CATEGORIES.map(c => [normalize(c.name), c]));
  
  let LayoutComponent = categoryHeaderFooterLayoutMap[variant] || categoryHeaderFooterLayoutMap[category]
    || (() => {
      // const matchedCategory = SITE_CATEGORIES.find((c) => normalize(c.name) === category);
      const matchedCategory = categoryMap.get(category)
      if (matchedCategory?.variants?.length) {
        const firstVariant = normalize(matchedCategory.variants[0].name);
        return categoryHeaderFooterLayoutMap[firstVariant];
      }
    })()
    || categoryHeaderFooterLayoutMap['default'];

  const userId = ''; // Replace with session data when needed

  return (
    <StoreContextProvider initialStore={storeFormData} userRole="ADMIN" userId={userId}>
      <div className="bg-black dark:bg-gray-900 text-gray-800 dark:text-gray-200 w-full mx-auto">
        <LayoutComponent params={{ storeFormData }}>
          {/* Suspense handles streaming UI cleanly while the lower page data mounts */}
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
          <WhatsAppBubble productName={''} />
        </LayoutComponent>
      </div>
    </StoreContextProvider>
  );
}

function normalize(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9&() ]/g, '')
    .replace(/\s+/g, ' ');
}
