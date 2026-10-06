'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React from "react";
import dynamic from 'next/dynamic';
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroComponent from "./components/HeroSection";

// Loading skeleton
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

// Dynamically import below-the-fold components
const AboutSection = dynamic(() => import('./components/AboutSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, });
const FeaturesSection = dynamic(() => import('./components/FeaturesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, });
const HowItWorksSection = dynamic(() => import('./components/HowItWorksSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, });
const LiveEventsSection = dynamic(() => import('./components/LiveEventsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, });
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, });
const PricingSection = dynamic(() => import('./components/PricingSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, });
const FAQSection = dynamic(() => import('./components/FAQSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, });
const CallToActionSection = dynamic(() => import('./components/CallToActionSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, });

//----------------------------------------------
// Image loader (same as elsewhere)
//----------------------------------------------
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;


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
