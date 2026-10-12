'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React from 'react';
import useSWR from 'swr';
import 'react-datepicker/dist/react-datepicker.css';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import Hero from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import StyleGallerySection from './components/StyleGallerySection';
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

  const heroNode = (
    <Hero 
      name={name} 
      description={description} 
      bannerUrl={bannerUrl} 
      marketplaceListings={marketplaceListings} 
      heroSlides={heroSlides} 
    />
  );

  const featuresNode = (
    <FeaturesSection 
      name={name} 
      description={description} 
      themeSettings={themeSettings} 
      CoreValues={CoreValues} 
    />
  );

  const massageFeaturesNode = (
    <MassageFeatures 
      marketplaceListings={marketplaceListings} 
      slug={slug} 
      themeSettings={themeSettings} 
    />
  );

  const pricingAndStatsNode = (
    <PricingAndStatsSection 
      stats={stats} 
      pricingTiers={pricingTiers} 
      themeSettings={themeSettings} 
    />
  );

  const styleGalleryNode = <StyleGallerySection themeSettings={themeSettings} />;

  const benefitsNode = (
    <BenefitsSection 
      name={name} 
      description={description} 
      bannerUrl={bannerUrl} 
      themeSettings={themeSettings} 
      promotions={promotions} 
    />
  );

  const testimonialsNode = <TestimonialsSection />;

  const ctaNode = <CtaSection />;

  const faqsNode = (
    <FAQsSection 
      faqs={faqsData?.data} 
      name={name} 
      themeSettings={themeSettings} 
    />
  );
  
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': heroNode,
    'barbershop-hero': heroNode,
    'features': featuresNode,
    'barbershop-features': featuresNode,
    'massage-features': massageFeaturesNode,
    'barbershop-massage-features': massageFeaturesNode,
    'services': massageFeaturesNode,
    'barbershop-services': massageFeaturesNode,
    'pricing-and-stats': pricingAndStatsNode,
    'barbershop-pricing-and-stats': pricingAndStatsNode,
    'pricing': pricingAndStatsNode,
    'barbershop-pricing': pricingAndStatsNode,
    'style-gallery': styleGalleryNode,
    'barbershop-style-gallery': styleGalleryNode,
    'gallery': styleGalleryNode,
    'barbershop-gallery': styleGalleryNode,
    'benefits': benefitsNode,
    'barbershop-benefits': benefitsNode,
    'about': benefitsNode,
    'barbershop-about': benefitsNode,
    'testimonials': testimonialsNode,
    'barbershop-testimonials': testimonialsNode,
    'cta': ctaNode,
    'barbershop-cta': ctaNode,
    'contact': ctaNode,
    'barbershop-contact': ctaNode,
    'faqs': faqsNode,
    'barbershop-faqs': faqsNode,
    'faq': faqsNode,
    'barbershop-faq': faqsNode,
  };

  const staticFallback = (
    <main className="relative">
      <div id="section-hero" data-editor-section="hero" data-editor-component="Hero">
        {heroNode}
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        {featuresNode}
      </div>
      <div id="section-massage-features" data-editor-section="massage-features" data-editor-component="MassageFeatures">
        {massageFeaturesNode}
      </div>
      <div id="section-pricing-and-stats" data-editor-section="pricing-and-stats" data-editor-component="PricingAndStatsSection">
        {pricingAndStatsNode}
      </div>
      <div id="section-style-gallery" data-editor-section="style-gallery" data-editor-component="StyleGallerySection">
        {styleGalleryNode}
      </div>
      <div id="section-benefits" data-editor-section="benefits" data-editor-component="BenefitsSection">
        {benefitsNode}
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
        {testimonialsNode}
      </div>
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        {ctaNode}
      </div>
      <div id="section-faqs" data-editor-section="faqs" data-editor-component="FAQsSection">
        {faqsNode}
      </div>
    </main>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors duration-500 ease-in-out">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.03] z-[99] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
