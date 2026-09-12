const fs = require('fs');
const path = require('path');

console.log('Adapting Batch 4 (Portfolio, SaaS, Marketplace & Automotive-2)...');

// 1. PortfolioSite.tsx
const p1Path = path.join(__dirname, '../components/site/layouts/PortfolioLayout/body/PortfolioSite.tsx');
let p1 = fs.readFileSync(p1Path, 'utf8');
if (!p1.includes('ThemeSectionContainer')) {
  p1 = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + p1;
  const returnIdx = p1.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection name={name} themeSettings={themeSettings} tagline={tagline} heroSlides={heroSlides} testimonials={testimonials} awards={awards} />,
    'business': <BusinessSection name={name} slug={slug} description={description} themeSettings={themeSettings} StoreCategory={StoreCategory} />,
    'marketplace-listings': <MarketplaceListingsSection name={name} slug={slug} themeSettings={themeSettings} marketplaceListings={marketplaceListings} />,
    'getting-started': <GettingStartedSection />,
    'features': <FeaturesSection themeSettings={themeSettings} name={name} promotions={promotions} tagline={tagline}/>,
    'about': <AboutSection name={name} slug={slug} bannerUrl={bannerUrl} contactEmail={contactEmail} stats={stats} themeSettings={themeSettings} description={description} tagline={tagline} heroSlides={heroSlides}/>,
    'case-studies': <CaseStudiesSection themeSettings={themeSettings} CoreValues={CoreValues} />,
    'discovery-call': <DiscoveryCallSection/>,
    'testimonials': <TestimonialsSection themeSettings={themeSettings} testimonials={testimonials} name={name} />,
    'faq': <FAQSection faqs={faqs} themeSettings={themeSettings}/>,
    'cta': <CtaSection/>,
    'contact': <ContactSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection name={name} themeSettings={themeSettings} tagline={tagline} heroSlides={heroSlides} testimonials={testimonials} awards={awards} />
      </div>
      <div id="section-business" data-editor-section="business" data-editor-component="BusinessSection">
        <BusinessSection name={name} slug={slug} description={description} themeSettings={themeSettings} StoreCategory={StoreCategory} />
      </div>
      <div id="section-marketplace-listings" data-editor-section="marketplace-listings" data-editor-component="MarketplaceListingsSection">
        <MarketplaceListingsSection name={name} slug={slug} themeSettings={themeSettings} marketplaceListings={marketplaceListings} />
      </div>
      <div id="section-getting-started" data-editor-section="getting-started" data-editor-component="GettingStartedSection">
        <GettingStartedSection />
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection themeSettings={themeSettings} name={name} promotions={promotions} tagline={tagline}/>
      </div> 
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection name={name} slug={slug} bannerUrl={bannerUrl} contactEmail={contactEmail} stats={stats} themeSettings={themeSettings} description={description} tagline={tagline} heroSlides={heroSlides}/>
      </div>
      <div id="section-case-studies" data-editor-section="case-studies" data-editor-component="CaseStudiesSection">
        <CaseStudiesSection themeSettings={themeSettings} CoreValues={CoreValues} />
      </div>
      <div id="section-discovery-call" data-editor-section="discovery-call" data-editor-component="DiscoveryCallSection">
        <DiscoveryCallSection/>
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
        <TestimonialsSection themeSettings={themeSettings} testimonials={testimonials} name={name} />
      </div>
      <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
        <FAQSection faqs={faqs} themeSettings={themeSettings}/>
      </div>
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection/>
      </div>
      <div id="section-contact" data-editor-section="contact" data-editor-component="ContactSection">
        <ContactSection />
      </div>
    </>
  );

  return (
    <div className="font-sans text-gray-800">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  p1 = p1.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(p1Path, p1);
  console.log('Adapted PortfolioLayout/body/PortfolioSite.tsx');
}

