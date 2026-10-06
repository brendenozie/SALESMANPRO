'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';
// File: components/site/layouts/BookingsLayout/BookingsSite.tsx

import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import Hero from './components/HeroSection';
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

// Below-the-fold components - statically imported
const FeaturesSection = dynamic<any>(() => import('./components/FeaturesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, });
import BenefitsSection from './components/BenefitsSection';
import PricingAndStatsSection from './components/PricingAndStatsSection';
import MassageFeatures from './components/MessagesSection';
import TestimonialsSection from './components/TestimonialsSection';
import CtaSection from './components/CtaSection';
import FAQsSection from './components/FAQsSection';

export default function BookingsSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const { name, slug, description, bannerUrl, marketplaceListings, heroSlides, themeSettings, CoreValues, stats, pricingTiers, promotions } = pageData;
  const hasTestimonials = (pageData?.testimonials?.length ?? 0) > 0;
  const hasFaqs = (pageData?.faqs?.length ?? 0) > 0;

  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <Hero name={name} description={description} bannerUrl={bannerUrl} marketplaceListings={marketplaceListings} heroSlides={heroSlides} />,
    'features': <FeaturesSection name={name} description={description} themeSettings={themeSettings} CoreValues={CoreValues} />,
    'massage-features': <MassageFeatures marketplaceListings={marketplaceListings} slug={slug} themeSettings={themeSettings} />,
    'pricing-and-stats': <PricingAndStatsSection stats={stats} pricingTiers={pricingTiers} themeSettings={themeSettings} />,
    'benefits': <BenefitsSection name={name} description={description} bannerUrl={bannerUrl} themeSettings={themeSettings} promotions={promotions} />,
    'testimonials': hasTestimonials ? <TestimonialsSection /> : null,
    'cta': <CtaSection />,
    'faqs': hasFaqs ? <FAQsSection /> : null,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="Hero">
        <Hero name={name} description={description} bannerUrl={bannerUrl} marketplaceListings={marketplaceListings} heroSlides={heroSlides} />
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection name={name} description={description} themeSettings={themeSettings} CoreValues={CoreValues} />
      </div>
      <div id="section-massage-features" data-editor-section="massage-features" data-editor-component="MassageFeatures">
        <MassageFeatures marketplaceListings={marketplaceListings} slug={slug} themeSettings={themeSettings} />
      </div>
      <div id="section-pricing-and-stats" data-editor-section="pricing-and-stats" data-editor-component="PricingAndStatsSection">
        <PricingAndStatsSection stats={stats} pricingTiers={pricingTiers} themeSettings={themeSettings} />
      </div>
      <div id="section-benefits" data-editor-section="benefits" data-editor-component="BenefitsSection">
        <BenefitsSection name={name} description={description} bannerUrl={bannerUrl} themeSettings={themeSettings} promotions={promotions} />
      </div>
      {hasTestimonials && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
          <TestimonialsSection />
        </div>
      )}
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection />
      </div>
      {hasFaqs && (
        <div id="section-faqs" data-editor-section="faqs" data-editor-component="FAQsSection">
          <FAQsSection />
        </div>
      )}
    </>
  );

  return (
    <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
  );
}
