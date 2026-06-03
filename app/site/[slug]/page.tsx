// // app/site/[slug]/page.tsx


import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';
import { loadStore } from '@/lib/loadStore';
import { getEnabledPaymentMethods } from '@/utils/payment-utils';
import { BodyComponentMap } from '@/components/site/BodyComponentMap';

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
  
  const BodyComponent = BodyComponentMap[componentName] || BodyComponentMap['DefaultSite'];
  
  // This ensures 'enabledMethods' only contains safe, active methods
  const enabledPaymentMethods = getEnabledPaymentMethods(raw.PaymentSettings);

  return (
    <main className="bg-black dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen w-full mx-auto">
      <BodyComponent pageData={pageData} companyId={raw.id} paymentMethods={enabledPaymentMethods}/>

      {/* Load google analytics script per store */}
      <AnalyticsProvider config={pageData.analyticsConfig} />
    </main>
  );
}

