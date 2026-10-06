'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React from 'react';
import useSWR from 'swr';
import 'react-datepicker/dist/react-datepicker.css';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import Hero from './components/HeroSection';
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

// Updated Skeleton: Adaptive colors for light/dark transition


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// Below-the-fold components - statically imported
const FeaturesSection = dynamic<any>(() => import('./components/FeaturesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, });
const StyleGallerySection = dynamic<any>(() => import('./components/StyleGallerySection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, });
import BenefitsSection from './components/BenefitsSection';
import PricingAndStatsSection from './components/PricingAndStatsSection';
import MassageFeatures from './components/MessagesSection';
import TestimonialsSection from './components/TestimonialsSection';
import CtaSection from './components/CtaSection';
import FAQsSection from './components/FAQsSection';

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

  
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <Hero 
        name={name} 
        description={description} 
        bannerUrl={bannerUrl} 
        marketplaceListings={marketplaceListings} 
        heroSlides={heroSlides} 
      />
    ),
    'features': (
      <FeaturesSection 
        name={name} 
        description={description} 
        themeSettings={themeSettings} 
        CoreValues={CoreValues} 
      />
    ),
    'massage-features': (
      <MassageFeatures 
        marketplaceListings={marketplaceListings} 
        slug={slug} 
        themeSettings={themeSettings} 
      />
    ),
    'pricing-and-stats': (
      <PricingAndStatsSection 
        stats={stats} 
        pricingTiers={pricingTiers} 
        themeSettings={themeSettings} 
      />
    ),
    'style-gallery': <StyleGallerySection themeSettings={themeSettings} />,
    'benefits': (
      <BenefitsSection 
        name={name} 
        description={description} 
        bannerUrl={bannerUrl} 
        themeSettings={themeSettings} 
        promotions={promotions} 
      />
    ),
    'testimonials': <TestimonialsSection />,
    'cta': <CtaSection />,
    'faqs': faqsData?.data ? (
      <FAQsSection 
        faqs={faqsData.data} 
        name={name} 
        themeSettings={themeSettings} 
      />
    ) : null,
  };

  const staticFallback = (
    <main className="relative">
      <div id="section-hero" data-editor-section="hero" data-editor-component="Hero">
        <Hero 
          name={name} 
          description={description} 
          bannerUrl={bannerUrl} 
          marketplaceListings={marketplaceListings} 
          heroSlides={heroSlides} 
        />
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection 
          name={name} 
          description={description} 
          themeSettings={themeSettings} 
          CoreValues={CoreValues} 
        />
      </div>
      <div id="section-massage-features" data-editor-section="massage-features" data-editor-component="MassageFeatures">
        <MassageFeatures 
          marketplaceListings={marketplaceListings} 
          slug={slug} 
          themeSettings={themeSettings} 
        />
      </div>
      <div id="section-pricing-and-stats" data-editor-section="pricing-and-stats" data-editor-component="PricingAndStatsSection">
        <PricingAndStatsSection 
          stats={stats} 
          pricingTiers={pricingTiers} 
          themeSettings={themeSettings} 
        />
      </div>
      <div id="section-style-gallery" data-editor-section="style-gallery" data-editor-component="StyleGallerySection">
        <StyleGallerySection themeSettings={themeSettings} />
      </div>
      <div id="section-benefits" data-editor-section="benefits" data-editor-component="BenefitsSection">
        <BenefitsSection 
          name={name} 
          description={description} 
          bannerUrl={bannerUrl} 
          themeSettings={themeSettings} 
          promotions={promotions} 
        />
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
        <TestimonialsSection />
      </div>
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection />
      </div>
      {faqsData?.data && (
        <div id="section-faqs" data-editor-section="faqs" data-editor-component="FAQsSection">
          <FAQsSection 
            faqs={faqsData.data} 
            name={name} 
            themeSettings={themeSettings} 
          />
        </div>
      )}
    </main>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors duration-500 ease-in-out">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.03] z-[99] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
