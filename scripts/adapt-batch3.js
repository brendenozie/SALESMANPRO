const fs = require('fs');
const path = require('path');

console.log('Adapting Batch 3 (Courses, Security & Real Estate)...');

// 1. CoursesSite.tsx (Layout 1)
const c1Path = path.join(__dirname, '../components/site/layouts/CoursesLayout/body/CoursesSite.tsx');
let c1 = fs.readFileSync(c1Path, 'utf8');
if (!c1.includes('ThemeSectionContainer')) {
  c1 = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + c1;
  const returnIdx = c1.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection storeFormData={pageData} />,
    'glass-info-cards': <GlassInfoCardsSection storeFormData={pageData} />,
    'school': <SchoolSection storeFormData={pageData} />,
    'main-courses': <MainCoursesSection storeFormData={pageData} />,
    'about': <AboutSection storeFormData={pageData} />,
    'testimonials': testimonialsData?.data ? <TestimonialsSection storeFormData={pageData} /> : null,
    'popular-blogs': blogsData?.data ? <PopularBlogsSection storeFormData={pageData} /> : null,
    'cta': <CtaSection storeFormData={pageData} />,
    'faq': faqsData?.data ? <FAQSection storeFormData={pageData} /> : null,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection storeFormData={pageData} />
      </div>
      <div id="section-glass-info-cards" data-editor-section="glass-info-cards" data-editor-component="GlassInfoCardsSection">
        <GlassInfoCardsSection storeFormData={pageData} />
      </div>
      <div id="section-school" data-editor-section="school" data-editor-component="SchoolSection">
        <SchoolSection storeFormData={pageData} />
      </div>
      <div id="section-main-courses" data-editor-section="main-courses" data-editor-component="MainCoursesSection">
        <MainCoursesSection storeFormData={pageData} />
      </div>
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection storeFormData={pageData} />
      </div>
      {testimonialsData?.data && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
          <TestimonialsSection storeFormData={pageData} />
        </div>
      )}
      {blogsData?.data && (
        <div id="section-popular-blogs" data-editor-section="popular-blogs" data-editor-component="PopularBlogsSection">
          <PopularBlogsSection storeFormData={pageData} />
        </div>
      )}
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection storeFormData={pageData} />
      </div>
      {faqsData?.data && (
        <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
          <FAQSection storeFormData={pageData} />
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
  c1 = c1.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(c1Path, c1);
  console.log('Adapted CoursesLayout/body/CoursesSite.tsx');
}

// 2. CoursesSite2.tsx (Layout 2)
const c2Path = path.join(__dirname, '../components/site/layouts/CoursesLayout2/body/CoursesSite2.tsx');
let c2 = fs.readFileSync(c2Path, 'utf8');
if (!c2.includes('ThemeSectionContainer')) {
  c2 = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + c2;
  const returnIdx = c2.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection storeFormData={pageData} />,
    'glass-info-cards': <ProfessionalInfoGrid storeFormData={pageData} />,
    'professional-info-grid': <ProfessionalInfoGrid storeFormData={pageData} />,
    'school': <SchoolSection storeFormData={pageData} />,
    'main-courses': <MainCoursesSection storeFormData={pageData} />,
    'about': <AboutSection storeFormData={pageData} />,
    'testimonials': testimonialsData?.data ? <TestimonialsSection storeFormData={pageData} /> : null,
    'popular-blogs': blogsData?.data ? <PopularBlogsSection storeFormData={pageData} /> : null,
    'cta': <CtaSection storeFormData={pageData} />,
    'faq': faqsData?.data ? <FAQSection storeFormData={pageData} /> : null,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection storeFormData={pageData} />
      </div>
      <div id="section-professional-info-grid" data-editor-section="glass-info-cards" data-editor-component="ProfessionalInfoGrid">
        <ProfessionalInfoGrid storeFormData={pageData} />
      </div>
      <div id="section-school" data-editor-section="school" data-editor-component="SchoolSection">
        <SchoolSection storeFormData={pageData} />
      </div>
      <div id="section-main-courses" data-editor-section="main-courses" data-editor-component="MainCoursesSection">
        <MainCoursesSection storeFormData={pageData} />
      </div>
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection storeFormData={pageData} />
      </div>
      {testimonialsData?.data && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
          <TestimonialsSection storeFormData={pageData} />
        </div>
      )}
      {blogsData?.data && (
        <div id="section-popular-blogs" data-editor-section="popular-blogs" data-editor-component="PopularBlogsSection">
          <PopularBlogsSection storeFormData={pageData} />
        </div>
      )}
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection storeFormData={pageData} />
      </div>
      {faqsData?.data && (
        <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
          <FAQSection storeFormData={pageData} />
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
  c2 = c2.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(c2Path, c2);
  console.log('Adapted CoursesLayout2/body/CoursesSite2.tsx');
}

// 3. CoursesSite3.tsx (Layout 3)
const c3Path = path.join(__dirname, '../components/site/layouts/CoursesLayout3/body/CoursesSite3.tsx');
let c3 = fs.readFileSync(c3Path, 'utf8');
if (!c3.includes('ThemeSectionContainer')) {
  c3 = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + c3;
  const returnIdx = c3.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection storeFormData={pageData} />,
    'school': <SchoolSection storeFormData={pageData} />,
    'main-courses': <MainCoursesSection storeFormData={pageData} />,
    'about': <AboutSection storeFormData={pageData} />,
    'testimonials': testimonialsData?.data ? <TestimonialsSection storeFormData={pageData} /> : null,
    'popular-blogs': blogsData?.data ? <PopularBlogsSection storeFormData={pageData} /> : null,
    'cta': <CtaSection />,
    'faq': faqsData?.data ? <FAQSection storeFormData={pageData} /> : null,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection storeFormData={pageData} />
      </div>
      <div id="section-school" data-editor-section="school" data-editor-component="SchoolSection">
        <SchoolSection storeFormData={pageData} />
      </div>
      <div id="section-main-courses" data-editor-section="main-courses" data-editor-component="MainCoursesSection">
        <MainCoursesSection storeFormData={pageData} />
      </div>
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection storeFormData={pageData} />
      </div>
      {testimonialsData?.data && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
          <TestimonialsSection storeFormData={pageData} />
        </div>
      )}
      {blogsData?.data && (
        <div id="section-popular-blogs" data-editor-section="popular-blogs" data-editor-component="PopularBlogsSection">
          <PopularBlogsSection storeFormData={pageData} />
        </div>
      )}
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection />
      </div>
      {faqsData?.data && (
        <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
          <FAQSection storeFormData={pageData} />
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
  c3 = c3.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(c3Path, c3);
  console.log('Adapted CoursesLayout3/body/CoursesSite3.tsx');
}

// 4. SecuritySite.tsx (Layout 1)
const s1Path = path.join(__dirname, '../components/site/layouts/SecurityLayout/body/SecuritySite.tsx');
let s1 = fs.readFileSync(s1Path, 'utf8');
if (!s1.includes('ThemeSectionContainer')) {
  s1 = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + s1;
  const returnIdx = s1.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection name={name} themeSettings={themeSettings} tagline={tagline} heroSlides={heroSlides} testimonials={testimonials} awards={awards} />,
    'services': <ServicesSection name={name} slug={slug} description={description} themeSettings={themeSettings} StoreCategory={StoreCategory} />,
    'marketplace-listings': <MarketplaceListingsSection name={name} slug={slug} themeSettings={themeSettings} marketplaceListings={marketplaceListings} />,
    'getting-started': <GettingStartedSection />,
    'features': <FeaturesSection themeSettings={themeSettings} name={name} promotions={promotions} tagline={tagline} />,
    'about': <AboutSection name={name} slug={slug} bannerUrl={bannerUrl} contactEmail={contactEmail} stats={stats} themeSettings={themeSettings} description={description} tagline={tagline} heroSlides={heroSlides} />,
    'case-studies': <CaseStudiesSection themeSettings={themeSettings} CoreValues={CoreValues} />,
    'discovery-call': <DiscoveryCallSection />,
    'testimonials': <TestimonialsSection themeSettings={themeSettings} testimonials={testimonials} name={name} />,
    'faq': <FAQSection faqs={faqs} themeSettings={themeSettings} />,
    'cta': <CtaSection imageUrl={bannerUrl} />,
    'contact': <ContactSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection name={name} themeSettings={themeSettings} tagline={tagline} heroSlides={heroSlides} testimonials={testimonials} awards={awards} />
      </div>
      <div id="section-services" data-editor-section="services" data-editor-component="ServicesSection">
        <ServicesSection name={name} slug={slug} description={description} themeSettings={themeSettings} StoreCategory={StoreCategory} />
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
        <CtaSection imageUrl={bannerUrl}/>
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
  s1 = s1.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(s1Path, s1);
  console.log('Adapted SecurityLayout/body/SecuritySite.tsx');
}

// 5. Security2Site.tsx (Layout 2)
const s2Path = path.join(__dirname, '../components/site/layouts/Security2Layout/body/Security2Site.tsx');
let s2 = fs.readFileSync(s2Path, 'utf8');
if (!s2.includes('ThemeSectionContainer')) {
  s2 = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + s2;
  const returnIdx = s2.indexOf('return (');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection name={name} themeSettings={themeSettings} tagline={tagline} heroSlides={heroSlides} testimonials={testimonials} awards={awards} />,
    'services': <ServicesSection name={name} slug={slug} description={description} themeSettings={themeSettings} StoreCategory={StoreCategory} />,
    'case-studies': <CaseStudiesSection themeSettings={themeSettings} CoreValues={CoreValues} />,
    'marketplace-listings': <MarketplaceListingsSection name={name} slug={slug} themeSettings={themeSettings} marketplaceListings={marketplaceListings} />,
    'getting-started': <GettingStartedSection />,
    'features': <FeaturesSection themeSettings={themeSettings} name={name} promotions={promotions} tagline={tagline}/>,
    'about': <AboutSection name={name} slug={slug} bannerUrl={bannerUrl} contactEmail={contactEmail} stats={stats} themeSettings={themeSettings} description={description} tagline={tagline} heroSlides={heroSlides}/>,
    'discovery-call': <DiscoveryCallSection/>,
    'testimonials': <TestimonialsSection themeSettings={themeSettings} testimonials={testimonials} name={name} />,
    'faq': <FAQSection faqs={faqs} themeSettings={themeSettings}/>,
    'cta': <CtaSection imageUrl={bannerUrl}/>,
    'contact': <ContactSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection name={name} themeSettings={themeSettings} tagline={tagline} heroSlides={heroSlides} testimonials={testimonials} awards={awards} />
      </div>
      <div id="section-services" data-editor-section="services" data-editor-component="ServicesSection">
        <ServicesSection name={name} slug={slug} description={description} themeSettings={themeSettings} StoreCategory={StoreCategory} />
      </div>
      <div id="section-case-studies" data-editor-section="case-studies" data-editor-component="CaseStudiesSection">
        <CaseStudiesSection themeSettings={themeSettings} CoreValues={CoreValues} />
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
        <CtaSection imageUrl={bannerUrl}/>
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
  s2 = s2.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(s2Path, s2);
  console.log('Adapted Security2Layout/body/Security2Site.tsx');
}

// 6. RealEstateSite.tsx
const rePath = path.join(__dirname, '../components/site/layouts/RealEstateLayout/body/RealEstateSite.tsx');
let re = fs.readFileSync(rePath, 'utf8');
if (!re.includes('ThemeSectionContainer')) {
  re = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + re;
  const returnIdx = re.indexOf('return (\n    <div className="font-sans text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 min-h-screen">');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <HeroSection
        store={storeData}
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
    'categories': <CategoriesSection store={storeData} />,
    'featured-listings': <FeaturedListingsWrapper companyId={id} />,
    'trending-locations': (
      <TrendingLocations
        locations={
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
        slug={slug}
      />
    ),
    'listings': <ListingsSection products={marketplaceListings} slug={slug} />,
    'why-choose-us': <WhyChooseUs CoreValues={CoreValues} metrics={metrics} awards={awards} />,
    'agents': <AgentsSection agents={salesAgents} slug={slug} />,
    'testimonials': <TestimonialsSection testimonials={testimonials} />,
    'faq': <FAQSection faqs={faqs} />,
    'blog': <BlogSection posts={blogs} slug={slug} />,
    'newsletter': (
      <AnimatePresence>
        {showNewsletter && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <NewsletterSection handleNewsletter={handleNewsletter} />
          </motion.div>
        )}
      </AnimatePresence>
    ),
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection
          store={storeData}
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
      <div id="section-categories" data-editor-section="categories" data-editor-component="CategoriesSection">
        <CategoriesSection store={storeData} />
      </div>
      <div id="section-featured-listings" data-editor-section="featured-listings" data-editor-component="FeaturedListingsWrapper">
        <FeaturedListingsWrapper companyId={id} />
      </div>
      <div id="section-trending-locations" data-editor-section="trending-locations" data-editor-component="TrendingLocations">
        <TrendingLocations
          locations={
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
          slug={slug}
        />
      </div>
      <div id="section-listings" data-editor-section="listings" data-editor-component="ListingsSection">
        <ListingsSection products={marketplaceListings} slug={slug} />
      </div>
      <div id="section-why-choose-us" data-editor-section="why-choose-us" data-editor-component="WhyChooseUs">
        <WhyChooseUs CoreValues={CoreValues} metrics={metrics} awards={awards} />
      </div>
      <div id="section-agents" data-editor-section="agents" data-editor-component="AgentsSection">
        <AgentsSection agents={salesAgents} slug={slug} />
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
        <TestimonialsSection testimonials={testimonials} />
      </div>
      <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
        <FAQSection faqs={faqs} />
      </div>
      <div id="section-blog" data-editor-section="blog" data-editor-component="BlogSection">
        <BlogSection posts={blogs} slug={slug} />
      </div>
      <AnimatePresence>
        {showNewsletter && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <div id="section-newsletter" data-editor-section="newsletter" data-editor-component="NewsletterSection">
              <NewsletterSection handleNewsletter={handleNewsletter} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <div className="font-sans text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  re = re.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(rePath, re);
  console.log('Adapted RealEstateLayout/body/RealEstateSite.tsx');
}

// 7. PropertyManagementSite.tsx
const pmPath = path.join(__dirname, '../components/site/layouts/PropertyManagementLayout/body/PropertyManagementSite.tsx');
let pm = fs.readFileSync(pmPath, 'utf8');
if (!pm.includes('ThemeSectionContainer')) {
  pm = `import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';\n` + pm;
  const returnIdx = pm.indexOf('return (\n    <div className="font-sans text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 min-h-screen">');
  const returnBlock = `
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <HeroSection
        store={storeData}
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
    'categories': <CategoriesSection store={storeData} />,
    'featured-listings': <FeaturedListingsWrapper companyId={id} />,
    'trending-locations': (
      <TrendingLocations
        locations={
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
        slug={slug}
      />
    ),
    'listings': <ListingsSection products={marketplaceListings} slug={slug} />,
    'why-choose-us': <WhyChooseUs CoreValues={CoreValues} metrics={metrics} awards={awards} />,
    'agents': <AgentsSection agents={salesAgents} slug={slug} />,
    'testimonials': <TestimonialsSection testimonials={testimonials} />,
    'faq': <FAQSection faqs={faqs} />,
    'blog': <BlogSection posts={blogs} slug={slug} />,
    'newsletter': (
      <AnimatePresence>
        {showNewsletter && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <NewsletterSection handleNewsletter={handleNewsletter} />
          </motion.div>
        )}
      </AnimatePresence>
    ),
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection
          store={storeData}
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
      <div id="section-categories" data-editor-section="categories" data-editor-component="CategoriesSection">
        <CategoriesSection store={storeData} />
      </div>
      <div id="section-featured-listings" data-editor-section="featured-listings" data-editor-component="FeaturedListingsWrapper">
        <FeaturedListingsWrapper companyId={id} />
      </div>
      <div id="section-trending-locations" data-editor-section="trending-locations" data-editor-component="TrendingLocations">
        <TrendingLocations
          locations={
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
          slug={slug}
        />
      </div>
      <div id="section-listings" data-editor-section="listings" data-editor-component="ListingsSection">
        <ListingsSection products={marketplaceListings} slug={slug} />
      </div>
      <div id="section-why-choose-us" data-editor-section="why-choose-us" data-editor-component="WhyChooseUs">
        <WhyChooseUs CoreValues={CoreValues} metrics={metrics} awards={awards} />
      </div>
      <div id="section-agents" data-editor-section="agents" data-editor-component="AgentsSection">
        <AgentsSection agents={salesAgents} slug={slug} />
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
        <TestimonialsSection testimonials={testimonials} />
      </div>
      <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
        <FAQSection faqs={faqs} />
      </div>
      <div id="section-blog" data-editor-section="blog" data-editor-component="BlogSection">
        <BlogSection posts={blogs} slug={slug} />
      </div>
      <AnimatePresence>
        {showNewsletter && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <div id="section-newsletter" data-editor-section="newsletter" data-editor-component="NewsletterSection">
              <NewsletterSection handleNewsletter={handleNewsletter} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <div className="font-sans text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
`;
  pm = pm.substring(0, returnIdx) + returnBlock;
  fs.writeFileSync(pmPath, pm);
  console.log('Adapted PropertyManagementLayout/body/PropertyManagementSite.tsx');
}
