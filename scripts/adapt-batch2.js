const fs = require('fs');
const path = require('path');

console.log('Writing Batch 2 adaptations...');

// 1. BookingsSite
const bookingsPath = path.join(__dirname, '../components/site/layouts/BookingsLayout/body/BookingsSite.tsx');
let bookingsContent = fs.readFileSync(bookingsPath, 'utf8');
if (!bookingsContent.includes('ThemeSectionContainer')) {
  bookingsContent = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + bookingsContent;
  
  const returnIdx = bookingsContent.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <Hero name={name} description={description} bannerUrl={bannerUrl} marketplaceListings={marketplaceListings} heroSlides={heroSlides} />,
    'features': <FeaturesSection name={name} description={description} themeSettings={themeSettings} CoreValues={CoreValues} />,
    'massage-features': <MassageFeatures marketplaceListings={marketplaceListings} slug={slug} themeSettings={themeSettings} />,
    'pricing-and-stats': <PricingAndStatsSection stats={stats} pricingTiers={pricingTiers} themeSettings={themeSettings} />,
    'benefits': <BenefitsSection name={name} description={description} bannerUrl={bannerUrl} themeSettings={themeSettings} promotions={promotions} />,
    'testimonials': testimonialsData?.data ? <TestimonialsSection /> : null,
    'cta': <CtaSection />,
    'faqs': faqsData?.data ? <FAQsSection /> : null,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="Hero">
        <Hero name={name} description={description} bannerUrl={bannerUrl} marketplaceListings={marketplaceListings} heroSlides={heroSlides} />
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection name={name} description={description} themeSettings={themeSettings} CoreValues={CoreValues} />
      </div>
      <div id="section-massage-features" data-editor-section="massage-features" data-editor-component="MassageFeatures">
        <MassageFeatures marketplaceListings={marketplaceListings} slug={slug} themeSettings={themeSettings} />
      </div>
      <div id="section-pricing-and-stats" data-editor-section="pricing-and-stats" data-editor-component="PricingAndStatsSection">
        <PricingAndStatsSection stats={stats} pricingTiers={pricingTiers} themeSettings={themeSettings} />
      </div>
      <div id="section-benefits" data-editor-section="benefits" data-editor-component="BenefitsSection">
        <BenefitsSection name={name} description={description} bannerUrl={bannerUrl} themeSettings={themeSettings} promotions={promotions} />
      </div>
      {testimonialsData?.data && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
          <TestimonialsSection />
        </div>
      )}
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection />
      </div>
      {faqsData?.data && (
        <div id="section-faqs" data-editor-section="faqs" data-editor-component="FAQsSection">
          <FAQsSection />
        </div>
      )}
    </>
  );

  return (
    <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
  );
}
`;
  bookingsContent = bookingsContent.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(bookingsPath, bookingsContent);
  console.log('Adapted BookingsLayout/body/BookingsSite.tsx');
}

// 2. SalonBookingsLayout BookingsSite
const salonPath = path.join(__dirname, '../components/site/layouts/SalonBookingsLayout/body/BookingsSite.tsx');
let salonContent = fs.readFileSync(salonPath, 'utf8');
if (!salonContent.includes('ThemeSectionContainer')) {
  salonContent = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + salonContent;
  
  const returnIdx = salonContent.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <Hero name={name} description={description} bannerUrl={bannerUrl} marketplaceListings={marketplaceListings} heroSlides={heroSlides} />,
    'features': <FeaturesSection name={name} description={description} themeSettings={themeSettings} CoreValues={CoreValues} />,
    'massage-features': <MassageFeatures marketplaceListings={marketplaceListings} slug={slug} themeSettings={themeSettings} />,
    'pricing-and-stats': <PricingAndStatsSection stats={stats} pricingTiers={pricingTiers} themeSettings={themeSettings} />,
    'benefits': <BenefitsSection name={name} description={description} bannerUrl={bannerUrl} themeSettings={themeSettings} promotions={promotions} />,
    'testimonials': testimonialsData?.data ? <TestimonialsSection /> : null,
    'cta': <CtaSection />,
    'faqs': faqsData?.data ? <FAQsSection /> : null,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="Hero">
        <Hero name={name} description={description} bannerUrl={bannerUrl} marketplaceListings={marketplaceListings} heroSlides={heroSlides} />
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection name={name} description={description} themeSettings={themeSettings} CoreValues={CoreValues} />
      </div>
      <div id="section-massage-features" data-editor-section="massage-features" data-editor-component="MassageFeatures">
        <MassageFeatures marketplaceListings={marketplaceListings} slug={slug} themeSettings={themeSettings} />
      </div>
      <div id="section-pricing-and-stats" data-editor-section="pricing-and-stats" data-editor-component="PricingAndStatsSection">
        <PricingAndStatsSection stats={stats} pricingTiers={pricingTiers} themeSettings={themeSettings} />
      </div>
      <div id="section-benefits" data-editor-section="benefits" data-editor-component="BenefitsSection">
        <BenefitsSection name={name} description={description} bannerUrl={bannerUrl} themeSettings={themeSettings} promotions={promotions} />
      </div>
      {testimonialsData?.data && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
          <TestimonialsSection />
        </div>
      )}
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection />
      </div>
      {faqsData?.data && (
        <div id="section-faqs" data-editor-section="faqs" data-editor-component="FAQsSection">
          <FAQsSection />
        </div>
      )}
    </>
  );

  return (
    <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
  );
}
`;
  salonContent = salonContent.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(salonPath, salonContent);
  console.log('Adapted SalonBookingsLayout/body/BookingsSite.tsx');
}

