// // app/site/[slug]/page.tsx


import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';
import { loadStore } from '@/lib/loadStore';
import { getEnabledPaymentMethods } from '@/utils/payment-utils';
import { BodyComponentMap } from '@/components/site/BodyComponentMap';
import Script from 'next/script';

interface StorePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorePage({
  params,
}: StorePageProps) {
  const { slug } = await params;

  const { componentName, pageData, raw } = await loadStore(slug);

  // 1. Create the Schema.org JSON object
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness', // or 'Organization'
    name: raw.name,
    image: raw.logoUrl,
    logo: raw.logoUrl,    // <--- Explicitly tells Google this is the logo
    url: `https://yourdomain.com/${slug}`,
    description: raw.SEO?.description || 'Store description',
  };
  
  const BodyComponent = BodyComponentMap[componentName] || BodyComponentMap['DefaultSite'];
  
  // This ensures 'enabledMethods' only contains safe, active methods
  const enabledPaymentMethods = getEnabledPaymentMethods(raw.PaymentSettings);

  return (
    <main className="bg-black dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen w-full mx-auto">
      {/* 2. Inject the JSON-LD securely */}
      <Script
        id={`json-ld-store-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BodyComponent pageData={pageData} companyId={raw.id} paymentMethods={enabledPaymentMethods}/>

      {/* Load google analytics script per store */}
      <AnalyticsProvider config={pageData.analyticsConfig} />
    </main>
  );
}

