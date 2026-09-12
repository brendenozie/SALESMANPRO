const fs = require('fs');
const path = require('path');

console.log('Adapting Batch 5 (Lifestyle, Media, Health & Travel)...');

// 1. FitnessSite.tsx
const fitPath = path.join(__dirname, '../components/site/layouts/FitnessLayout/body/FitnessSite.tsx');
let fit = fs.readFileSync(fitPath, 'utf8');
if (!fit.includes('ThemeSectionContainer')) {
  fit = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + fit;
  const returnIdx = fit.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <HeroSection
        store={pageData} 
        onSearch={handleSearch}
        trendingLocations={
          CompanyLocation
            ? CompanyLocation.map((loc: any) => ({
                name: loc.name,
                slug: loc.slug || loc.name?.toLowerCase().replace(/\\s+/g, "-"),
                metaKeywords: loc.metaKeywords || "",
                status: loc.status || "active",
                parentId: loc.parentId || null,
                ...loc,
              }))
            : []
        }
      />
    ),
    'fitness-hero': (
      <HeroSection
        store={pageData} 
        onSearch={handleSearch}
        trendingLocations={
          CompanyLocation
            ? CompanyLocation.map((loc: any) => ({
                name: loc.name,
                slug: loc.slug || loc.name?.toLowerCase().replace(/\\s+/g, "-"),
                metaKeywords: loc.metaKeywords || "",
                status: loc.status || "active",
                parentId: loc.parentId || null,
                ...loc,
              }))
            : []
        }
      />
    ),
    'category': <CategorySection store={pageData} />,
    'fitness-category': <CategorySection store={pageData} />,
    'listings-grid': <ListingsGrid programs={featured}/>,
    'classes-grid': <ClassesGrid courses={siteData?.courses}/>,
    'locations': <LocationsSection />,
    'virtual-tours': <VirtualTours videos={[]} />,
    'experts': <ExpertsSection educators={siteData?.Educator} />,
    'market-insights': <MarketInsights blogs={storeFormData?.blogs} />,
    'gallery': <GallerySection/>,
    'testimonials': <TestimonialsSection testimonials={storeFormData?.testimonials} />,
    'app-promotion': <AppPromotionSection />,
    'newsletter': <NewsletterSection />,
    'faqs': <FaqsSection faqs={storeFormData?.faqs} />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection store={pageData} 
          onSearch={handleSearch}
          trendingLocations={
            CompanyLocation
              ? CompanyLocation.map((loc: any) => ({
                  name: loc.name,
                  slug: loc.slug || loc.name?.toLowerCase().replace(/\\s+/g, "-"),
                  metaKeywords: loc.metaKeywords || "",
                  status: loc.status || "active",
                  parentId: loc.parentId || null,
                  ...loc,
                }))
              : []
          }
        />
      </div>
      <div id="section-category" data-editor-section="category" data-editor-component="CategorySection">
        <CategorySection store={pageData} />
      </div>
      <div id="section-listings-grid" data-editor-section="listings-grid" data-editor-component="ListingsGrid">
        <ListingsGrid programs={featured}/>
      </div>
      <div id="section-classes-grid" data-editor-section="classes-grid" data-editor-component="ClassesGrid">
        <ClassesGrid courses={siteData?.courses}/>
      </div>
      <div id="section-locations" data-editor-section="locations" data-editor-component="LocationsSection">
        <LocationsSection  />
      </div>
      <div id="section-virtual-tours" data-editor-section="virtual-tours" data-editor-component="VirtualTours">
        <VirtualTours videos={[]} />
      </div>
      <div id="section-experts" data-editor-section="experts" data-editor-component="ExpertsSection">
        <ExpertsSection educators={siteData?.Educator} />
      </div>
      <div id="section-market-insights" data-editor-section="market-insights" data-editor-component="MarketInsights">
        <MarketInsights blogs={storeFormData?.blogs} />
      </div>
      <div id="section-gallery" data-editor-section="gallery" data-editor-component="GallerySection">
        <GallerySection/>
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
        <TestimonialsSection testimonials={storeFormData?.testimonials} />
      </div>
      <div id="section-app-promotion" data-editor-section="app-promotion" data-editor-component="AppPromotionSection">
        <AppPromotionSection />
      </div>
      <div id="section-newsletter" data-editor-section="newsletter" data-editor-component="NewsletterSection">
        <NewsletterSection />
      </div>
      <div id="section-faqs" data-editor-section="faqs" data-editor-component="FaqsSection">
        <FaqsSection faqs={storeFormData?.faqs} />
      </div>
    </>
  );

  return (
    <div className={'relative w-full overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'}>
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  fit = fit.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(fitPath, fit);
  console.log('Adapted FitnessLayout/body/FitnessSite.tsx');
}