// 3. DrycleaningBookingsSite
const dryPath = path.join(__dirname, '../components/site/layouts/DrycleaningBookingsLayout/body/DrycleaningBookingsSite.tsx');
let dryContent = fs.readFileSync(dryPath, 'utf8');
if (!dryContent.includes('ThemeSectionContainer')) {
  dryContent = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + dryContent;
  
  const returnIdx = dryContent.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <Hero name={name} description={description} bannerUrl={bannerUrl} marketplaceListings={marketplaceListings} heroSlides={heroSlides} />,
    'features': <FeaturesSection name={name} description={description} themeSettings={themeSettings} CoreValues={CoreValues} />,
    'massage-features': <MassageFeatures marketplaceListings={marketplaceListings} slug={slug} themeSettings={themeSettings} />,
    'pricing-and-stats': <PricingAndStatsSection stats={stats} pricingTiers={pricingTiers} themeSettings={themeSettings} />,
    'style-gallery': <StyleGallerySection />,
    'benefits': <BenefitsSection name={name} description={description} bannerUrl={bannerUrl} themeSettings={themeSettings} promotions={promotions} />,
    'testimonials': <TestimonialsSection />,
    'cta': <CtaSection />,
    'faqs': faqsData?.data ? <FAQsSection faqs={faqsData.data} name={name} themeSettings={themeSettings} /> : null,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="Hero">
        <Hero name={name} description={description} bannerUrl={bannerUrl} marketplaceListings={marketplaceListings} heroSlides={heroSlides} />
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection name={name} description={description} themeSettings={themeSettings} CoreValues={CoreValues} />
      </div>
      <div id="section-massage-features" data-editor-section="massage-features" data-editor-component="MassageFeatures">
        <MassageFeatures marketplaceListings={marketplaceListings} slug={slug} themeSettings={themeSettings} />
      </div>
      <div id="section-pricing-and-stats" data-editor-section="pricing-and-stats" data-editor-component="PricingAndStatsSection">
        <PricingAndStatsSection stats={stats} pricingTiers={pricingTiers} themeSettings={themeSettings} />
      </div>
      <div id="section-style-gallery" data-editor-section="style-gallery" data-editor-component="StyleGallerySection">
        <StyleGallerySection />
      </div>
      <div id="section-benefits" data-editor-section="benefits" data-editor-component="BenefitsSection">
        <BenefitsSection name={name} description={description} bannerUrl={bannerUrl} themeSettings={themeSettings} promotions={promotions} />
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
        <TestimonialsSection />
      </div>
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection />
      </div>
      {faqsData?.data && (
        <div id="section-faqs" data-editor-section="faqs" data-editor-component="FAQsSection">
          <FAQsSection faqs={faqsData.data} name={name} themeSettings={themeSettings} />
        </div>
      )}
    </>
  );

  return (
    <div className="bg-white dark:bg-[#080a0c] selection:bg-teal-100 selection:text-teal-900 transition-colors duration-500">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  dryContent = dryContent.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(dryPath, dryContent);
  console.log('Adapted DrycleaningBookingsLayout/body/DrycleaningBookingsSite.tsx');
}

