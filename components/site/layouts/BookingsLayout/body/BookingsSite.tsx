// File: components/site/layouts/BookingsLayout/BookingsSite.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import 'react-datepicker/dist/react-datepicker.css';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import Hero from './components/HeroSection';

// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;

// Dynamically import below-the-fold components
const FeaturesSection = dynamic<any>(() => import('./components/FeaturesSection'), { loading: () => <SectionSkeleton />, ssr: false });
const BenefitsSection = dynamic(() => import('./components/BenefitsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const PricingAndStatsSection = dynamic(() => import('./components/PricingAndStatsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const MassageFeatures = dynamic(() => import('./components/MessagesSection'), { loading: () => <SectionSkeleton />, ssr: false });
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const CtaSection = dynamic(() => import('./components/CtaSection'), { loading: () => <SectionSkeleton />, ssr: false });
const FAQsSection = dynamic(() => import('./components/FAQsSection'), { loading: () => <SectionSkeleton />, ssr: false });

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BookingsSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`/api/site/testimonials?id=${companyId}`, fetcher);
  const { data: faqsData } = useSWR(`/api/site/faqs?id=${companyId}`, fetcher);

  const { name, slug, description, bannerUrl, marketplaceListings, heroSlides, themeSettings, CoreValues, stats, pricingTiers, promotions } = pageData;

  return (
    <>
      {/* Hero */}
      <Hero name={name} description={description} bannerUrl={bannerUrl} marketplaceListings={marketplaceListings} heroSlides={heroSlides} />

      <FeaturesSection name={name} description={description} themeSettings={themeSettings} CoreValues={CoreValues} />

      <PricingAndStatsSection stats={stats} pricingTiers={pricingTiers} themeSettings={themeSettings} />

      <MassageFeatures marketplaceListings={marketplaceListings} slug={slug} themeSettings={themeSettings} />

      <BenefitsSection name={name} description={description} bannerUrl={bannerUrl} themeSettings={themeSettings} promotions={promotions} />

      {testimonialsData?.data && <TestimonialsSection name={name} testimonials={testimonialsData.data} themeSettings={themeSettings} />}

      <CtaSection />

      {faqsData?.data && <FAQsSection faqs={faqsData.data} name={name} themeSettings={themeSettings} />}
      
    </>
  );
}

