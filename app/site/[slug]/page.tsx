import { loadStore } from '@/lib/loadStore';
import { getEnabledPaymentMethods } from '@/utils/payment-utils';
import { BodyComponentMap } from '@/components/site/BodyComponentMap';
import { StoreDataSync } from '@/contexts/StoreContext';
import WebsiteRenderer from '@/components/website-builder/WebsiteRenderer';

export const revalidate = 60;

interface StorePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  
  // Extract ghubaData alongside the rest
  const { componentName, pageData, raw, ghubaData } = await loadStore(slug);

  // Check if tenant has an active published dynamic website
  const publishedConfig = raw?.website?.publishedConfig ? (raw.website.publishedConfig as any) : null;
  if (publishedConfig) {
    return (
      <main className="text-gray-900 dark:text-gray-100 min-h-screen w-full mx-auto">
        <StoreDataSync data={pageData} />
        <WebsiteRenderer
          config={publishedConfig}
          pageSlug="home"
          companyId={raw.id}
          storeLogoUrl={raw.logoUrl || raw.bannerUrl}
          contactPhone={raw.contactPhone}
          contactEmail={raw.contactEmail}
          address={raw.address || raw.addresses?.[0]?.address}
          socialLinks={raw.socialLinks}
        />
      </main>
    );
  }

  const BodyComponent = BodyComponentMap[componentName] || BodyComponentMap['DefaultSite'];
  const enabledPaymentMethods = getEnabledPaymentMethods(raw.PaymentSettings);

  return (
    <main className="text-gray-900 dark:text-gray-100 min-h-screen w-full mx-auto">
      <StoreDataSync data={pageData} />
      <BodyComponent 
        pageData={pageData} 
        companyId={raw.id} 
        paymentMethods={enabledPaymentMethods}
        ghubaData={ghubaData} // <-- Pass the pre-fetched data
      />
    </main>
  );
}