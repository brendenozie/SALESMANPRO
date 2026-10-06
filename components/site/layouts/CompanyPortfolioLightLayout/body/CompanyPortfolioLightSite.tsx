'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React from 'react';
import useSWR from 'swr';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import HeroSection from './components/HeroSection';


import GreyServicesSection from './components/ServicesSection';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
// Below-the-fold components - statically imported
import CoreHighlightsSection from './components/CoreHighlightsSection';
import AboutUsSpotlight from './components/AboutUsSpotlight';
import ProgramsCausesSection from './components/ProgramsCausesSection';
import ImpactStatsSection from './components/ImpactStatsSection';
import EventsUpdatesSection from './components/EventsUpdatesSection';
import NewsSection from './components/NewsSection';
import TestimonialsNewsSection from './components/TestimonialsNewsSection';
import CtaBoldSection from './components/CtaBoldSection';
import FAQSection from './components/FAQSection';
import CallToActionSection from './components/CallToActionSection';
// Generic fetcher

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Updated component signature
export default function CompanyPortfolioSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  
  // Fetch client-side data
  // const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  // const { data: blogsData } = useSWR(`${apiBaseUrl}/site/blogs?id=${companyId}`, fetcher);
  // const { data: faqsData } = useSWR(`${apiBaseUrl}/site/faqs?id=${companyId}`, fetcher);
  // const { data: eventsData } = useSWR(`${apiBaseUrl}/site/events?id=${companyId}`, fetcher);

  
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} name={pageData.name} />,
    'core-highlights': <CoreHighlightsSection pagedata={pageData} />,
    'grey-services': <GreyServicesSection services={pageData.marketplaceListings} storeSlug='' />,
    'about-us-spotlight': <AboutUsSpotlight pagedata={pageData} />,
    'programs-causes': <ProgramsCausesSection pagedata={pageData} />,
    'impact-stats': <ImpactStatsSection pagedata={pageData} />,
    'news': <NewsSection pagedata={pageData} />,
    'testimonials-news': <TestimonialsNewsSection pagedata={pageData} />,
    'cta-bold': <CtaBoldSection pagedata={pageData} />,
    'faq': <FAQSection pagedata={pageData} />,
    'call-to-action': <CallToActionSection companyId={companyId} schedulingLink={''} pagedata={pageData} />,
    'events-updates': <EventsUpdatesSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} name={pageData.name} />
      </div>
      <div id="section-core-highlights" data-editor-section="core-highlights" data-editor-component="CoreHighlightsSection">
        <CoreHighlightsSection pagedata={pageData} />
      </div>
      <div id="section-grey-services" data-editor-section="grey-services" data-editor-component="GreyServicesSection">
        <GreyServicesSection services={pageData.marketplaceListings} storeSlug='' />
      </div>
      <div id="section-about-us-spotlight" data-editor-section="about-us-spotlight" data-editor-component="AboutUsSpotlight">
        <AboutUsSpotlight pagedata={pageData} />
      </div>
      <div id="section-programs-causes" data-editor-section="programs-causes" data-editor-component="ProgramsCausesSection">
        <ProgramsCausesSection pagedata={pageData} />
      </div>
      <div id="section-impact-stats" data-editor-section="impact-stats" data-editor-component="ImpactStatsSection">
        <ImpactStatsSection pagedata={pageData} />
      </div>
      <div id="section-news" data-editor-section="news" data-editor-component="NewsSection">
        <NewsSection pagedata={pageData} />
      </div>
      <div id="section-testimonials-news" data-editor-section="testimonials-news" data-editor-component="TestimonialsNewsSection">
        <TestimonialsNewsSection pagedata={pageData} />
      </div>
      <div id="section-cta-bold" data-editor-section="cta-bold" data-editor-component="CtaBoldSection">
        <CtaBoldSection pagedata={pageData} />
      </div>
      <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
        <FAQSection pagedata={pageData} />
      </div>
      <div id="section-call-to-action" data-editor-section="call-to-action" data-editor-component="CallToActionSection">
        <CallToActionSection companyId={companyId} schedulingLink={''} pagedata={pageData} />
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-white font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </main>
  );
}