// 2. CompanyPortfolioSite.tsx
const cp1Path = path.join(__dirname, '../components/site/layouts/CompanyPortfolioLayout/body/CompanyPortfolioSite.tsx');
let cp1 = fs.readFileSync(cp1Path, 'utf8');
if (!cp1.includes('ThemeSectionContainer')) {
  cp1 = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + cp1;
  const returnIdx = cp1.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} name={pageData.name} />,
    'core-highlights': <CoreHighlightsSection pagedata={pageData} />,
    'grey-services': <GreyServicesSection services={pageData.marketplaceListings} storeSlug='' />,
    'about-us-spotlight': <AboutUsSpotlight pagedata={pageData} />,
    'programs-causes': <ProgramsCausesSection pagedata={pageData} />,
    'impact-stats': <ImpactStatsSection pagedata={pageData} />,
    'news': <NewsSection pagedata={pageData} />,
    'testimonials-news': <TestimonialsNewsSection pagedata={pageData} />,
    'cta-bold': <CtaBoldSection pagedata={pageData} />,
    'faq': <FAQSection pagedata={pageData} />,
    'call-to-action': <CallToActionSection companyId={companyId} schedulingLink={''} pagedata={pageData} />,
    'events-updates': <EventsUpdatesSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} name={pageData.name} />
      </div>
      <div id="section-core-highlights" data-editor-section="core-highlights" data-editor-component="CoreHighlightsSection">
        <CoreHighlightsSection pagedata={pageData} />
      </div>
      <div id="section-grey-services" data-editor-section="grey-services" data-editor-component="GreyServicesSection">
        <GreyServicesSection services={pageData.marketplaceListings} storeSlug='' />
      </div>
      <div id="section-about-us-spotlight" data-editor-section="about-us-spotlight" data-editor-component="AboutUsSpotlight">
        <AboutUsSpotlight pagedata={pageData} />
      </div>
      <div id="section-programs-causes" data-editor-section="programs-causes" data-editor-component="ProgramsCausesSection">
        <ProgramsCausesSection pagedata={pageData} />
      </div>
      <div id="section-impact-stats" data-editor-section="impact-stats" data-editor-component="ImpactStatsSection">
        <ImpactStatsSection pagedata={pageData} />
      </div>
      <div id="section-news" data-editor-section="news" data-editor-component="NewsSection">
        <NewsSection pagedata={pageData} />
      </div>
      <div id="section-testimonials-news" data-editor-section="testimonials-news" data-editor-component="TestimonialsNewsSection">
        <TestimonialsNewsSection pagedata={pageData} />
      </div>
      <div id="section-cta-bold" data-editor-section="cta-bold" data-editor-component="CtaBoldSection">
        <CtaBoldSection pagedata={pageData} />
      </div>
      <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
        <FAQSection pagedata={pageData} />
      </div>
      <div id="section-call-to-action" data-editor-section="call-to-action" data-editor-component="CallToActionSection">
        <CallToActionSection companyId={companyId} schedulingLink={''} pagedata={pageData} />
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-gray-100 font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </main>
  );
}
`;
  cp1 = cp1.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(cp1Path, cp1);
  console.log('Adapted CompanyPortfolioLayout/body/CompanyPortfolioSite.tsx');
}

// 3. CompanyPortfolioLightSite.tsx
const cp2Path = path.join(__dirname, '../components/site/layouts/CompanyPortfolioLightLayout/body/CompanyPortfolioLightSite.tsx');
let cp2 = fs.readFileSync(cp2Path, 'utf8');
if (!cp2.includes('ThemeSectionContainer')) {
  cp2 = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + cp2;
  const returnIdx = cp2.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} name={pageData.name} />,
    'core-highlights': <CoreHighlightsSection pagedata={pageData} />,
    'grey-services': <GreyServicesSection services={pageData.marketplaceListings} storeSlug='' />,
    'about-us-spotlight': <AboutUsSpotlight pagedata={pageData} />,
    'programs-causes': <ProgramsCausesSection pagedata={pageData} />,
    'impact-stats': <ImpactStatsSection pagedata={pageData} />,
    'news': <NewsSection pagedata={pageData} />,
    'testimonials-news': <TestimonialsNewsSection pagedata={pageData} />,
    'cta-bold': <CtaBoldSection pagedata={pageData} />,
    'faq': <FAQSection pagedata={pageData} />,
    'call-to-action': <CallToActionSection companyId={companyId} schedulingLink={''} pagedata={pageData} />,
    'events-updates': <EventsUpdatesSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} name={pageData.name} />
      </div>
      <div id="section-core-highlights" data-editor-section="core-highlights" data-editor-component="CoreHighlightsSection">
        <CoreHighlightsSection pagedata={pageData} />
      </div>
      <div id="section-grey-services" data-editor-section="grey-services" data-editor-component="GreyServicesSection">
        <GreyServicesSection services={pageData.marketplaceListings} storeSlug='' />
      </div>
      <div id="section-about-us-spotlight" data-editor-section="about-us-spotlight" data-editor-component="AboutUsSpotlight">
        <AboutUsSpotlight pagedata={pageData} />
      </div>
      <div id="section-programs-causes" data-editor-section="programs-causes" data-editor-component="ProgramsCausesSection">
        <ProgramsCausesSection pagedata={pageData} />
      </div>
      <div id="section-impact-stats" data-editor-section="impact-stats" data-editor-component="ImpactStatsSection">
        <ImpactStatsSection pagedata={pageData} />
      </div>
      <div id="section-news" data-editor-section="news" data-editor-component="NewsSection">
        <NewsSection pagedata={pageData} />
      </div>
      <div id="section-testimonials-news" data-editor-section="testimonials-news" data-editor-component="TestimonialsNewsSection">
        <TestimonialsNewsSection pagedata={pageData} />
      </div>
      <div id="section-cta-bold" data-editor-section="cta-bold" data-editor-component="CtaBoldSection">
        <CtaBoldSection pagedata={pageData} />
      </div>
      <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
        <FAQSection pagedata={pageData} />
      </div>
      <div id="section-call-to-action" data-editor-section="call-to-action" data-editor-component="CallToActionSection">
        <CallToActionSection companyId={companyId} schedulingLink={''} pagedata={pageData} />
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-white font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </main>
  );
}
`;
  cp2 = cp2.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(cp2Path, cp2);
  console.log('Adapted CompanyPortfolioLightLayout/body/CompanyPortfolioLightSite.tsx');
}

