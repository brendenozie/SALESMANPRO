
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <HeroSection
        store={storeData}
        onSearch={handleSearch}
        trendingLocations={
          CompanyLocation
            ? CompanyLocation.map((loc: any) => ({
                name: loc.name,
                slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
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
                slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
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
                  slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
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
                  slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
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