// 2. HealthcareSite.tsx
const hcPath = path.join(__dirname, '../components/site/layouts/HealthcareLayout/body/HealthCareSite.tsx');
let hc = fs.readFileSync(hcPath, 'utf8');
if (!hc.includes('ThemeSectionContainer')) {
  hc = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + hc;
  const returnIdx = hc.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'healthcare-hero': <HealthcareHero heroSlides={pageData.heroSlides} slug={pageData.slug} themeSettings={pageData.themeSettings}/>,
    'hero': <HealthcareHero heroSlides={pageData.heroSlides} slug={pageData.slug} themeSettings={pageData.themeSettings}/>,
    'about': <AboutSection />,
    'medical-services': <MedicalServicesSection services={servicesData} storeSlug={slug} />,
    'services': <MedicalServicesSection services={servicesData} storeSlug={slug} />,
    'health-tips': <HealthTipsSection/>,
    'doctors': <DoctorsSection doctors={doctorsData} storeSlug={slug} />,
    'patient': testimonialsData?.data ? <PatientSection name={name} slug={slug} testimonials={testimonialsDataState} /> : null,
    'testimonials': testimonialsData?.data ? <PatientSection name={name} slug={slug} testimonials={testimonialsDataState} /> : null,
    'faqs': faqsData?.data ? <FAQsSection name={name} slug={slug} faqs={faqsDataState} /> : null,
    'contact': (
      <ContactSection
        storeSlug={slug}
        phoneNumber={contactInfoData.phoneNumber}
        email={contactInfoData.email}
        address={contactInfoData.address}
        openingHours={contactInfoData.openingHours}
        mapLink={contactInfoData.mapLink}
      />
    ),
    'cta': <CTASection storeSlug={slug} />,
  };

  const staticFallback = (
    <>
      <div id="section-healthcare-hero" data-editor-section="healthcare-hero" data-editor-component="HealthcareHero">
        <HealthcareHero heroSlides={pageData.heroSlides} slug={pageData.slug} themeSettings={pageData.themeSettings}/>
      </div>
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection />
      </div>
      <div id="section-medical-services" data-editor-section="medical-services" data-editor-component="MedicalServicesSection">
        <MedicalServicesSection services={servicesData} storeSlug={slug} />
      </div>
      <div id="section-health-tips" data-editor-section="health-tips" data-editor-component="HealthTipsSection">
        <HealthTipsSection/>
      </div>
      <div id="section-doctors" data-editor-section="doctors" data-editor-component="DoctorsSection">
        <DoctorsSection doctors={doctorsData} storeSlug={slug} />
      </div>
      {testimonialsData?.data && (
        <div id="section-patient" data-editor-section="patient" data-editor-component="PatientSection">
          <PatientSection name={name} slug={slug} testimonials={testimonialsDataState} />
        </div>
      )}
      {faqsData?.data && (
        <div id="section-faqs" data-editor-section="faqs" data-editor-component="FAQsSection">
          <FAQsSection name={name} slug={slug} faqs={faqsDataState} />
        </div>
      )}
      <div id="section-contact" data-editor-section="contact" data-editor-component="ContactSection">
        <ContactSection
          storeSlug={slug}
          phoneNumber={contactInfoData.phoneNumber}
          email={contactInfoData.email}
          address={contactInfoData.address}
          openingHours={contactInfoData.openingHours}
          mapLink={contactInfoData.mapLink}
        />
      </div>
      <div id="section-cta" data-editor-section="cta" data-editor-component="CTASection">
        <CTASection storeSlug={slug} />
      </div>
    </>
  );

  return (
    <div className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  hc = hc.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(hcPath, hc);
  console.log('Adapted HealthcareLayout/body/HealthCareSite.tsx');
}