// 4. SaasSite.tsx
const saasPath = path.join(__dirname, '../components/site/layouts/SaaSLayout/body/SaasSite.tsx');
let saas = fs.readFileSync(saasPath, 'utf8');
if (!saas.includes('ThemeSectionContainer')) {
  saas = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + saas;
  const returnIdx = saas.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'enhanced-hero': (
      <EnhancedHeroSection
        store={siteStoreData}
        loader={loader}
        handleSignup={handleSignup}
      />
    ),
    'features': <FeaturesSection features={siteStoreData.features} />,
    'enhanced-pricing': (
      <EnhancedPricingSection
        plans={siteStoreData.plans}
        handleSignup={handleSignup}
      />
    ),
    'enhanced-testimonials': <EnhancedTestimonialsSection testimonials={siteStoreData.testimonials} />,
    'enhanced-faqs': <EnhancedFAQsSection faqs={siteStoreData.faqs} />,
  };

  const staticFallback = (
    <>
      <div id="section-enhanced-hero" data-editor-section="enhanced-hero" data-editor-component="EnhancedHeroSection">
        <EnhancedHeroSection
          store={siteStoreData}
          loader={loader}
          handleSignup={handleSignup}
        />
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection features={siteStoreData.features} />
      </div>
      <div id="section-enhanced-pricing" data-editor-section="enhanced-pricing" data-editor-component="EnhancedPricingSection">
        <EnhancedPricingSection
          plans={siteStoreData.plans}
          handleSignup={handleSignup}
        />
      </div>
      <div id="section-enhanced-testimonials" data-editor-section="enhanced-testimonials" data-editor-component="EnhancedTestimonialsSection">
        <EnhancedTestimonialsSection testimonials={siteStoreData.testimonials} />
      </div>
      <div id="section-enhanced-faqs" data-editor-section="enhanced-faqs" data-editor-component="EnhancedFAQsSection">
        <EnhancedFAQsSection faqs={siteStoreData.faqs} />
      </div>
    </>
  );

  return (
    <div className="space-y-28 font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  saas = saas.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(saasPath, saas);
  console.log('Adapted SaaSLayout/body/SaasSite.tsx');
}

