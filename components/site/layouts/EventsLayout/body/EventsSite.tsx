'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React from "react";
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
    'events-herocomponent': <HeroComponent storeFormData={pageData} />,
    'hero-component': <HeroComponent storeFormData={pageData} />,
    'hero': <HeroComponent storeFormData={pageData} />,
    'events-hero': <HeroComponent storeFormData={pageData} />,
    'events-aboutsection': <AboutSection storeFormData={pageData} />,
    'about': <AboutSection storeFormData={pageData}/>,
    'events-about': <AboutSection storeFormData={pageData}/>,
    'events-featuressection': <FeaturesSection promotions={pageData?.promotions || []} description={pageData?.description} />,
    'features': <FeaturesSection promotions={pageData?.promotions || []} description={pageData?.description} />,
    'events-features': <FeaturesSection promotions={pageData?.promotions || []} description={pageData?.description} />,
    'events-howitworkssection': <HowItWorksSection />,
    'how-it-works': <HowItWorksSection />,
    'events-how-it-works': <HowItWorksSection />,
    'events-liveeventssection': <LiveEventsSection events={events} />,
    'live-events': <LiveEventsSection events={events} />,
    'events': <LiveEventsSection events={events} />,
    'events-live-events': <LiveEventsSection events={events} />,
    'events-testimonialssection': <TestimonialsSection testimonials={testimonials} />,
    'testimonials': <TestimonialsSection testimonials={testimonials} />,
    'events-testimonials': <TestimonialsSection testimonials={testimonials} />,
    'events-pricingsection': <PricingSection />,
    'pricing': <PricingSection />,
    'events-pricing': <PricingSection />,
    'events-faqsection': <FAQSection />,
    'faq': <FAQSection />,
    'faqs': <FAQSection />,
    'events-faq': <FAQSection />,
    'events-calltoactionsection': <CallToActionSection />,
    'call-to-action': <CallToActionSection />,
    'cta': <CallToActionSection />,
    'events-cta': <CallToActionSection />,
  };

  const staticFallback = (
    <>
      <div id="section-events-herocomponent" data-editor-section="events-herocomponent" data-editor-component="HeroComponent">
        <HeroComponent storeFormData={pageData} />
      </div>
      <div id="section-events-aboutsection" data-editor-section="events-aboutsection" data-editor-component="AboutSection">
        <AboutSection storeFormData={pageData}/>
      </div>
      <div id="section-events-featuressection" data-editor-section="events-featuressection" data-editor-component="FeaturesSection">
        <FeaturesSection promotions={pageData?.promotions || []} description={pageData?.description} />
      </div>
      <div id="section-events-howitworkssection" data-editor-section="events-howitworkssection" data-editor-component="HowItWorksSection">
        <HowItWorksSection />
      </div>
      <div id="section-events-liveeventssection" data-editor-section="events-liveeventssection" data-editor-component="LiveEventsSection">
        <LiveEventsSection events={events} />
      </div>
      <div id="section-events-testimonialssection" data-editor-section="events-testimonialssection" data-editor-component="TestimonialsSection">
        <TestimonialsSection testimonials={testimonials} />
      </div>
      <div id="section-events-pricingsection" data-editor-section="events-pricingsection" data-editor-component="PricingSection">
        <PricingSection />
      </div>
      <div id="section-events-faqsection" data-editor-section="events-faqsection" data-editor-component="FAQSection">
        <FAQSection />
      </div>
      <div id="section-events-calltoactionsection" data-editor-section="events-calltoactionsection" data-editor-component="CallToActionSection">
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
