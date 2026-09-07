// File: components/site/layouts/BookingsLayout/BookingsSite.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import 'react-datepicker/dist/react-datepicker.css';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import Hero from './components/HeroSection';

import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';
// Loading skeleton

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// Dynamically import below-the-fold components
const FeaturesSection = dynamic<any>(() => import('./components/FeaturesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const BenefitsSection = dynamic(() => import('./components/BenefitsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const PricingAndStatsSection = dynamic(() => import('./components/PricingAndStatsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const MassageFeatures = dynamic(() => import('./components/MessagesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const CtaSection = dynamic(() => import('./components/CtaSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const FAQsSection = dynamic(() => import('./components/FAQsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BookingsSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: faqsData } = useSWR(`${apiBaseUrl}/site/faqs?id=${companyId}`, fetcher);

  const { name, slug, description, bannerUrl, marketplaceListings, heroSlides, themeSettings, CoreValues, stats, pricingTiers, promotions } = pageData;

  return (
    <>
      {/* Hero */}
      <Hero name={name} description={description} bannerUrl={bannerUrl} marketplaceListings={marketplaceListings} heroSlides={heroSlides} />

      <FeaturesSection name={name} description={description} themeSettings={themeSettings} CoreValues={CoreValues} />
      
      <MassageFeatures marketplaceListings={marketplaceListings} slug={slug} themeSettings={themeSettings} />
      
      <PricingAndStatsSection stats={stats} pricingTiers={pricingTiers} themeSettings={themeSettings} />

      <BenefitsSection name={name} description={description} bannerUrl={bannerUrl} themeSettings={themeSettings} promotions={promotions} />

      {testimonialsData?.data && <TestimonialsSection name={name} testimonials={testimonialsData.data} themeSettings={themeSettings} />}

      <CtaSection />

      {faqsData?.data && <FAQsSection faqs={faqsData.data} name={name} themeSettings={themeSettings} />}
      
    </>
  );
}

