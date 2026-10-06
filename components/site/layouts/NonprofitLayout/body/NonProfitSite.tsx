'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React from 'react';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import HeroSection from './components/HeroSection';



const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
// Section components statically imported to eliminate mid-scroll chunk loading and hydration churn
import CoreHighlightsSection from './components/CoreHighlightsSection';
import AboutUsSpotlight from './components/AboutUsSpotlight';
import ProgramsCausesSection from './components/ProgramsCausesSection';
import ImpactStatsSection from './components/ImpactStatsSection';
import EventsUpdatesSection from './components/EventsUpdatesSection';
import NewsSection from './components/NewsSection';
import TestimonialsNewsSection from './components/TestimonialsNewsSection';
import CtaBoldSection from './components/CtaBoldSection';
import FAQSection from './components/FAQSection';

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Updated component signature
export default function NonProfitSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Fetch client-side data
  
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection storeFormData={pageData} />,
    'core-highlights': <CoreHighlightsSection storeFormData={pageData} />,
    'about-us-spotlight': <AboutUsSpotlight storeFormData={pageData} />,
    'programs-causes': <ProgramsCausesSection storeFormData={pageData} />,
    'impact-stats': <ImpactStatsSection storeFormData={pageData} />,
    'events-updates': <EventsUpdatesSection storeFormData={pageData} />,
    'news': <NewsSection storeFormData={pageData} />,
    'testimonials-news': <TestimonialsNewsSection storeFormData={pageData} />,
    'cta-bold': <CtaBoldSection storeFormData={pageData} />,
    'faq': <FAQSection storeFormData={pageData} />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection storeFormData={pageData} />
      </div>
      <div id="section-core-highlights" data-editor-section="core-highlights" data-editor-component="CoreHighlightsSection">
        <CoreHighlightsSection storeFormData={pageData} />
      </div>
      <div id="section-about-us-spotlight" data-editor-section="about-us-spotlight" data-editor-component="AboutUsSpotlight">
        <AboutUsSpotlight storeFormData={pageData} />
      </div>
      <div id="section-programs-causes" data-editor-section="programs-causes" data-editor-component="ProgramsCausesSection">
        <ProgramsCausesSection storeFormData={pageData} />
      </div>
      <div id="section-impact-stats" data-editor-section="impact-stats" data-editor-component="ImpactStatsSection">
        <ImpactStatsSection storeFormData={pageData} />
      </div>
      <div id="section-events-updates" data-editor-section="events-updates" data-editor-component="EventsUpdatesSection">
        <EventsUpdatesSection storeFormData={pageData} />
      </div>
      <div id="section-news" data-editor-section="news" data-editor-component="NewsSection">
        <NewsSection storeFormData={pageData} />
      </div>
      <div id="section-testimonials-news" data-editor-section="testimonials-news" data-editor-component="TestimonialsNewsSection">
        <TestimonialsNewsSection storeFormData={pageData} />
      </div>
      <div id="section-cta-bold" data-editor-section="cta-bold" data-editor-component="CtaBoldSection">
        <CtaBoldSection storeFormData={pageData} />
      </div>
      <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
        <FAQSection storeFormData={pageData} />
      </div>
    </>
  );

  return (
    <main className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </main>
  );
}
