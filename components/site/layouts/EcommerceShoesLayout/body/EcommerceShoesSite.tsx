'use client';

import React from 'react';
import HeroSlider from '@/components/site/layouts/EcommerceShoesLayout/body/components/HeroSlider';
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
import BannerSection from './components/BannerSection/BannerSection';

type EcommerceSiteShoesProps = {
  storeData: StoreForm;
};

export default function EcommerceShoesSite({ storeData }: EcommerceSiteShoesProps) {
  const {
    StoreCategory = [],
    marketplaceListings = [],
    testimonials = [],
    awards = [],
    promotions = [],
  } = storeData || {};

  const products = marketplaceListings.length;
  const customers = 0; // Or from your `storeData`
  const awardsCount = awards?.length || 0;
  const support = 24; // Or from your `storeData`

  return (
    <>
      <HeroSlider storeFormData={storeData} />
      <CategorySection  storeFormData={storeData} />
      <PromoSection promotions={promotions} />
      <PopularProducts />
      <MetricsSection  storeFormData={storeData} />
      <DailyBestSells />
      <SleepTapeAd />
      <Trending />
      <FeaturesSection />
      <AllProducts /> 
      <AwardsSection awards={awards} />
      <TestimonialsSection/>
       {/* testimonials={testimonials} /> */}
      <BannerSection/>
      <NewsletterSection />
    </>
  );
}