
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
