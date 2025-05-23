// app/[slug]/page.tsx
'use client';

import React from 'react';
import HeroSlider from '@/components/HeroSlider';
import Section from '@/components/site/Section/Section';
import ServiceFeatures from '@/components/site/ServiceFeatures/ServiceFeatures';
import CategoryBanners from '@/components/site/CategoryBanners/CategoryBanners';
import ProductGrid from '@/components/site/productGrid/ProductGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { useStore } from '../../../contexts/StoreContext';

export default function StorePage() {
  const store  = useStore();

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  return (
    <>
      <HeroSlider store={store} />

      <Section title=''>
        <ServiceFeatures store={store} />
      </Section>

      <Section title=''>
        <CategoryBanners categories={store.StoreCategory} />
      </Section>

      <Section title="Trending Products">
        <ProductGrid products={store.products} />
      </Section>

      <Section title="Top Selling">
        <ProductGrid products={store.products} />
      </Section>

      <Section title="All Products">
        <ProductGrid products={store.products} />
      </Section>

      <NewsletterSection />

      <Section title=''>
        {store.testimonials.map((t, i) => (
          <div
            key={i}
            className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md my-8"
          >
            <p className="text-lg">{t.quote}</p>
            <p className="text-sm text-gray-500">– {t.author}</p>
          </div>
        ))}
      </Section>
    </>
  );
}