// 4. BarbershopBookingsSite
const barberPath = path.join(__dirname, '../components/site/layouts/BarbershopBookingsLayout/body/BarbershopBookingsSite.tsx');
let barberContent = fs.readFileSync(barberPath, 'utf8');
if (!barberContent.includes('ThemeSectionContainer')) {
  barberContent = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + barberContent;
  
  const returnIdx = barberContent.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <Hero 
        name={name} 
        description={description} 
        bannerUrl={bannerUrl} 
        marketplaceListings={marketplaceListings} 
        heroSlides={heroSlides} 
      />
    ),
    'features': (
      <FeaturesSection 
        name={name} 
        description={description} 
        themeSettings={themeSettings} 
        CoreValues={CoreValues} 
      />
    ),
    'massage-features': (
      <MassageFeatures 
        marketplaceListings={marketplaceListings} 
        slug={slug} 
        themeSettings={themeSettings} 
      />
    ),
    'pricing-and-stats': (
      <PricingAndStatsSection 
        stats={stats} 
        pricingTiers={pricingTiers} 
        themeSettings={themeSettings} 
      />
    ),
    'style-gallery': <StyleGallerySection themeSettings={themeSettings} />,
    'benefits': (
      <BenefitsSection 
        name={name} 
        description={description} 
        bannerUrl={bannerUrl} 
        themeSettings={themeSettings} 
        promotions={promotions} 
      />
    ),
    'testimonials': <TestimonialsSection />,
    'cta': <CtaSection />,
    'faqs': faqsData?.data ? (
      <FAQsSection 
        faqs={faqsData.data} 
        name={name} 
        themeSettings={themeSettings} 
      />
    ) : null,
  };

  const staticFallback = (
    <main className="relative">
      <div id="section-hero" data-editor-section="hero" data-editor-component="Hero">
        <Hero 
          name={name} 
          description={description} 
          bannerUrl={bannerUrl} 
          marketplaceListings={marketplaceListings} 
          heroSlides={heroSlides} 
        />
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection 
          name={name} 
          description={description} 
          themeSettings={themeSettings} 
          CoreValues={CoreValues} 
        />
      </div>
      <div id="section-massage-features" data-editor-section="massage-features" data-editor-component="MassageFeatures">
        <MassageFeatures 
          marketplaceListings={marketplaceListings} 
          slug={slug} 
          themeSettings={themeSettings} 
        />
      </div>
      <div id="section-pricing-and-stats" data-editor-section="pricing-and-stats" data-editor-component="PricingAndStatsSection">
        <PricingAndStatsSection 
          stats={stats} 
          pricingTiers={pricingTiers} 
          themeSettings={themeSettings} 
        />
      </div>
      <div id="section-style-gallery" data-editor-section="style-gallery" data-editor-component="StyleGallerySection">
        <StyleGallerySection themeSettings={themeSettings} />
      </div>
      <div id="section-benefits" data-editor-section="benefits" data-editor-component="BenefitsSection">
        <BenefitsSection 
          name={name} 
          description={description} 
          bannerUrl={bannerUrl} 
          themeSettings={themeSettings} 
          promotions={promotions} 
        />
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
        <TestimonialsSection />
      </div>
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection />
      </div>
      {faqsData?.data && (
        <div id="section-faqs" data-editor-section="faqs" data-editor-component="FAQsSection">
          <FAQsSection 
            faqs={faqsData.data} 
            name={name} 
            themeSettings={themeSettings} 
          />
        </div>
      )}
    </main>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors duration-500 ease-in-out">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.03] z-[99] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
`;
  barberContent = barberContent.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(barberPath, barberContent);
  console.log('Adapted BarbershopBookingsLayout/body/BarbershopBookingsSite.tsx');
}

// 5. ServiceSite
const servicePath = path.join(__dirname, '../components/site/layouts/ServicesLayout/body/ServiceSite.tsx');
let serviceContent = fs.readFileSync(servicePath, 'utf8');
if (!serviceContent.includes('ThemeSectionContainer')) {
  serviceContent = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + serviceContent;
  
  const returnIdx = serviceContent.indexOf('return (\n    <>');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection storeFormData={siteData} heroSlides={siteData.heroSlides} />,
    'about': <AboutSection />,
    'excellence': <ExcellenceSection slug={siteData.slug} themeSettings={siteData.themeSettings} promotions={siteData.promotions} />,
    'services': <ServicesSection slug={siteData.slug} themeSettings={siteData.themeSettings} marketplaceListings={siteData.marketplaceListings} />,
    'pricing': <PricingSection pricingTiers={siteData.pricingTiers} themeSettings={siteData.themeSettings} />,
    'testimonial': testimonialsData?.data ? <TestimonialSection /> : null,
    'faq': faqsData?.data ? <FAQSection /> : null,
    'cleaning-tips': <CleaningTipsSection />,
    'booking-form': <BookingFormSection />,
    'get-started': <GetStartedSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection storeFormData={siteData} heroSlides={siteData.heroSlides}/>
      </div>
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection />
      </div>
      <div id="section-excellence" data-editor-section="excellence" data-editor-component="ExcellenceSection">
        <ExcellenceSection slug={siteData.slug} themeSettings={siteData.themeSettings} promotions={siteData.promotions} />
      </div>
      <div id="section-services" data-editor-section="services" data-editor-component="ServicesSection">
        <ServicesSection slug={siteData.slug} themeSettings={siteData.themeSettings} marketplaceListings={siteData.marketplaceListings} />
      </div>
      <div id="section-pricing" data-editor-section="pricing" data-editor-component="PricingSection">
        <PricingSection pricingTiers={siteData.pricingTiers} themeSettings={siteData.themeSettings} />
      </div>
      {testimonialsData?.data && (
        <div id="section-testimonial" data-editor-section="testimonial" data-editor-component="TestimonialSection">
          <TestimonialSection />
        </div>
      )}
      {faqsData?.data && (
        <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
          <FAQSection />
        </div>
      )}
      <div id="section-cleaning-tips" data-editor-section="cleaning-tips" data-editor-component="CleaningTipsSection">
        <CleaningTipsSection />
      </div>
      <div id="section-booking-form" data-editor-section="booking-form" data-editor-component="BookingFormSection">
        <BookingFormSection />
      </div>
      <div id="section-get-started" data-editor-section="get-started" data-editor-component="GetStartedSection">
        <GetStartedSection />
      </div>
    </>
  );

  return (
    <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
  );
}
`;
  serviceContent = serviceContent.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(servicePath, serviceContent);
  console.log('Adapted ServicesLayout/body/ServiceSite.tsx');
}