// 5. Automotive2Site.tsx
const auto2Path = path.join(__dirname, '../components/site/layouts/Automotive2Layout/body/Automotive2Site.tsx');
let auto2 = fs.readFileSync(auto2Path, 'utf8');
if (!auto2.includes('ThemeSectionContainer')) {
  auto2 = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + auto2;
  const returnIdx = auto2.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <HeroSection
        store={storeFormData}
        trendingLocations={storeFormData?.CompanyLocation
          ? storeFormData?.CompanyLocation.map((loc: any) => ({
            name: loc.name,
            slug: loc.slug || loc.name?.toLowerCase().replace(/\\s+/g, "-"),
            metaKeywords: loc.metaKeywords || "",
            status: loc.status || "active",
            parentId: loc.parentId || null,
            ...loc,
          }))
          : []} 
        onSearch={() => {}}
      />
    ),
    'automotive-featured-listings': <AutomotiveFeaturedListingsWrapper companyId={pageData.id}/>,
    'how-it-works': <HowItWorks />,
    'browse-by-category': <BrowseByCategory store={storeFormData}/>,
    'trending-locations': (
      <TrendingLocations
        locations={
          storeFormData?.CompanyLocation
            ? storeFormData?.CompanyLocation.map((loc: any) => ({
                name: loc.name,
                slug: loc.slug || loc.name?.toLowerCase().replace(/\\s+/g, "-"),
                metaKeywords: loc.metaKeywords || "",
                status: loc.status || "active",
                parentId: loc.parentId || null,
                ...loc,
              }))
            : []
        }
        slug={"slug"}
      />
    ),
    'popular-vehicles': <PopularVehiclesWrapper companyId={pageData.id} />,
    'video-showcase': blogsData?.data ? <VideoShowcaseSection blogs={blogsData.data || []} /> : null,
    'market-insights': <MarketInsightsSection />,
    'testimonials': testimonialsData?.data ? <TestimonialsCarouselSection testimonials={testimonials} /> : null,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection
          store={storeFormData}
          trendingLocations={storeFormData?.CompanyLocation
            ? storeFormData?.CompanyLocation.map((loc: any) => ({
              name: loc.name,
              slug: loc.slug || loc.name?.toLowerCase().replace(/\\s+/g, "-"),
              metaKeywords: loc.metaKeywords || "",
              status: loc.status || "active",
              parentId: loc.parentId || null,
              ...loc,
            }))
            : []} 
          onSearch={() => {}}
        />
      </div>
      <div id="section-automotive-featured-listings" data-editor-section="automotive-featured-listings" data-editor-component="AutomotiveFeaturedListingsWrapper">
        <AutomotiveFeaturedListingsWrapper companyId={pageData.id}/>
      </div>
      <div id="section-how-it-works" data-editor-section="how-it-works" data-editor-component="HowItWorks">
        <HowItWorks />
      </div>
      <div id="section-browse-by-category" data-editor-section="browse-by-category" data-editor-component="BrowseByCategory">
        <BrowseByCategory store={storeFormData}/>
      </div>
      <div id="section-trending-locations" data-editor-section="trending-locations" data-editor-component="TrendingLocations">
        <TrendingLocations
          locations={
            storeFormData?.CompanyLocation
              ? storeFormData?.CompanyLocation.map((loc: any) => ({
                  name: loc.name,
                  slug: loc.slug || loc.name?.toLowerCase().replace(/\\s+/g, "-"),
                  metaKeywords: loc.metaKeywords || "",
                  status: loc.status || "active",
                  parentId: loc.parentId || null,
                  ...loc,
                }))
              : []
          }
          slug={"slug"}
        />
      </div>      
      <div id="section-popular-vehicles" data-editor-section="popular-vehicles" data-editor-component="PopularVehiclesWrapper">
        <PopularVehiclesWrapper companyId={pageData.id} />
      </div>
      {blogsData?.data && (
        <div id="section-video-showcase" data-editor-section="video-showcase" data-editor-component="VideoShowcaseSection">
          <VideoShowcaseSection blogs={blogsData.data || []} />
        </div>
      )}
      <div id="section-market-insights" data-editor-section="market-insights" data-editor-component="MarketInsightsSection">
        <MarketInsightsSection />
      </div>
      {testimonialsData?.data && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsCarouselSection">
          <TestimonialsCarouselSection testimonials={testimonials} />
        </div>
      )}
    </>
  );

  return (
    <div className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  auto2 = auto2.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(auto2Path, auto2);
  console.log('Adapted Automotive2Layout/body/Automotive2Site.tsx');
}

