'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React from "react";
import dynamic from 'next/dynamic';
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroComponent from "./components/HeroSection";
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import LiveEventsSection from './components/LiveEventsSection';
import TestimonialsSection from './components/TestimonialsSection';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';
import CallToActionSection from './components/CallToActionSection';


//----------------------------------------------
// EventsSite component, using StoreContext
//----------------------------------------------
export default function EventsSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const events = pageData?.events || [];
  const testimonials = pageData?.testimonials || [];
  const faqs = pageData?.faqs || [];
  const hasEvents = events.length > 0;
  const hasTestimonials = testimonials.length > 0;
  const hasFaqs = faqs.length > 0;

  const sectionMap: Record<string, React.ReactNode> = {
    'hero-component': <HeroComponent storeFormData={pageData} />,
    'hero': <HeroComponent storeFormData={pageData} />,
    'about': <AboutSection storeFormData={pageData}/>,
    'features': <FeaturesSection promotions={pageData.promotions} description={pageData.description} />,
    'how-it-works': <HowItWorksSection />,
    'live-events': hasEvents ? <LiveEventsSection events={events} /> : null,
    'events': hasEvents ? <LiveEventsSection events={events} /> : null,
    'testimonials': hasTestimonials ? <TestimonialsSection testimonials={testimonials} /> : null,
    'pricing': <PricingSection />,
    'faq': hasFaqs ? <FAQSection /> : null,
    'call-to-action': <CallToActionSection />,
    'cta': <CallToActionSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero-component" data-editor-section="hero-component" data-editor-component="HeroComponent">
        <HeroComponent storeFormData={pageData} />
      </div>
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection storeFormData={pageData}/>
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection promotions={pageData.promotions} description={pageData.description} />
      </div>
      <div id="section-how-it-works" data-editor-section="how-it-works" data-editor-component="HowItWorksSection">
        <HowItWorksSection />
      </div>
      {hasEvents && (
        <div id="section-live-events" data-editor-section="live-events" data-editor-component="LiveEventsSection">
          <LiveEventsSection events={events} />
        </div>
      )}
      {hasTestimonials && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
          <TestimonialsSection testimonials={testimonials} />
        </div>
      )}
      <div id="section-pricing" data-editor-section="pricing" data-editor-component="PricingSection">
        <PricingSection />
      </div>
      {hasFaqs && (
        <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
          <FAQSection />
        </div>
      )}
      <div id="section-call-to-action" data-editor-section="call-to-action" data-editor-component="CallToActionSection">
        <CallToActionSection />
      </div>
    </>
  );

  return (
    <div className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
