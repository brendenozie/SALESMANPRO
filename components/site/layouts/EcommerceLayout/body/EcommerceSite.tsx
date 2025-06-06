// File: app/site/layouts/EcommerceLayouts/body/EcommerceSite.tsx
'use client';

import React from 'react';
import HeroSlider from '@/components/HeroSlider';
import CategoryBanners from '@/components/site/CategoryBanners/CategoryBanners';
import ProductGrid from '@/components/site/productGrid/ProductGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import Section from '@/components/site/Section/Section';
import { useStoreContext } from '../../../../../contexts/StoreContext';
import { motion } from 'framer-motion';
import PromotionsSection from '@/components/PromotionsSection';
import MetricsSection from '@/components/MetricsSection';
import AwardsSection from '@/components/AwardsSection';
import TestimonialsSection from '@/components/site/TestimonialsSection/NewsletterSection';

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
      <CategoryBanners />
      
      <ProductGrid title={"trending"} />

      <PromotionsSection promotions={promotions}/>

      {/* Trending Products */}
      <MetricsSection products={products} customers={customers} awardsCount={awardsCount} support={support}/>

      {/* Top Selling */}
      <ProductGrid title="Top Selling" /> 

      <AwardsSection awards={awards}/>

      {/* All Products */}
      <ProductGrid title="All Products" /> 

      {/* Customer Testimonials */}
      <TestimonialsSection testimonials={testimonials}/>

      {/* Newsletter signup */}
      <NewsletterSection />
    </>
  );
}
