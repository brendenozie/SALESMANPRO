'use client';

import React from 'react';
import HeroSlider from '@/components/site/layouts/EcommerceLayout/body/components/HeroSlider';
// import ProductGrid from '@/components/site/productGrid/ProductGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import MetricsSection from '@/components/site/MetricsSection';
import AwardsSection from '@/components/site/AwardsSection';
import TestimonialsSection from '@/components/site/TestimonialsSection/TestimonialsSection';
// import PromotionsSection from '@/components/site/PromotionsSection';
import CategorySection from './components/CategorySection';
import PromoSection from './components/PromoSection';
import PopularProducts from './components/PopularProducts';
import DailyBestSells from './components/DailyBestSells';
import FeaturesSection from './components/FeaturesSection';
import SleepTapeAd from './components/SleepTapeAd';
import Trending from './components/Trending';
import AllProducts from './components/AllProducts';
import { StoreForm } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';

type EcommerceSiteProps = {
  pageData: StoreForm;
};

export default function EcommerceSite({ pageData }: EcommerceSiteProps) {
  // Still use context for global theme/settings, but use pageData for content
  // const { storeFormData } = useStoreContext();

  const {
    slug, themeSettings = {},
    StoreCategory = [],
    marketplaceListings = [],
    testimonials = [],
    awards = [],
    promotions = [],
    bannerUrl,
    CoreValues = [],
  } = pageData;

  return (
    <>
      <HeroSlider storeFormData={pageData} />
      <CategorySection  storeFormData={pageData} />
      <PromoSection promotions={promotions} />
      <PopularProducts slug={slug} marketplaceListings={marketplaceListings} themeSettings={themeSettings} />
      <MetricsSection coreValues={CoreValues}  />
      <DailyBestSells slug={slug} marketplaceListings={marketplaceListings} themeSettings={themeSettings} />
      <SleepTapeAd bannerUrl={bannerUrl} themeSettings={themeSettings} />
      <Trending slug={slug} marketplaceListings={marketplaceListings} themeSettings={themeSettings} />
      <FeaturesSection />
      <AllProducts slug={slug} marketplaceListings={marketplaceListings} themeSettings={themeSettings} /> 
      <AwardsSection awards={awards} />
      <TestimonialsSection testimonials={testimonials} />
      <NewsletterSection />
    </>
  );
}