// 6. MarketPlaceSite.tsx
const mpPath = path.join(__dirname, '../components/site/layouts/MarketplaceLayout/body/MarketPlaceSite.tsx');
let mp = fs.readFileSync(mpPath, 'utf8');
if (!mp.includes('ThemeSectionContainer')) {
  mp = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + mp;
  const returnIdx = mp.indexOf('return (\n    <div>\n      \n       <div id="section-hero-banner"');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero-banner': <HeroBanner storeFormData={siteData} />,
    'category': <CategoryCarousel store={siteData} />,
    'store-page': <StorePageSection products={siteData.marketplaceListings} storeSlug={siteData.slug} />,
    'reviews': <ReviewsSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero-banner" data-editor-section="hero-banner" data-editor-component="HeroBanner">
        <HeroBanner storeFormData={siteData} />
      </div>
      <div id="section-category" data-editor-section="category" data-editor-component="CategoryCarousel">
        <CategoryCarousel store={siteData} />
      </div>
      <div id="section-store-page" data-editor-section="store-page" data-editor-component="StorePageSection">
        <StorePageSection products={siteData.marketplaceListings} storeSlug={siteData.slug} />
      </div>
      <div id="section-reviews" data-editor-section="reviews" data-editor-component="ReviewsSection">
        <ReviewsSection />
      </div>
    </>
  );

  return (
    <div>
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
      <AnimatePresence>
        {showMiniCart && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 right-6 z-50 shadow-xl"
          >
            <MiniCartPreview
              items={[
                { name: "Handcrafted Ceramic Vase", qty: 1, price: 2500, thumbnail: "/products/vase.jpg" },
                { name: "Leather Weekend Bag", qty: 1, price: 4500, thumbnail: "/products/bag.jpg" },
                { name: "Wireless Headphones", qty: 1, price: 12000, thumbnail: "/products/headphones.jpg" },
              ]}
              subtotal={19000}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
`;
  mp = mp.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(mpPath, mp);
  console.log('Adapted MarketplaceLayout/body/MarketPlaceSite.tsx');
}

// 7. DefaultSite.tsx
const defPath = path.join(__dirname, '../components/site/layouts/DefaultLayout/body/DefaultSite.tsx');
let def = fs.readFileSync(defPath, 'utf8');
if (!def.includes('ThemeSectionContainer')) {
  def = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + def;
  const returnIdx = def.indexOf('return (');
  const returnBlock = `
  const sectionContent = (
    <div id="section-default" data-editor-section="default" data-editor-component="DefaultSite" className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl border border-neutral-200 p-10 text-center"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.6 }}
          className="absolute top-0 left-0 h-1 bg-neutral-900 rounded-t-2xl"
        />
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-bold tracking-tight text-neutral-900"
        >
          {status}
        </motion.h1>
        <p className="mt-3 text-xl font-medium text-neutral-800">
          Something went wrong
        </p>
        <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto">
          {displayMessage}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition"
          >
            <HomeIcon className="h-4 w-4" />
            Go Home
          </button>
          <button
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </motion.div>
    </div>
  );

  const sectionMap: Record<string, React.ReactNode> = {
    'default': sectionContent,
  };

  return (
    <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={sectionContent} />
  );
}
`;
  def = def.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(defPath, def);
  console.log('Adapted DefaultLayout/body/DefaultSite.tsx');
}
