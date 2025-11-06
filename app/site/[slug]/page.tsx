// // app/site/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';
import { findCompanyCached, pageDataInclude } from '@/lib/company-fetcher';
import { getComponentNameForCategory } from '@/components/site/layouts/siteBodyComponentMap';
import { BodyComponentMap } from '@/components/site/BodyComponentMap';

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const hdrs = await headers();
  const requestedHost = hdrs.get("x-requested-host");
  const requestedSubdomain = hdrs.get("x-requested-subdomain");

  // --- 1. Use the cached findCompany function ---
  // This call uses the same cache as the layout but requests more data.
  // Next.js is smart enough to merge the data requirements and only make one DB call.
  const raw = await findCompanyCached(slug, requestedHost, requestedSubdomain, pageDataInclude());

  if (!raw) {
    console.log("Store page: Company not found for", slug, "or host", requestedHost, "or subdomain", requestedSubdomain);
    notFound();
  }

  // --- 2. Transform data and select the component ---
  const pageData = transformCompanyToStoreForm(raw);
  const componentName = getComponentNameForCategory(pageData.category, pageData.variant || '');
  
  const BodyComponent = BodyComponentMap[componentName] || BodyComponentMap['DefaultSite'];

  return (
    <main className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      <BodyComponent pageData={pageData} companyId={raw.id} />
    </main>
  );
}
