'use client';
// File: components/site/layouts/ServicesLayout/ServiceSite.tsx

import React from "react";
import { ThemeSectionContainer } from "@/lib/website-builder/createThemeSectionAdapter";
import dynamic from 'next/dynamic';
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "../components/HeroSection";

// Loading skeleton
import { SkeletonGrid } from './SkeletonGrid/SkeletonGrid';

// Dynamically import below-the-fold components
const AboutSection = dynamic(() => import('../components/aboutUs'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const ExcellenceSection = dynamic(() => import('../components/ExcellenceSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const ServicesSection = dynamic(() => import('../components/ServicesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const PricingSection = dynamic(() => import('../components/PricingSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const TestimonialSection = dynamic(() => import('../components/TestimonialSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const FAQSection = dynamic(() => import('../components/FAQSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const CleaningTipsSection = dynamic(() => import('../components/CleaningTipsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const GetStartedSection = dynamic(() => import('../components/GetStartedSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const BookingFormSection = dynamic(() => import('../components/BookingFormSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });

export default function ServiceSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const { storeFormData } = useStoreContext(); // Use for global theme settings only

  // Use pageData for all content
  const siteData = pageData || storeFormData;
  const hasTestimonials = (siteData?.testimonials?.length ?? 0) > 0;
  const hasFaqs = (siteData?.faqs?.length ?? 0) > 0;

  // If there's any chance data is not yet loaded, guard early:
  if (!siteData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection storeFormData={siteData} heroSlides={siteData.heroSlides} />,
    'about': <AboutSection />,
    'excellence': <ExcellenceSection slug={siteData.slug} themeSettings={siteData.themeSettings} promotions={siteData.promotions} />,
    'services': <ServicesSection slug={siteData.slug} themeSettings={siteData.themeSettings} marketplaceListings={siteData.marketplaceListings} />,
    'pricing': <PricingSection pricingTiers={siteData.pricingTiers} themeSettings={siteData.themeSettings} />,
    'testimonial': hasTestimonials ? <TestimonialSection /> : null,
    'faq': hasFaqs ? <FAQSection /> : null,
    'cleaning-tips': <CleaningTipsSection />,
    'booking-form': <BookingFormSection />,
    'get-started': <GetStartedSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection storeFormData={siteData} heroSlides={siteData.heroSlides}/>
      </div>
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection />
      </div>
      <div id="section-excellence" data-editor-section="excellence" data-editor-component="ExcellenceSection">
        <ExcellenceSection slug={siteData.slug} themeSettings={siteData.themeSettings} promotions={siteData.promotions} />
      </div>
      <div id="section-services" data-editor-section="services" data-editor-component="ServicesSection">
        <ServicesSection slug={siteData.slug} themeSettings={siteData.themeSettings} marketplaceListings={siteData.marketplaceListings} />
      </div>
      <div id="section-pricing" data-editor-section="pricing" data-editor-component="PricingSection">
        <PricingSection pricingTiers={siteData.pricingTiers} themeSettings={siteData.themeSettings} />
      </div>
      {hasTestimonials && (
        <div id="section-testimonial" data-editor-section="testimonial" data-editor-component="TestimonialSection">
          <TestimonialSection />
        </div>
      )}
      {hasFaqs && (
        <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
          <FAQSection />
        </div>
      )}
      <div id="section-cleaning-tips" data-editor-section="cleaning-tips" data-editor-component="CleaningTipsSection">
        <CleaningTipsSection />
      </div>
      <div id="section-booking-form" data-editor-section="booking-form" data-editor-component="BookingFormSection">
        <BookingFormSection />
      </div>
      <div id="section-get-started" data-editor-section="get-started" data-editor-component="GetStartedSection">
        <GetStartedSection />
      </div>
    </>
  );

  return (
    <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
  );
}
