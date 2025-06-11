// File: app/site/layouts/EcommerceLayouts/body/EcommerceSite.tsx
'use client';

import React from 'react';
import HeroSlider from '@/components/site/layouts/EcommerceLayout/body/components/HeroSlider';
import ProductGrid from '@/components/site/productGrid/ProductGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import MetricsSection from '@/components/site/MetricsSection';
import AwardsSection from '@/components/site/AwardsSection';
import TestimonialsSection from '@/components/site/TestimonialsSection/NewsletterSection';
import PromotionsSection from '@/components/site/PromotionsSection';
import { useStoreContext } from '@/contexts/StoreContext';
import CategorySection from './components/CategorySection';
import PromoSection from './components/PromoSection';
import PopularProducts from './components/PopularProducts';
import DailyBestSells from './components/DailyBestSells';
import FeaturesSection from './components/FeaturesSection';
import SleepTapeAd from './components/SleepTapeAd';
import Trending from './components/Trending';
import AllProducts from './components/AllProducts';

export default function EcommerceSite() {
  // Grab everything from context instead of receiving a `store` prop
  const { storeFormData } = useStoreContext();
  const {
    storeCategories = [],          // previously StoreCategory
    marketplaceListings = [],      // previously store.products
    testimonials = [],             // same shape as before
    awards = [],                   // array of award image URLs or names
    metrics = {},                  // object containing key metrics
    promotions = [],               // array of promotion objects
  } = storeFormData || {};

  // Example metrics fallback if metrics object is empty
  const defaultMetrics = {
    products: marketplaceListings.length,
    customers: 0,
    awards: awards.length,
    support: 24,
  };

  const products = defaultMetrics.products;
  // metrics.products ?? 
  const customers = defaultMetrics.customers;
  // metrics.customers ?? 
  const awardsCount =defaultMetrics.awards;
  // metrics.awards ?? 
  const support =defaultMetrics.support;
  // metrics.support ?? 

  // Framer Motion variants for metric cards
  const metricVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.2 } }),
  };

  return (
    <>
      {/* Hero slider */}
      <HeroSlider />

      {/* Category banners */}
      <CategorySection />

      {/* Promo Section */}
      <PromoSection promotions={promotions}/>

      {/* Popular Products */}
      <PopularProducts />      

      {/* Metrics  */}
      <MetricsSection products={products} customers={customers} awardsCount={awardsCount} support={support}/>

      {/* Daily Best Sells */}
      <DailyBestSells />

      {/* Trending Products */}
      <SleepTapeAd />

      {/* Trending Products */}
      <Trending />
      
      {/* FeaturesSection Products */}
      <FeaturesSection />

      {/* Trending Products */}
      <AllProducts />

      {/* Awards */}
      <AwardsSection awards={awards}/>

      {/* Customer Testimonials */}
      <TestimonialsSection testimonials={testimonials}/>

      {/* Newsletter signup */}
      <NewsletterSection />
    </>
  );
}
