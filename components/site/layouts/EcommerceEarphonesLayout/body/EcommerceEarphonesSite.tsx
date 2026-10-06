'use client';

import React, { useMemo } from 'react';
import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';
import HeroSlider from './components/HeroSlider';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported for LCP
import CategorySection from './components/CategorySection';
import ContactSection from './components/ContactSection/ContactSection';


// 🧠 Dynamic imports for heavy or client-only sections
import DynamicPopularProducts from './components/PopularProducts';
import DynamicDailyBestSells from './components/DailyBestSells';
import DynamicTrending from './components/Trending';
import PromoSection from './components/PromoSection';
import SecondPromoSection from './components/SecondPromoSection';
import AllProducts from './components/AllProducts';
import MetricsSection from './components/MetricsSection';
import AwardsSection from './components/AwardsSection';
import TestimonialsSection from './components/TestimonialsSection/TestimonialsSection';
import NewsletterSection from './components/NewsletterSection/NewsletterSection';

type EcommerceSiteProps = {
  pageData: StoreForm;
  companyId: string;
};


export default function EcommerceSite({ pageData, companyId }: EcommerceSiteProps) {
  const {
    heroSlides,
    id,
    themeSettings = {},
    marketplaceListings = [],
    awards = [],
    promotions = [],
    CoreValues = [],
  } = pageData;

  // Fetch client-side testimonials
  const testimonialsData = { data: pageData.testimonials || [] };

  // Featured listings optimization
  const featured = useMemo(
    () => (marketplaceListings || []).filter((item) => item.isFeatured).slice(0, 12),
    [marketplaceListings]
  );


  const renderSection = (sec: any, idx: number) => {
    const key = (sec.component || sec.id || sec.type || '').toLowerCase();

    if (key === 'hero' || key.includes('hero') || key.includes('heroslider')) {
      return (
        <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSlider" key={sec.id || idx}>
          <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
        </div>
      );
    }

    if (key === 'category' || key.includes('category') || key.includes('categorysection')) {
      return (
        <div id="section-category" data-editor-section="category" data-editor-component="CategorySection" key={sec.id || idx}>
          <CategorySection store={pageData} />
        </div>
      );
    }

    if (key === 'popular-products' || key.includes('popular-products') || key.includes('dynamicpopularproducts')) {
      return (
           <div id="section-popular-products" data-editor-section="popular-products" data-editor-component="DynamicPopularProducts" key={sec.id || idx}>
             <DynamicPopularProducts id={id} />
           </div>
      );
    }

    if (key === 'promo' || key.includes('promo') || key.includes('promosection')) {
      return (
        <div id="section-promo" data-editor-section="promo" data-editor-component="PromoSection" key={sec.id || idx}>
          <PromoSection promotions={promotions} />
        </div>
      );
    }

    if (key === 'trending' || key.includes('trending') || key.includes('dynamictrending')) {
      return (
            <div id="section-trending" data-editor-section="trending" data-editor-component="DynamicTrending" key={sec.id || idx}>
              <DynamicTrending id={id} />
            </div>
      );
    }

    if (key === 'daily-best-sells' || key.includes('daily-best-sells') || key.includes('dynamicdailybestsells')) {
      return (
            <div id="section-daily-best-sells" data-editor-section="daily-best-sells" data-editor-component="DynamicDailyBestSells" key={sec.id || idx}>
              <DynamicDailyBestSells id={id} />
            </div>
      );
    }

    if (key === 'second-promo' || key.includes('second-promo') || key.includes('secondpromosection')) {
      return (
        <div id="section-second-promo" data-editor-section="second-promo" data-editor-component="SecondPromoSection" key={sec.id || idx}>
          <SecondPromoSection promotions={promotions} />
        </div>
      );
    }

    if (key === 'all-products' || key.includes('all-products') || key.includes('allproducts')) {
      return (
        <div id="section-all-products" data-editor-section="all-products" data-editor-component="AllProducts" key={sec.id || idx}>
          <AllProducts 
          id={id} 
          marketplaceListings={featured} 
          themeSettings={themeSettings} 
        />
        </div>
      );
    }

    if (key === 'metrics' || key.includes('metrics') || key.includes('metricssection')) {
      return (
        <div id="section-metrics" data-editor-section="metrics" data-editor-component="MetricsSection" key={sec.id || idx}>
          <MetricsSection coreValues={CoreValues} />
        </div>
      );
    }

    if (key === 'awards' || key.includes('awards') || key.includes('awardssection')) {
      return (
        <div id="section-awards" data-editor-section="awards" data-editor-component="AwardsSection" key={sec.id || idx}>
          <AwardsSection awards={awards} />
        </div>
      );
    }

    if (key === 'testimonials' || key.includes('testimonials') || key.includes('testimonialssection')) {
      return (
          <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection" key={sec.id || idx}>
            <TestimonialsSection testimonials={testimonialsData.data} />
          </div>
      );
    }

    if (key === 'newsletter' || key.includes('newsletter') || key.includes('newslettersection')) {
      return (
        <div id="section-newsletter" data-editor-section="newsletter" data-editor-component="NewsletterSection" key={sec.id || idx}>
          <NewsletterSection />
        </div>
      );
    }

    if (key === 'contact' || key.includes('contact') || key.includes('contactsection')) {
      return (
        <div id="section-contact" data-editor-section="contact" data-editor-component="ContactSection" key={sec.id || idx}>
          <ContactSection />
        </div>
      );
    }

    return null;
  };

  const staticFallback = (
    <>
      
      {/* 01. THE ENTRY: Hero Layer */}
      <section className="relative z-30">
        <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSlider">
          <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
        </div>
      </section>

      {/* 02. DISCOVERY LAYER: Overlapping Category Section */}
      <div className="relative z-40 mt-10 md:mt-20">
        <div id="section-category" data-editor-section="category" data-editor-component="CategorySection">
          <CategorySection store={pageData} />
        </div>
      </div>

      {/* 03. PRODUCT ENGINE: High contrast grid surfaces */}
      <main className="relative z-10 space-y-32 py-24">
        
        {/* Popular Products with responsive grid overlay */}
        <div className="relative">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-[0.05] dark:opacity-[0.03] pointer-events-none invert dark:invert-0" />
           <div id="section-popular-products" data-editor-section="popular-products" data-editor-component="DynamicPopularProducts">
             <DynamicPopularProducts id={id} />
           </div>
        </div>

        {/* First Promo Break */}
        <div id="section-promo" data-editor-section="promo" data-editor-component="PromoSection">
          <PromoSection promotions={promotions} />
        </div>

        {/* Trending & Best Sells: Unified background plate */}
        <section className="bg-zinc-50 dark:bg-white/[0.02] py-24 border-y border-black/5 dark:border-white/5 transition-colors duration-300">
          <div className="space-y-32">
            <div id="section-trending" data-editor-section="trending" data-editor-component="DynamicTrending">
              <DynamicTrending id={id} />
            </div>
            <div id="section-daily-best-sells" data-editor-section="daily-best-sells" data-editor-component="DynamicDailyBestSells">
              <DynamicDailyBestSells id={id} />
            </div>
          </div>
        </section>

        {/* Second Promo Break */}
        <div id="section-second-promo" data-editor-section="second-promo" data-editor-component="SecondPromoSection">
          <SecondPromoSection promotions={promotions} />
        </div>

        {/* Comprehensive Product Feed */}
        <div id="section-all-products" data-editor-section="all-products" data-editor-component="AllProducts">
          <AllProducts 
          id={id} 
          marketplaceListings={featured} 
          themeSettings={themeSettings} 
        />
        </div>
      </main>

      {/* 04. VALIDATION STACK: Social Proof & Reliability */}
      <div className="relative z-20 space-y-0">
        <div id="section-metrics" data-editor-section="metrics" data-editor-component="MetricsSection">
          <MetricsSection coreValues={CoreValues} />
        </div>
        <div id="section-awards" data-editor-section="awards" data-editor-component="AwardsSection">
          <AwardsSection awards={awards} />
        </div>
        {testimonialsData?.data && (
          <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
            <TestimonialsSection testimonials={testimonialsData.data} />
          </div>
        )}
      </div>

      {/* 05. TERMINAL STACK: The Footer Sequence */}
      <footer className="relative z-10 border-t border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-[#030303] transition-colors duration-300">
        <div id="section-newsletter" data-editor-section="newsletter" data-editor-component="NewsletterSection">
          <NewsletterSection />
        </div>
        <div id="section-contact" data-editor-section="contact" data-editor-component="ContactSection">
          <ContactSection />
        </div>
      </footer>

    </>
  );

  return (
    <div className="bg-white dark:bg-[#050505] min-h-screen transition-colors duration-500 selection:bg-zinc-900 dark:selection:bg-white selection:text-white dark:selection:text-black">
      <ThemeSectionContainer
        sections={pageData?.sections}
        renderSection={renderSection}
        staticFallback={staticFallback}
      />
    </div>
  );
}