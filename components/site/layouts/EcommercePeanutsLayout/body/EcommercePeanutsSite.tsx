'use client';

import React, { useMemo } from 'react';
import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';
import HeroSlider from './components/HeroSlider';
import { StoreForm, MarketListingForm } from '@/types/typings';

// Above-the-fold components - statically imported
import CategorySection from './components/CategorySection';
import ProductShowcaseSection from './components/ProductShowcaseSection';


// 🧠 Dynamically import client-side sections (with skeleton fallback)
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
    StoreCategory = [],
    marketplaceListings = [],
    testimonials = [],
    awards = [],
    promotions = [],
    bannerUrl,
    CoreValues = [],
  } = pageData;

  // Fetch client-side data
  const testimonialsData = { data: pageData.testimonials || [] };

  // ⚙️ Only include featured listings on SSR
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
        <CategorySection StoreCategory={StoreCategory} themeSettings={themeSettings} />
      </div>
      );
    }

    if (key === 'product-showcase' || key.includes('product-showcase') || key.includes('productshowcasesection')) {
      return (
      <div id="section-product-showcase" data-editor-section="product-showcase" data-editor-component="ProductShowcaseSection" key={sec.id || idx}>
        <ProductShowcaseSection />
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
        <AllProducts id={id} marketplaceListings={featured} themeSettings={themeSettings} />
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

    return null;
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSlider">
        <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      </div>
      <div id="section-category" data-editor-section="category" data-editor-component="CategorySection">
        <CategorySection StoreCategory={StoreCategory} themeSettings={themeSettings} />
      </div>
      <div id="section-product-showcase" data-editor-section="product-showcase" data-editor-component="ProductShowcaseSection">
        <ProductShowcaseSection />
      </div>
      <div id="section-popular-products" data-editor-section="popular-products" data-editor-component="DynamicPopularProducts">
        <DynamicPopularProducts id={id} />
      </div>
      <div id="section-promo" data-editor-section="promo" data-editor-component="PromoSection">
        <PromoSection promotions={promotions} />
      </div>
      <div id="section-trending" data-editor-section="trending" data-editor-component="DynamicTrending">
        <DynamicTrending id={id} />
      </div>
      <div id="section-daily-best-sells" data-editor-section="daily-best-sells" data-editor-component="DynamicDailyBestSells">
        <DynamicDailyBestSells id={id} />
      </div>
      <div id="section-second-promo" data-editor-section="second-promo" data-editor-component="SecondPromoSection">
        <SecondPromoSection promotions={promotions} />
      </div>
      <div id="section-all-products" data-editor-section="all-products" data-editor-component="AllProducts">
        <AllProducts id={id} marketplaceListings={featured} themeSettings={themeSettings} />
      </div>
      <div id="section-metrics" data-editor-section="metrics" data-editor-component="MetricsSection">
        <MetricsSection coreValues={CoreValues} />
      </div>
      <div id="section-awards" data-editor-section="awards" data-editor-component="AwardsSection">
        <AwardsSection awards={awards} />
      </div>
      {testimonialsData?.data && <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
   <TestimonialsSection testimonials={testimonialsData.data} />
 </div>}
      <div id="section-newsletter" data-editor-section="newsletter" data-editor-component="NewsletterSection">
        <NewsletterSection />
      </div>
    </>
  );

  return (
    <div>
      <ThemeSectionContainer
        sections={pageData?.sections}
        renderSection={renderSection}
        staticFallback={staticFallback}
      />
    </div>
  );
}