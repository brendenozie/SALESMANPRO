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

      {/* Promotional Banners */}
      {promotions.length > 0 && (
        <Section title="Promotions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((promo: any, idx: number) => (
              <motion.div
                key={idx}
                className="relative rounded-xl overflow-hidden shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={promo.imageUrl}
                  alt={promo.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{promo.title}</h3>
                  <p className="text-white mb-4">{promo.subtitle}</p>
                  {promo.ctaLink && promo.ctaText && (
                    <a
                      href={promo.ctaLink}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-full transition"
                    >
                      {promo.ctaText}
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* Key Metrics Section */}
      <Section title="Our Achievements">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Products', value: products },
            { label: 'Happy Customers', value: customers },
            { label: 'Awards', value: awardsCount },
            { label: '24/7 Support', value: support },
          ].map((metric, idx) => (
            <motion.div
              key={metric.label}
              custom={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={metricVariants}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center"
            >
              <span className="text-4xl font-extrabold text-gray-800">{metric.value}</span>
              <span className="mt-2 text-gray-600 font-medium">{metric.label}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Awards / Recognition Section */}
      {awards.length > 0 && (
        <Section title="Our Awards">
          <div className="flex flex-wrap justify-center items-center gap-6">
            {awards.map((award: any, idx: number) => (
              <div key={idx} className="w-32 h-32 flex items-center justify-center p-4 bg-white rounded-lg shadow-sm">
                <img
                  src={award.imageUrl || award.url || award}
                  alt={award.name || `Award ${idx + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Category banners */}
      <Section title="Explore Categories">
        <CategoryBanners />
      </Section>

      {/* Trending Products */}
      <Section title="Trending Products">
        <ProductGrid />
        {/* filter="trending"  */}
      </Section>

      {/* Top Selling */}
      <Section title="Top Selling">
        <ProductGrid />
        {/* filter="top-selling" */}
      </Section>

      {/* All Products */}
      <Section title="All Products">
        <ProductGrid />
        {/* title="All Products" */}
      </Section>

      {/* Customer Testimonials */}
      {testimonials.length > 0 && (
        <Section title="What Our Customers Say">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t: any, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between"
              >
                <p className="text-lg italic text-gray-700 mb-4">“{t.quote}”</p>
                <p className="text-sm text-gray-500 font-medium text-right">– {t.author}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Newsletter signup */}
      <NewsletterSection />
    </>
  );
}
