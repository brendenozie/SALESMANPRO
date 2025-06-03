// File: app/site/layouts/EcommerceLayouts/body/EcommerceSite.tsx
'use client';

import React from 'react';
import HeroSlider from '@/components/HeroSlider';
import CategoryBanners from '@/components/site/CategoryBanners/CategoryBanners';
import ProductGrid from '@/components/site/productGrid/ProductGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import Section from '@/components/site/Section/Section';
import { useStoreContext } from '../../../../../contexts/StoreContext';

export default function EcommerceSite() {
  // Grab everything from context instead of receiving a `store` prop
  const { storeFormData } = useStoreContext();
  const {
    storeCategories,          // previously StoreCategory
    marketplaceListings,      // previously store.products
    testimonials,             // same shape as before
  } = storeFormData;

  return (
    <>
      {/* Hero slider now reads from the full storeFormData */}
      <HeroSlider/>

      {/* Category banners */}
      <Section title="">
        <CategoryBanners/>
      </Section>

      {/* Trending Products */}
      <Section title="Trending Products">
        <ProductGrid/>
      </Section>

      {/* Top Selling */}
      <Section title="Top Selling">
        <ProductGrid/>
      </Section>

      {/* All Products */}
      <Section title="All Products">
        <ProductGrid/>
      </Section>

      {/* Newsletter signup */}
      <NewsletterSection />

      {/* Store testimonials */}
      <Section title="">
        {testimonials.map((t:any, idx:any) => (
          <div
            key={idx}
            className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md my-8"
          >
            <p className="text-lg">{t.quote ?? ''}</p>
            <p className="text-sm text-gray-500">– {t.author ?? ''}</p>
          </div>
        ))}
      </Section>
    </>
  );
}
