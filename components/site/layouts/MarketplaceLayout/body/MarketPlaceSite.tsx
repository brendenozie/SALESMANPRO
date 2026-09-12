
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