// 3. BlogSite.tsx
const blogPath = path.join(__dirname, '../components/site/layouts/BlogLayout/body/BlogSite.tsx');
let blog = fs.readFileSync(blogPath, 'utf8');
if (!blog.includes('ThemeSectionContainer')) {
  blog = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + blog;
  const returnIdx = blog.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection heroSlides={pageData.heroSlides} />,
    'featured-categories': <FeaturedCategoriesSection StoreCategory={pageData.StoreCategory} />,
    'latest-news': blogsData?.data ? <LatestNewsSection blogs={blogsData.data} themeSettings={pageData.themeSettings} /> : null,
    'staff-writers': <StaffWritersSection Writer={pageData.Writer} />,
    'popular-blogs': blogsData?.data ? <PopularBlogsSection blogs={blogsData.data} themeSettings={pageData.themeSettings} /> : null,
    'latest-podcast': <LatestPodcastSection Podcast={pageData.Podcast} />,
    'cta': <CtaSection/>,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection heroSlides={pageData.heroSlides} />
      </div>
      <div id="section-featured-categories" data-editor-section="featured-categories" data-editor-component="FeaturedCategoriesSection">
        <FeaturedCategoriesSection StoreCategory={pageData.StoreCategory} />
      </div>
      {blogsData?.data && (
        <div id="section-latest-news" data-editor-section="latest-news" data-editor-component="LatestNewsSection">
          <LatestNewsSection blogs={blogsData.data} themeSettings={pageData.themeSettings} />
        </div>
      )}
      <div id="section-staff-writers" data-editor-section="staff-writers" data-editor-component="StaffWritersSection">
        <StaffWritersSection Writer={pageData.Writer} />
      </div>
      {blogsData?.data && (
        <div id="section-popular-blogs" data-editor-section="popular-blogs" data-editor-component="PopularBlogsSection">
          <PopularBlogsSection blogs={blogsData.data} themeSettings={pageData.themeSettings} />
        </div>
      )}
      <div id="section-latest-podcast" data-editor-section="latest-podcast" data-editor-component="LatestPodcastSection">
        <LatestPodcastSection Podcast={pageData.Podcast} />
      </div>
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection/>
      </div>
    </>
  );

  return (
    <div className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  blog = blog.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(blogPath, blog);
  console.log('Adapted BlogLayout/body/BlogSite.tsx');
}

