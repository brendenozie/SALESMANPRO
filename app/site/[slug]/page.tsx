// app/site/[slug]/page.tsx

import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';
import { loadStore } from '@/lib/loadStore';
import { getEnabledPaymentMethods } from '@/utils/payment-utils';
import { BodyComponentMap } from '@/components/site/BodyComponentMap';
import siteMetadata from '@/data/siteMetadata'; // Ensure you import this

interface StorePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const { componentName, pageData, raw } = await loadStore(slug);

  // 1. Build the JSON-LD object with null-safety
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: raw.name,
    url: `${siteMetadata.siteUrl}/${slug}`,
    description: raw.SEO?.description || 'Discover our exclusive collection.',
  };

  // Only attach image/logo if they exist to prevent Schema validation errors
  if (raw.logoUrl) {
    jsonLd.image = raw.logoUrl;
    jsonLd.logo = raw.logoUrl;
  }

  const BodyComponent = BodyComponentMap[componentName] || BodyComponentMap['DefaultSite'];
  const enabledPaymentMethods = getEnabledPaymentMethods(raw.PaymentSettings);

  return (
    <main className="bg-black dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen w-full mx-auto">
      {/* 2. Inject JSON-LD using a standard script tag for instant crawler parsing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BodyComponent 
        pageData={pageData} 
        companyId={raw.id} 
        paymentMethods={enabledPaymentMethods}
      />

      <AnalyticsProvider config={pageData.analyticsConfig} />
    </main>
  );
}