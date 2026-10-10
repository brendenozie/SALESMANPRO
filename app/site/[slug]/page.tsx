import { loadStore } from '@/lib/loadStore';
import { getEnabledPaymentMethods } from '@/utils/payment-utils';
import { BodyComponentMap } from '@/components/site/BodyComponentMap';
import { StoreDataSync } from '@/contexts/StoreContext';
import { isGhubaMarketplace } from '@/lib/ghuba-helpers';
import DiagnosticHudLoader from '@/components/website-builder/DiagnosticHudLoader';
import { applyWebsiteConfigToStoreData } from '@/lib/website-builder/applyWebsiteConfigToStoreData';

export const revalidate = 300;

interface StorePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  
  // Extract pre-resolved store data & canonical template memoized in loadStore
  const { componentName, pageData, raw, ghubaData, canonicalTemplate } = await loadStore(slug);

  const isGhuba = isGhubaMarketplace(slug, raw) || componentName === 'GhubaSite';

  const resolvedComponentName = isGhuba
    ? 'GhubaSite'
    : (canonicalTemplate?.bodyComponent || componentName || 'DefaultSite');
  const BodyComponent =
    BodyComponentMap[resolvedComponentName] || BodyComponentMap['DefaultSite'];
  const enabledPaymentMethods = getEnabledPaymentMethods(raw?.PaymentSettings);

  // Blend published config overrides into pageData if present (without destroying template structure)
  const publishedConfig = raw?.website?.publishedConfig as any;
  if (publishedConfig) {
    pageData = applyWebsiteConfigToStoreData(pageData, publishedConfig, 'home');

    // Guard: For Ghuba, ensure activeSections contains authentic Ghuba marketplace sections.
    // If activeSections only contains generic store sections (e.g. sec-hero, sec-features),
    // re-seed pageData.sections from canonicalTemplate.authenticSections
    const activeSections = pageData.sections || [];
    if (isGhuba) {
      const hasGhubaSections = activeSections.some((s: any) => {
        const id = (s.id || '').toLowerCase();
        const comp = (s.component || '').toLowerCase();
        return (
          id.includes('ghuba') ||
          id.includes('bannerslider') ||
          id.includes('flashdeals') ||
          id.includes('topcate') ||
          id.includes('newarrivals') ||
          comp === 'bannerslider' ||
          comp === 'flashdeals' ||
          comp === 'topcate' ||
          comp === 'newarrivals' ||
          comp === 'discount' ||
          comp === 'shop' ||
          comp === 'annocument' ||
          comp === 'wrapper'
        );
      });

      if (!hasGhubaSections && canonicalTemplate?.authenticSections?.length) {
        pageData.sections = canonicalTemplate.authenticSections.map((sec) => ({
          id: sec.id,
          type: sec.type,
          component: sec.component,
          title: sec.label,
          visible: true,
          order: sec.defaultOrder,
          content: sec.defaultContent ? JSON.parse(JSON.stringify(sec.defaultContent)) : {},
        }));
      }
    }
  } else {
    // When no publishedConfig exists yet, seed authentic sections from canonicalTemplate
    if (!pageData.sections && canonicalTemplate?.authenticSections?.length) {
      pageData.sections = canonicalTemplate.authenticSections.map((sec) => ({
        id: sec.id,
        type: sec.type,
        component: sec.component,
        title: sec.label,
        visible: true,
        order: sec.defaultOrder,
        content: sec.defaultContent ? JSON.parse(JSON.stringify(sec.defaultContent)) : {},
      }));
    }
  }

  return (
    <main className="text-gray-900 dark:text-gray-100 min-h-screen w-full mx-auto">
      <StoreDataSync data={pageData} />
      <BodyComponent 
        pageData={pageData} 
        companyId={raw.id} 
        paymentMethods={enabledPaymentMethods}
        ghubaData={ghubaData}
      />
      {process.env.NODE_ENV !== 'production' && (
        <DiagnosticHudLoader
          slug={slug}
          template={canonicalTemplate}
          pageSlug="home"
          hasPublishedConfig={!!publishedConfig}
          sectionsCount={canonicalTemplate.authenticSections.length}
          category={raw?.category}
          variant={raw?.variant}
        />
      )}
    </main>
  );
}