// 4. MediaSite.tsx
const mediaPath = path.join(__dirname, '../components/site/layouts/MediaLayout/body/MediaSite.tsx');
let media = fs.readFileSync(mediaPath, 'utf8');
if (!media.includes('ThemeSectionContainer')) {
  media = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + media;
  media = media.replace(
    'const [dataReady, setDataReady] = useState(false);\n  const [displayData, setDisplayData] = useState<typeof mockStoreData | null>(null);',
    'const initialData = (pageData && Object.keys(pageData).length > 0) ? (pageData as unknown as typeof mockStoreData) : mockStoreData;\n  const [dataReady, setDataReady] = useState(true);\n  const [displayData, setDisplayData] = useState<typeof mockStoreData>(initialData);'
  );
  const returnIdx = media.lastIndexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'media-hero': (
      <MediaHeroSection
        slideData={displayData.heroSlides}
        onPlay={(slide: any) =>
          router.push(\`/\${displayData.slug}/video/\${slide.slug}\`)
        }
      />
    ),
    'hero': (
      <MediaHeroSection
        slideData={displayData.heroSlides}
        onPlay={(slide: any) =>
          router.push(\`/\${displayData.slug}/video/\${slide.slug}\`)
        }
      />
    ),
    'enhanced-categories': (
      <EnhancedCategoriesSection
        categories={displayData.StoreCategory}
        slug={displayData.slug}
      />
    ),
    'categories': (
      <EnhancedCategoriesSection
        categories={displayData.StoreCategory}
        slug={displayData.slug}
      />
    ),
    'top-picks': (
      <TopPicksCarousel
        picks={displayData.topPicks}
        onSelect={(item: any) => router.push(item.ctaLink)}
      />
    ),
    'latest-releases': (
      <LatestReleasesSection
        releases={displayData.latestReleases}
        onPlay={(item: any) => router.push(item.videoSlug ? \`/\${displayData.slug}/video/\${item.videoSlug}\` : \`/\${displayData.slug}/media/\${item.slug}\`)}
      />
    ),
    'featured-articles': (
      <FeaturedArticlesSection
        featured={displayData.featuredArticles || displayData.blogs}
        storeSlug={displayData.slug}
      />
    ),
    'latest-videos': (
      <LatestVideosSection
        videos={displayData.latestVideos}
      />
    ),
    'testimonials': (
      <TestimonialsSlider
        testimonials={displayData.testimonials}
      />
    ),
    'newsletter-signup': <NewsletterSignup />,
    'newsletter': <NewsletterSignup />,
    'faqs': (
      <FAQsSection
        faqs={displayData.faqs}
      />
    ),
  };

  const staticFallback = (
    <>
      <div id="section-media-hero" data-editor-section="media-hero" data-editor-component="MediaHeroSection">
        <MediaHeroSection
          slideData={displayData.heroSlides}
          onPlay={(slide: any) =>
            router.push(\`/\${displayData.slug}/video/\${slide.slug}\`)
          }
        />
      </div>
      <div id="section-enhanced-categories" data-editor-section="enhanced-categories" data-editor-component="EnhancedCategoriesSection">
        <EnhancedCategoriesSection
          categories={displayData.StoreCategory}
          slug={displayData.slug}
        />
      </div>
      <div id="section-top-picks" data-editor-section="top-picks" data-editor-component="TopPicksCarousel">
        <TopPicksCarousel
          picks={displayData.topPicks}
          onSelect={(item: any) => router.push(item.ctaLink)}
        />
      </div>
      <div id="section-latest-releases" data-editor-section="latest-releases" data-editor-component="LatestReleasesSection">
        <LatestReleasesSection
          releases={displayData.latestReleases}
          onPlay={(item: any) => router.push(item.videoSlug ? \`/\${displayData.slug}/video/\${item.videoSlug}\` : \`/\${displayData.slug}/media/\${item.slug}\`)}
        />
      </div>
      <div id="section-featured-articles" data-editor-section="featured-articles" data-editor-component="FeaturedArticlesSection">
        <FeaturedArticlesSection
          featured={displayData.featuredArticles || displayData.blogs}
          storeSlug={displayData.slug}
        />
      </div>
      <div id="section-latest-videos" data-editor-section="latest-videos" data-editor-component="LatestVideosSection">
        <LatestVideosSection
          videos={displayData.latestVideos}
        />
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSlider">
        <TestimonialsSlider
          testimonials={displayData.testimonials}
        />
      </div>
      <div id="section-newsletter-signup" data-editor-section="newsletter-signup" data-editor-component="NewsletterSignup">
        <NewsletterSignup />
      </div>
      <div id="section-faqs" data-editor-section="faqs" data-editor-component="FAQsSection">
        <FAQsSection
          faqs={displayData.faqs}
        />
      </div>
    </>
  );

  return (
    <div className="font-sans relative">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            className="fixed bottom-6 right-6 p-3 rounded-full bg-red-600 text-white shadow-lg z-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            aria-label="Scroll to top"
          >
            <ArrowUpCircleIcon className="h-8 w-8" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
`;
  media = media.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(mediaPath, media);
  console.log('Adapted MediaLayout/body/MediaSite.tsx');
}

// 5. NonProfitSite.tsx
const npPath = path.join(__dirname, '../components/site/layouts/NonprofitLayout/body/NonProfitSite.tsx');
let np = fs.readFileSync(npPath, 'utf8');
if (!np.includes('ThemeSectionContainer')) {
  np = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + np;
  const returnIdx = np.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection storeFormData={pageData} />,
    'core-highlights': <CoreHighlightsSection storeFormData={pageData} />,
    'about-us-spotlight': <AboutUsSpotlight storeFormData={pageData} />,
    'programs-causes': <ProgramsCausesSection storeFormData={pageData} />,
    'impact-stats': <ImpactStatsSection storeFormData={pageData} />,
    'events-updates': <EventsUpdatesSection storeFormData={pageData} />,
    'news': <NewsSection storeFormData={pageData} />,
    'testimonials-news': <TestimonialsNewsSection storeFormData={pageData} />,
    'cta-bold': <CtaBoldSection storeFormData={pageData} />,
    'faq': <FAQSection storeFormData={pageData} />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection storeFormData={pageData} />
      </div>
      <div id="section-core-highlights" data-editor-section="core-highlights" data-editor-component="CoreHighlightsSection">
        <CoreHighlightsSection storeFormData={pageData} />
      </div>
      <div id="section-about-us-spotlight" data-editor-section="about-us-spotlight" data-editor-component="AboutUsSpotlight">
        <AboutUsSpotlight storeFormData={pageData} />
      </div>
      <div id="section-programs-causes" data-editor-section="programs-causes" data-editor-component="ProgramsCausesSection">
        <ProgramsCausesSection storeFormData={pageData} />
      </div>
      <div id="section-impact-stats" data-editor-section="impact-stats" data-editor-component="ImpactStatsSection">
        <ImpactStatsSection storeFormData={pageData} />
      </div>
      <div id="section-events-updates" data-editor-section="events-updates" data-editor-component="EventsUpdatesSection">
        <EventsUpdatesSection storeFormData={pageData} />
      </div>
      <div id="section-news" data-editor-section="news" data-editor-component="NewsSection">
        <NewsSection storeFormData={pageData} />
      </div>
      <div id="section-testimonials-news" data-editor-section="testimonials-news" data-editor-component="TestimonialsNewsSection">
        <TestimonialsNewsSection storeFormData={pageData} />
      </div>
      <div id="section-cta-bold" data-editor-section="cta-bold" data-editor-component="CtaBoldSection">
        <CtaBoldSection storeFormData={pageData} />
      </div>
      <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
        <FAQSection storeFormData={pageData} />
      </div>
    </>
  );

  return (
    <main className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </main>
  );
}
`;
  np = np.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(npPath, np);
  console.log('Adapted NonprofitLayout/body/NonProfitSite.tsx');
}

// 6. EventsSite.tsx
const evPath = path.join(__dirname, '../components/site/layouts/EventsLayout/body/EventsSite.tsx');
let ev = fs.readFileSync(evPath, 'utf8');
if (!ev.includes('ThemeSectionContainer')) {
  ev = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + ev;
  const returnIdx = ev.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero-component': <HeroComponent storeFormData={pageData} />,
    'hero': <HeroComponent storeFormData={pageData} />,
    'about': <AboutSection storeFormData={pageData}/>,
    'features': <FeaturesSection promotions={pageData.promotions} description={pageData.description} />,
    'how-it-works': <HowItWorksSection />,
    'live-events': eventsData?.data ? <LiveEventsSection events={eventsData.data} /> : null,
    'events': eventsData?.data ? <LiveEventsSection events={eventsData.data} /> : null,
    'testimonials': testimonialsData?.data ? <TestimonialsSection testimonials={testimonialsData.data} /> : null,
    'pricing': <PricingSection />,
    'faq': faqsData?.data ? <FAQSection /> : null,
    'call-to-action': <CallToActionSection />,
    'cta': <CallToActionSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero-component" data-editor-section="hero-component" data-editor-component="HeroComponent">
        <HeroComponent storeFormData={pageData} />
      </div>
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection storeFormData={pageData}/>
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection promotions={pageData.promotions} description={pageData.description} />
      </div>
      <div id="section-how-it-works" data-editor-section="how-it-works" data-editor-component="HowItWorksSection">
        <HowItWorksSection />
      </div>
      {eventsData?.data && (
        <div id="section-live-events" data-editor-section="live-events" data-editor-component="LiveEventsSection">
          <LiveEventsSection events={eventsData.data} />
        </div>
      )}
      {testimonialsData?.data && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
          <TestimonialsSection testimonials={testimonialsData.data} />
        </div>
      )}
      <div id="section-pricing" data-editor-section="pricing" data-editor-component="PricingSection">
        <PricingSection />
      </div>
      {faqsData?.data && (
        <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
          <FAQSection />
        </div>
      )}
      <div id="section-call-to-action" data-editor-section="call-to-action" data-editor-component="CallToActionSection">
        <CallToActionSection />
      </div>
    </>
  );

  return (
    <div className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  ev = ev.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(evPath, ev);
  console.log('Adapted EventsLayout/body/EventsSite.tsx');
}

// 7. DirectorySite.tsx
const dirPath = path.join(__dirname, '../components/site/layouts/DirectoryLayout/body/DirectorySite.tsx');
let dir = fs.readFileSync(dirPath, 'utf8');
if (!dir.includes('ThemeSectionContainer')) {
  dir = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + dir;
  const returnIdx = dir.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <HeroSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
      />
    ),
    'promotion': <PromotionSection promotions={pageData.promotions} />,
    'new-arrivals': <NewArrivalsSection id={companyId} marketplaceListings={pageData.marketplaceListings} currency={pageData.currency} />,
    'category': <CategorySection StoreCategory={pageData.StoreCategory}/>,
    'popular-products': <PopularProductsSection id={pageData.id} currency={pageData.currency} />,
    'featured-listings-overview': <FeaturedListingsOverviewSection marketplaceListings={pageData.marketplaceListings} />,
    'testimonials': testimonialsData?.data ? <TestimonialsSection testimonial={testimonialsData?.data} /> : null,
    'cta': <CtaSection />,
    'faq': faqsData?.data ? <FAQSection faqs={faqsData?.data} /> : null,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
        />
      </div>
      <div id="section-promotion" data-editor-section="promotion" data-editor-component="PromotionSection">
        <PromotionSection promotions={pageData.promotions} />
      </div>
      <div id="section-new-arrivals" data-editor-section="new-arrivals" data-editor-component="NewArrivalsSection">
        <NewArrivalsSection id={companyId} marketplaceListings={pageData.marketplaceListings} currency={pageData.currency} />
      </div>
      <div id="section-category" data-editor-section="category" data-editor-component="CategorySection">
        <CategorySection StoreCategory={pageData.StoreCategory}/>
      </div>
      <div id="section-popular-products" data-editor-section="popular-products" data-editor-component="PopularProductsSection">
        <PopularProductsSection id={pageData.id} currency={pageData.currency} />
      </div>
      <div id="section-featured-listings-overview" data-editor-section="featured-listings-overview" data-editor-component="FeaturedListingsOverviewSection">
        <FeaturedListingsOverviewSection marketplaceListings={pageData.marketplaceListings} />
      </div>
      {testimonialsData?.data && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
          <TestimonialsSection testimonial={testimonialsData?.data} />
        </div>
      )}
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection />
      </div>
      {faqsData?.data && (
        <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
          <FAQSection faqs={faqsData?.data} />
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
  dir = dir.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(dirPath, dir);
  console.log('Adapted DirectoryLayout/body/DirectorySite.tsx');
}

// 8. FinanceSite.tsx
const finPath = path.join(__dirname, '../components/site/layouts/FinanceLayout/body/FinanceSite.tsx');
let fin = fs.readFileSync(finPath, 'utf8');
if (!fin.includes('ThemeSectionContainer')) {
  fin = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + fin;
  const returnIdx = fin.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} />,
    'practice-areas': <PracticeAreasSection marketplaceListings={pageData.marketplaceListings} themeSettings={pageData.themeSettings}/>,
    'services': <PracticeAreasSection marketplaceListings={pageData.marketplaceListings} themeSettings={pageData.themeSettings}/>,
    'why-choose-us': <WhyChooseUsSection themeSettings={pageData.themeSettings} CoreValues={pageData.CoreValues} />,
    'case-studies-testimonials': testimonialsData?.data ? <CaseStudiesTestimonials testimonials={testimonials} /> : null,
    'testimonials': testimonialsData?.data ? <CaseStudiesTestimonials testimonials={testimonials} /> : null,
    'process-workflow': <ProcessWorkflowSection />,
    'meet-our-experts': <MeetOurExperts experts={experts} />,
    'consultation-packages': <ConsultationPackagesSection packages={packages} />,
    'faq': faqsData?.data ? <FAQSection faqs={faqs} /> : null,
    'contact': <ContactSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} />
      </div>        
      <div id="section-practice-areas" data-editor-section="practice-areas" data-editor-component="PracticeAreasSection">
        <PracticeAreasSection marketplaceListings={pageData.marketplaceListings} themeSettings={pageData.themeSettings}/>
      </div>
      <div id="section-why-choose-us" data-editor-section="why-choose-us" data-editor-component="WhyChooseUsSection">
        <WhyChooseUsSection themeSettings={pageData.themeSettings} CoreValues={pageData.CoreValues} />
      </div>
      {testimonialsData?.data && (
        <div id="section-case-studies-testimonials" data-editor-section="case-studies-testimonials" data-editor-component="CaseStudiesTestimonials">
          <CaseStudiesTestimonials testimonials={testimonials} />
        </div>
      )}
      <div id="section-process-workflow" data-editor-section="process-workflow" data-editor-component="ProcessWorkflowSection">
        <ProcessWorkflowSection />
      </div>
      <div id="section-meet-our-experts" data-editor-section="meet-our-experts" data-editor-component="MeetOurExperts">
        <MeetOurExperts experts={experts} />
      </div>
      <div id="section-consultation-packages" data-editor-section="consultation-packages" data-editor-component="ConsultationPackagesSection">
        <ConsultationPackagesSection packages={packages} />
      </div>
      {faqsData?.data && (
        <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
          <FAQSection faqs={faqs} />
        </div>
      )}
      <div id="section-contact" data-editor-section="contact" data-editor-component="ContactSection">
        <ContactSection />
      </div>
    </>
  );

  return (
    <div className="min-h-screen relative font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  fin = fin.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(finPath, fin);
  console.log('Adapted FinanceLayout/body/FinanceSite.tsx');
}

// 9. TravelSite.tsx
const trPath = path.join(__dirname, '../components/site/layouts/TravelLayout/body/TravelSite.tsx');
let tr = fs.readFileSync(trPath, 'utf8');
if (!tr.includes('ThemeSectionContainer')) {
  tr = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + tr;
  const returnIdx = tr.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <HeroSection
        store={pageData}
        onSearch={handleSearch}
        trendingLocations={
          CompanyLocation
            ? CompanyLocation.map((loc: any) => ({
                name: loc.name,
                slug: loc.slug || loc.name?.toLowerCase().replace(/\\s+/g, "-"),
                metaKeywords: loc.metaKeywords || "",
                status: loc.status || "active",
                parentId: loc.parentId || null,
                ...loc,
              }))
            : []
        }
      />
    ),
    'travel-hero': (
      <HeroSection
        store={pageData}
        onSearch={handleSearch}
        trendingLocations={
          CompanyLocation
            ? CompanyLocation.map((loc: any) => ({
                name: loc.name,
                slug: loc.slug || loc.name?.toLowerCase().replace(/\\s+/g, "-"),
                metaKeywords: loc.metaKeywords || "",
                status: loc.status || "active",
                parentId: loc.parentId || null,
                ...loc,
              }))
            : []
        }
      />
    ),
    'listings': <Listings listings={pageData?.marketplaceListings} slug={pageData?.slug}/>,
    'trending-locations': <TrendingLocations destinations={pageData?.destinations} name={pageData?.name} />,
    'meet-agents': <MeetAgents experts={pageData?.Expert} />,
    'market-insights': (
      <MarketInsights
        virtualTours={[]}
        blogPosts={pageData?.blogs}
        regionCosts={[]}
      />
    ),
    'virtual-tours': <VirtualTours />,
    'testimonials': <Testimonials />,
    'mobile-app-promo': <MobileAppPromo />,
    'newsletter-signup': <NewsletterSignup />,
    'newsletter': <NewsletterSignup />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection
          store={pageData}
          onSearch={handleSearch}
          trendingLocations={
            CompanyLocation
              ? CompanyLocation.map((loc: any) => ({
                  name: loc.name,
                  slug: loc.slug || loc.name?.toLowerCase().replace(/\\s+/g, "-"),
                  metaKeywords: loc.metaKeywords || "",
                  status: loc.status || "active",
                  parentId: loc.parentId || null,
                  ...loc,
                }))
              : []
          }
        />
      </div>
      <div id="section-listings" data-editor-section="listings" data-editor-component="Listings">
        <Listings listings={pageData?.marketplaceListings} slug={pageData?.slug}/>
      </div>
      <div id="section-trending-locations" data-editor-section="trending-locations" data-editor-component="TrendingLocations">
        <TrendingLocations destinations={pageData?.destinations} name={pageData?.name} />
      </div>
      <div id="section-meet-agents" data-editor-section="meet-agents" data-editor-component="MeetAgents">
        <MeetAgents experts={pageData?.Expert} />
      </div>
      <div id="section-market-insights" data-editor-section="market-insights" data-editor-component="MarketInsights">
        <MarketInsights
          virtualTours={[]}
          blogPosts={pageData?.blogs}
          regionCosts={[]}
        />
      </div>
      <div id="section-virtual-tours" data-editor-section="virtual-tours" data-editor-component="VirtualTours">
        <VirtualTours />
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="Testimonials">
        <Testimonials />
      </div>
      <div id="section-mobile-app-promo" data-editor-section="mobile-app-promo" data-editor-component="MobileAppPromo">
        <MobileAppPromo />
      </div>
      <div id="section-newsletter-signup" data-editor-section="newsletter-signup" data-editor-component="NewsletterSignup">
        <NewsletterSignup />
      </div>
    </>
  );

  return (
    <div className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  tr = tr.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(trPath, tr);
  console.log('Adapted TravelLayout/body/TravelSite.tsx');
}

// 10. GhubaSite.tsx
const ghPath = path.join(__dirname, '../components/site/layouts/GhubaLayout/body/GhubaSite.tsx');
let gh = fs.readFileSync(ghPath, 'utf8');
if (!gh.includes('ThemeSectionContainer')) {
  gh = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + gh;
  const returnIdx = gh.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'banner': categories.length > 0 ? <BannerSlider categories={categories} pageData={pageData} /> : null,
    'flash-deals': flashDeals.length > 0 ? <FlashDeals productItems={flashDeals} addToCart={addToCart} /> : null,
    'top-cate': categories.length > 0 ? <TopCate categories={categories} /> : null,
    'new-arrivals': newArrivals.length > 0 ? <NewArrivals productItems={newArrivals} addToCart={addToCart} /> : null,
    'discount': discounts.length > 0 ? <Discount productItems={discounts} addToCart={addToCart} /> : null,
    'shop': (featuredCategory && featuredCategoryProducts.length > 0) ? (
      <Shop
        category={featuredCategory}
        shopItems={featuredCategoryProducts}
        addToCart={addToCart}
      />
    ) : null,
    'annocument': <Annocument pageData={pageData} />,
    'wrapper': <Wrapper pageData={pageData} />,
  };

  const staticFallback = (
    <>
      {categories.length > 0 && (
        <div id="section-banner" data-editor-section="banner" data-editor-component="BannerSlider">
          <BannerSlider categories={categories} pageData={pageData} />
        </div>
      )}
      {flashDeals.length > 0 && (
        <div id="section-flash-deals" data-editor-section="flash-deals" data-editor-component="FlashDeals">
          <FlashDeals productItems={flashDeals} addToCart={addToCart} />
        </div>
      )}
      {categories.length > 0 && (
        <div id="section-top-cate" data-editor-section="top-cate" data-editor-component="TopCate">
          <TopCate categories={categories} />
        </div>
      )}
      {newArrivals.length > 0 && (
        <div id="section-new-arrivals" data-editor-section="new-arrivals" data-editor-component="NewArrivals">
          <NewArrivals productItems={newArrivals} addToCart={addToCart} />
        </div>
      )}
      {discounts.length > 0 && (
        <div id="section-discount" data-editor-section="discount" data-editor-component="Discount">
          <Discount productItems={discounts} addToCart={addToCart} />
        </div>
      )}
      {featuredCategory && featuredCategoryProducts.length > 0 && (
        <div id="section-shop" data-editor-section="shop" data-editor-component="Shop">
          <Shop
            category={featuredCategory}
            shopItems={featuredCategoryProducts}
            addToCart={addToCart}
          />
        </div>
      )}
      <div id="section-annocument" data-editor-section="annocument" data-editor-component="Annocument">
        <Annocument pageData={pageData} />
      </div>
      <div id="section-wrapper" data-editor-section="wrapper" data-editor-component="Wrapper">
        <Wrapper pageData={pageData} />
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-white dark:bg-[#080808] text-zinc-900 dark:text-zinc-100 selection:bg-amber-500 selection:text-white transition-colors duration-500">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </main>
  );
};

export default HomePage;
`;
  gh = gh.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(ghPath, gh);
  console.log('Adapted GhubaLayout/body/GhubaSite.tsx');
}

console.log('🎉 Batch 5 Adaptation Complete!');
