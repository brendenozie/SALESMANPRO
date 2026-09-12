import { loadStore } from '@/lib/loadStore';
import { getEnabledPaymentMethods } from '@/utils/payment-utils';
import { BodyComponentMap } from '@/components/site/BodyComponentMap';
import { StoreDataSync } from '@/contexts/StoreContext';
import { resolveCanonicalTemplate } from '@/lib/website-builder/template-registry';
import TemplateDiagnosticHud from '@/components/website-builder/TemplateDiagnosticHud';
import { isGhubaMarketplace } from '@/lib/ghuba-helpers';

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

  const isGhuba = isGhubaMarketplace(slug, raw) || componentName === 'GhubaSite';

  // Deterministically resolve canonical template identity
  const canonicalTemplate = isGhuba
    ? resolveCanonicalTemplate("portal", "ghuba", "ghuba@v1")
    : resolveCanonicalTemplate(
        raw?.category,
        raw?.variant,
        raw?.website?.templateKey
      );

  const resolvedComponentName = isGhuba
    ? 'GhubaSite'
    : (canonicalTemplate.bodyComponent || componentName || 'DefaultSite');
  const BodyComponent =
    BodyComponentMap[resolvedComponentName] || BodyComponentMap['DefaultSite'];
  const enabledPaymentMethods = getEnabledPaymentMethods(raw?.PaymentSettings);

  // Blend published config overrides into pageData if present (without destroying template structure)
  const publishedConfig = raw?.website?.publishedConfig as any;
  if (publishedConfig) {
    if (publishedConfig.theme) {
      pageData.themeSettings = {
        ...(pageData.themeSettings || {}),
        primaryColor: publishedConfig.theme.primaryColor || pageData.themeSettings?.primaryColor,
        secondaryColor: publishedConfig.theme.secondaryColor || pageData.themeSettings?.secondaryColor,
        fontFamily: publishedConfig.theme.headingFont || pageData.themeSettings?.fontFamily,
      };
    }

    // Attach component overrides directly to pageData
    if (publishedConfig.componentOverrides) {
      pageData.componentOverrides = {
        ...(pageData.componentOverrides || {}),
        ...publishedConfig.componentOverrides,
      };
    }

    // Resolve sections from publishedConfig (checking pages[0].sections or top-level sections)
    const activeSections =
      publishedConfig.pages?.[0]?.sections || publishedConfig.sections || [];
    pageData.sections = activeSections;
    pageData.websiteConfig = publishedConfig;

    // Guard: For Ghuba, ensure activeSections contains authentic Ghuba marketplace sections.
    // If activeSections only contains generic store sections (e.g. sec-hero, sec-features),
    // re-seed pageData.sections from canonicalTemplate.authenticSections
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

    // Merge structured hero configuration if present
    const heroSection = activeSections.find(
      (s: any) => s.type === 'hero' || s.id?.includes('hero')
    );
    if (heroSection?.content) {
      pageData.heroConfig = heroSection.content;
      if (heroSection.content.slides?.length) {
        pageData.heroSlides = heroSection.content.slides.map((s: any) => ({
          id: s.id,
          imageUrl: s.imageUrl || pageData.bannerUrl,
          headline: s.headline || s.title,
          subline: s.subline || s.eyebrow || s.description,
          badgeText: s.badgeText || s.description,
          ctaText: s.ctaText || s.primaryButtonText || 'Shop Now',
          ctaLink: s.ctaLink || s.primaryButtonUrl || '/products',
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
      <TemplateDiagnosticHud
        slug={slug}
        template={canonicalTemplate}
        pageSlug="home"
        hasPublishedConfig={!!publishedConfig}
        sectionsCount={canonicalTemplate.authenticSections.length}
        category={raw?.category}
        variant={raw?.variant}
      />
    </main>
  );
}
