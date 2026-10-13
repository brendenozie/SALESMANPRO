const fs = require('fs');
const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/CompanyPortfolioLightSite.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = '  const sectionMap: Record<string, React.ReactNode> = {';
const before = content.substring(0, content.indexOf(target));
const afterIndex = content.indexOf('  return (', content.indexOf('const staticFallback = ('));
const after = content.substring(afterIndex);

const replacement = `  const heroNode = <HeroSection heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} name={pageData.name} />;
  const coreHighlightsNode = <CoreHighlightsSection pagedata={pageData} />;
  const servicesNode = <GreyServicesSection services={pageData.marketplaceListings} storeSlug='' />;
  const aboutSpotlightNode = <AboutUsSpotlight pagedata={pageData} />;
  const programsNode = <ProgramsCausesSection pagedata={pageData} />;
  const impactStatsNode = <ImpactStatsSection pagedata={pageData} />;
  const newsNode = <NewsSection pagedata={pageData} />;
  const testimonialsNode = <TestimonialsNewsSection pagedata={pageData} />;
  const ctaBoldNode = <CtaBoldSection pagedata={pageData} />;
  const faqNode = <FAQSection pagedata={pageData} />;
  const callToActionNode = <CallToActionSection companyId={companyId} schedulingLink={''} pagedata={pageData} />;
  const eventsNode = <EventsUpdatesSection />;

  const sectionMap: Record<string, React.ReactNode> = {
    'hero': heroNode,
    'portfolio-hero': heroNode,
    'company-portfolio-hero': heroNode,
    'core-highlights': coreHighlightsNode,
    'company-portfolio-core-highlights': coreHighlightsNode,
    'grey-services': servicesNode,
    'portfolio-services': servicesNode,
    'company-portfolio-services': servicesNode,
    'services': servicesNode,
    'about-us-spotlight': aboutSpotlightNode,
    'about-spotlight': aboutSpotlightNode,
    'company-portfolio-about-spotlight': aboutSpotlightNode,
    'programs-causes': programsNode,
    'company-portfolio-programs-causes': programsNode,
    'programs': programsNode,
    'impact-stats': impactStatsNode,
    'company-portfolio-impact-stats': impactStatsNode,
    'news': newsNode,
    'news-section': newsNode,
    'company-portfolio-news': newsNode,
    'testimonials-news': testimonialsNode,
    'portfolio-testimonials': testimonialsNode,
    'company-portfolio-testimonials': testimonialsNode,
    'testimonials': testimonialsNode,
    'cta-bold': ctaBoldNode,
    'company-portfolio-cta-bold': ctaBoldNode,
    'faq': faqNode,
    'faqs': faqNode,
    'portfolio-faqs': faqNode,
    'company-portfolio-faqs': faqNode,
    'call-to-action': callToActionNode,
    'portfolio-cta': callToActionNode,
    'company-portfolio-cta': callToActionNode,
    'events-updates': eventsNode,
    'company-portfolio-events-updates': eventsNode,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        {heroNode}
      </div>
      <div id="section-core-highlights" data-editor-section="core-highlights" data-editor-component="CoreHighlightsSection">
        {coreHighlightsNode}
      </div>
      <div id="section-grey-services" data-editor-section="grey-services" data-editor-component="GreyServicesSection">
        {servicesNode}
      </div>
      <div id="section-about-us-spotlight" data-editor-section="about-us-spotlight" data-editor-component="AboutUsSpotlight">
        {aboutSpotlightNode}
      </div>
      <div id="section-programs-causes" data-editor-section="programs-causes" data-editor-component="ProgramsCausesSection">
        {programsNode}
      </div>
      <div id="section-impact-stats" data-editor-section="impact-stats" data-editor-component="ImpactStatsSection">
        {impactStatsNode}
      </div>
      <div id="section-news" data-editor-section="news" data-editor-component="NewsSection">
        {newsNode}
      </div>
      <div id="section-testimonials-news" data-editor-section="testimonials-news" data-editor-component="TestimonialsNewsSection">
        {testimonialsNode}
      </div>
      <div id="section-cta-bold" data-editor-section="cta-bold" data-editor-component="CtaBoldSection">
        {ctaBoldNode}
      </div>
      <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
        {faqNode}
      </div>
      <div id="section-call-to-action" data-editor-section="call-to-action" data-editor-component="CallToActionSection">
        {callToActionNode}
      </div>
    </>
  );

`;

fs.writeFileSync(file, before + replacement + after, 'utf8');
console.log('Successfully updated CompanyPortfolioLightSite.tsx');