// 6. ConsultancySite
const consultPath = path.join(__dirname, '../components/site/layouts/ConsultancyLayout/body/ConsultancySite.tsx');
let consultContent = fs.readFileSync(consultPath, 'utf8');
if (!consultContent.includes('ThemeSectionContainer')) {
  consultContent = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + consultContent;
  
  const returnIdx = consultContent.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection heroSlides={siteData?.heroSlides} themeSettings={siteData?.themeSettings} />,
    'social-proof': <SocialProofSection />,
    'about': <AboutSection />,
    'services': <ServicesSection />,
    'featured-listings': <FeaturedListings listings={Ebookslistings} slug={siteData?.slug || ''} />,
    'how-it-works': <HowItWorks />,
    'browse-by-category': <BrowseByCategory listings={Programslisting} storeSlug={siteData?.slug || ''} />,
    'video-showcase': blogsData?.data ? (
      <VideoShowcaseSection blogs={(blogsData.data || []).map((b: any) => ({ ...b, excerpt: b.excerpt ?? "", coverImage: b.coverImage ?? "", videoAlbumId: b.videoAlbumId ?? undefined }))} />
    ) : null,
    'testimonials': testimonialsData?.data ? (
      <TestimonialsCarouselSection testimonials={testimonialsData.data || []} />
    ) : null,
    'call-to-action': <CallToActionSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection heroSlides={siteData?.heroSlides} themeSettings={siteData?.themeSettings} />
      </div>
      <div id="section-social-proof" data-editor-section="social-proof" data-editor-component="SocialProofSection">
        <SocialProofSection />
      </div>
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection />
      </div>
      <div id="section-services" data-editor-section="services" data-editor-component="ServicesSection">
        <ServicesSection />
      </div>  
      <div id="section-featured-listings" data-editor-section="featured-listings" data-editor-component="FeaturedListings">
        <FeaturedListings listings={Ebookslistings} slug={siteData?.slug || ''} />
      </div>
      <div id="section-how-it-works" data-editor-section="how-it-works" data-editor-component="HowItWorks">
        <HowItWorks />
      </div>
      <div id="section-browse-by-category" data-editor-section="browse-by-category" data-editor-component="BrowseByCategory">
        <BrowseByCategory listings={Programslisting} storeSlug={siteData?.slug || ''} />
      </div>   
      {blogsData?.data && (
        <div id="section-video-showcase" data-editor-section="video-showcase" data-editor-component="VideoShowcaseSection">
          <VideoShowcaseSection blogs={(blogsData.data || []).map((b: any) => ({ ...b, excerpt: b.excerpt ?? "", coverImage: b.coverImage ?? "", videoAlbumId: b.videoAlbumId ?? undefined }))} />
        </div>
      )}
      {testimonialsData?.data && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsCarouselSection">
          <TestimonialsCarouselSection testimonials={testimonialsData.data || []} />
        </div>
      )}
      <div id="section-call-to-action" data-editor-section="call-to-action" data-editor-component="CallToActionSection">
        <CallToActionSection />
      </div>
    </>
  );

  return (
    <div className="font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="bg-gradient-to-br from-gray-50 to-orange-50 font-sans antialiased">
        <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
      </div>
    </div>
  );
}
`;
  consultContent = consultContent.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(consultPath, consultContent);
  console.log('Adapted ConsultancyLayout/body/ConsultancySite.tsx');
}

// 7. PublicSpeakingSite
const publicPath = path.join(__dirname, '../components/site/layouts/PublicSpeakingLayout/body/PublicSpeakingSite.tsx');
let publicContent = fs.readFileSync(publicPath, 'utf8');
if (!publicContent.includes('ThemeSectionContainer')) {
  publicContent = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + publicContent;
  
  const returnIdx = publicContent.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection heroSlides={siteData?.heroSlides} themeSettings={siteData?.themeSettings} />,
    'social-proof': <SocialProofSection />,
    'services': <ServicesSection />,
    'featured-listings': <FeaturedListings listings={Ebookslistings} slug={siteData?.slug || ''} />,
    'how-it-works': <HowItWorks />,
    'browse-by-category': <BrowseByCategory listings={Programslisting} storeSlug={siteData?.slug || ''} />,
    'about': <AboutSection />,
    'featured-programs': <FeaturedProgramsSection listings={Programslisting} slug="" />,
    'video-showcase': <VideoShowcaseSection blogs={(pageData?.blogs || []).map((b: any) => ({ ...b, excerpt: b.excerpt ?? "", coverImage: b.coverImage ?? "", videoAlbumId: b.videoAlbumId ?? undefined }))} />,
    'testimonials': <TestimonialsCarouselSection testimonials={pageData?.testimonials || []} />,
    'call-to-action': <CallToActionSection companyId={siteData?.id || ''} />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection heroSlides={siteData?.heroSlides} themeSettings={siteData?.themeSettings} />
      </div>
      <div id="section-social-proof" data-editor-section="social-proof" data-editor-component="SocialProofSection">
        <SocialProofSection />
      </div>
      <div id="section-services" data-editor-section="services" data-editor-component="ServicesSection">
        <ServicesSection />
      </div>   
      <div id="section-featured-listings" data-editor-section="featured-listings" data-editor-component="FeaturedListings">
        <FeaturedListings listings={Ebookslistings} slug={siteData?.slug || ''} />
      </div>
      <div id="section-how-it-works" data-editor-section="how-it-works" data-editor-component="HowItWorks">
        <HowItWorks />
      </div> 
      <div id="section-browse-by-category" data-editor-section="browse-by-category" data-editor-component="BrowseByCategory">
        <BrowseByCategory listings={Programslisting} storeSlug={siteData?.slug || ''} />
      </div> 
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection />
      </div>  
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsCarouselSection">
        <TestimonialsCarouselSection testimonials={pageData?.testimonials || []} />
      </div>
      <div id="section-call-to-action" data-editor-section="call-to-action" data-editor-component="CallToActionSection">
        <CallToActionSection companyId={siteData?.id || ''} />
      </div>
    </>
  );

  return (
    <div className="font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  publicContent = publicContent.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(publicPath, publicContent);
  console.log('Adapted PublicSpeakingLayout/body/PublicSpeakingSite.tsx');
}
