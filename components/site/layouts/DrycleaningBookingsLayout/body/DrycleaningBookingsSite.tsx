'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import 'react-datepicker/dist/react-datepicker.css';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported for LCP performance
import Hero from './components/HeroSection';

// Pristine Loading Skeleton - Soft, airy, and branded
const SectionSkeleton = () => (
  <div className="max-w-7xl mx-auto px-6 py-24">
    <div className="h-[500px] w-full animate-pulse bg-slate-50 dark:bg-white/5 rounded-[4rem] border border-slate-100 dark:border-white/5" />
  </div>
);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Dynamically import sections with heavy logic or animations
const FeaturesSection = dynamic<any>(() => import('./components/FeaturesSection'), { loading: () => <SectionSkeleton />, ssr: false });
const StyleGallerySection = dynamic<any>(() => import('./components/StyleGallerySection'), { loading: () => <SectionSkeleton />, ssr: false });
const BenefitsSection = dynamic(() => import('./components/BenefitsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const PricingAndStatsSection = dynamic(() => import('./components/PricingAndStatsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const MassageFeatures = dynamic(() => import('./components/MessagesSection'), { loading: () => <SectionSkeleton />, ssr: false });
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const CtaSection = dynamic(() => import('./components/CtaSection'), { loading: () => <SectionSkeleton />, ssr: false });
const FAQsSection = dynamic(() => import('./components/FAQsSection'), { loading: () => <SectionSkeleton />, ssr: false });

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BookingsSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Fetch client-side social proof
  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: faqsData } = useSWR(`${apiBaseUrl}/site/faqs?id=${companyId}`, fetcher);

  const { 
    name, 
    slug, 
    description, 
    bannerUrl, 
    marketplaceListings, 
    heroSlides, 
    themeSettings, 
    CoreValues, 
    stats, 
    pricingTiers, 
    promotions 
  } = pageData;

  return (
    <div className="bg-white dark:bg-[#080a0c] selection:bg-teal-100 selection:text-teal-900 transition-colors duration-500">
      
      {/* 01. Hero: The Impression Layer */}
      <Hero 
        name={name} 
        description={description} 
        bannerUrl={bannerUrl} 
        marketplaceListings={marketplaceListings} 
        heroSlides={heroSlides} 
      />

      {/* 02. Core Philosophy & Values */}
      <FeaturesSection 
        name={name} 
        description={description} 
        themeSettings={themeSettings} 
        CoreValues={CoreValues} 
      />
      
      {/* 03. Service Deep-Dive */}
      <MassageFeatures 
        marketplaceListings={marketplaceListings} 
        slug={slug} 
        themeSettings={themeSettings} 
      />
      
      {/* 04. Pricing & Scale: The Menu of Care */}
      <PricingAndStatsSection 
        stats={stats} 
        pricingTiers={pricingTiers} 
        themeSettings={themeSettings} 
      />

      {/* 05. Visual Portfolio: The Gallery */}
      <StyleGallerySection />

      {/* 06. Strategic Advantages & Promotions */}
      <BenefitsSection 
        name={name} 
        description={description} 
        bannerUrl={bannerUrl} 
        themeSettings={themeSettings} 
        promotions={promotions} 
      />

      {/* 07. Social Proof: The Collective Voice */}
      <TestimonialsSection />

      {/* 08. Direct Connection: The Concierge Desk */}
      <CtaSection />

      {/* 09. Knowledge Suite: Common Queries */}
      {faqsData?.data && (
        <FAQsSection 
          faqs={faqsData.data} 
          name={name} 
          themeSettings={themeSettings} 
        />
      )}
      
    </div>
  );
}