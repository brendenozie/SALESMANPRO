'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';
// File: components/site/layouts/DirectoryLayout/DirectorySite.tsx

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';
import { useStoreContext } from '@/contexts/StoreContext';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import HeroSection from './components/HeroSection';
import PopularProductsSection from './components/PopularSection';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";


import PromotionSection from './components/PromotionSection';
import NewArrivalsSection from './components/NewArrivalsSection';
import CategorySection from './components/CategorySection';
import FeaturedListingsOverviewSection from './components/FeaturedListingsOverviewSection';
import TestimonialsSection from './components/TestimonialsSection';
import CtaSection from './components/CtaSection';
import FAQSection from './components/FAQSection';

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DirectorySite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const { storeFormData } = useStoreContext(); // Use for global theme settings only
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch client-side data
  const testimonialsData = { data: pageData.testimonials || [] };
  const blogsData = { data: pageData.blogs || [] }; 
  const faqsData = { data: pageData.faqs || [] };

  const handleSearch = () => {
    // router.push(`/${pageData.slug}/search?q=${encodeURIComponent(searchTerm)}`);
  };

  
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
