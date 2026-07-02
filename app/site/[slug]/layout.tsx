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


// ISR Activation: Allows caching static pages on the edge for 60 seconds
export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  // Blazing fast cache read using only the parsed param string
  const company = await findCompanyCached(slug, 'lean');

  if (!company) {
    return { 
      title: 'Store not found',
      description: 'The requested store could not be found on Ghuba.'
    };
  }

  const seo = (company as any).SEO ?? (company as any).sEO;
  const title = seo?.title || company.name;// || 'Ghuba';
  const description = seo?.description || 'Discover our exclusive collection.';

  // Safely fallback to the root layout's social banner if the store has no logo
  const previousImages = (await parent).openGraph?.images || [];
  const images = company.logoUrl ? [company.logoUrl] : previousImages;

  return {
    title,
    description,
    icons: company.logoUrl ? { icon: company.logoUrl, apple: company.logoUrl } : undefined,
    keywords: seo?.keywords || 'ecommerce, ghuba, shops, marketplace',
    alternates: {
      canonical: `/${slug}`, // Prevents duplicate content penalties
    },
    openGraph: {
      title,
      description,
      url: `/${slug}`, // Ensures social shares link directly to the profile
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

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { slug } = await params;

//   // Blazing fast cache read using only the parsed param string
//   const company = await findCompanyCached(slug, 'lean');

//   if (!company) {
//     return { title: 'Store not found' };
//   }

//   const seo = (company as any).SEO ?? (company as any).sEO;
//   const title = seo?.title || company.name || 'Ghuba';
//   const description = seo?.description || 'Discover our exclusive collection.';

//   return {
//     title,
//     description,
//     keywords: seo?.keywords || 'ecommerce, ghuba, shops, marketplace',
//     openGraph: {
//       title,
//       description,
//       images: [company.logoUrl || ''],
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title,
//       description,
//       images: [company.logoUrl || ''],
//     },
//   };
// }

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
  // const category = normalize(storeFormData.category || 'other');
  // const variant = normalize(storeFormData.variant || '');

  // const categoryMap = new Map(SITE_CATEGORIES.map(c => [normalize(c.name), c]));
  
  // let LayoutComponent = categoryHeaderFooterLayoutMap[variant] || categoryHeaderFooterLayoutMap[category]
  //   || (() => {
  //     const matchedCategory = categoryMap.get(category)
  //     if (matchedCategory?.variants?.length) {
  //       const firstVariant = normalize(matchedCategory.variants[0].name);
  //       return categoryHeaderFooterLayoutMap[firstVariant];
  //     }
  //   })()
  //   || categoryHeaderFooterLayoutMap['default'];

  // 1. Normalize the inputs
  const categoryInput = storeFormData.category || 'other';
  const variantInput = storeFormData.variant || '';

  // 2. Apply your "ghuba" override logic
  const isGhuba = storeFormData.domain === 'ghuba' || storeFormData.slug === 'ghuba';

  const category = isGhuba ? 'other' : normalize(categoryInput);
  const variant = isGhuba ? 'ghuba' : normalize(variantInput);

  // 3. Map setup
  const categoryMap = new Map(SITE_CATEGORIES.map(c => [normalize(c.name), c]));

  // 4. Determine the Layout Component
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

  return (
    <StoreContextProvider initialStore={storeFormData} userRole="ADMIN" userId={userId}>
      <div className="bg-slate-50 dark:bg-gray-900 w-full mx-auto text-gray-900 dark:text-gray-100">
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
