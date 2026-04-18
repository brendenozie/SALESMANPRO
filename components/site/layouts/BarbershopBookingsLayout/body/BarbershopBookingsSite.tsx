'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import 'react-datepicker/dist/react-datepicker.css';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import Hero from './components/HeroSection';

// Updated Skeleton: Adaptive colors for light/dark transition
const SectionSkeleton = () => (
  <div className="h-96 w-full animate-pulse bg-zinc-200 dark:bg-zinc-800/50 rounded-[2rem] my-12 mx-auto max-w-7xl px-6" />
);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Dynamically import below-the-fold components
const FeaturesSection = dynamic<any>(() => import('./components/FeaturesSection'), { loading: () => <SectionSkeleton />, ssr: false });
const StyleGallerySection = dynamic<any>(() => import('./components/StyleGallerySection'), { loading: () => <SectionSkeleton />, ssr: false });
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
    /* Changed bg-[#0a0a0a] to an adaptive class.
       Using transition-colors to ensure the toggle feels premium and smooth.
    */
    <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors duration-500 ease-in-out">
      
      {/* Hero Section */}
      <Hero 
        name={name} 
        description={description} 
        bannerUrl={bannerUrl} 
        marketplaceListings={marketplaceListings} 
        heroSlides={heroSlides} 
        themeSettings={themeSettings}
      />

      {/* Main Content Sections */}
      <main className="relative">
        <FeaturesSection 
          name={name} 
          description={description} 
          themeSettings={themeSettings} 
          CoreValues={CoreValues} 
        />
        
        <MassageFeatures 
          marketplaceListings={marketplaceListings} 
          slug={slug} 
          themeSettings={themeSettings} 
        />
        
        <PricingAndStatsSection 
          stats={stats} 
          pricingTiers={pricingTiers} 
          themeSettings={themeSettings} 
        />

        <StyleGallerySection themeSettings={themeSettings} />

        <BenefitsSection 
          name={name} 
          description={description} 
          bannerUrl={bannerUrl} 
          themeSettings={themeSettings} 
          promotions={promotions} 
        />

        <TestimonialsSection />

        <CtaSection />

        {/* Conditional FAQ Rendering */}
        {faqsData?.data && (
          <FAQsSection 
            faqs={faqsData.data} 
            name={name} 
            themeSettings={themeSettings} 
          />
        )}
      </main>

      {/* Optional: Global Grainy Texture Overlay for both modes */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.03] z-[99] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}