'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import HeroSection from './components/HeroSection';

// Loading skeleton

import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
// Dynamically import below-the-fold components
const CoreHighlightsSection = dynamic(() => import('./components/CoreHighlightsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const AboutUsSpotlight = dynamic(() => import('./components/AboutUsSpotlight'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const ProgramsCausesSection = dynamic(() => import('./components/ProgramsCausesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const ImpactStatsSection = dynamic(() => import('./components/ImpactStatsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const EventsUpdatesSection = dynamic(() => import('./components/EventsUpdatesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const NewsSection = dynamic(() => import('./components/NewsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const TestimonialsNewsSection = dynamic(() => import('./components/TestimonialsNewsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const CtaBoldSection = dynamic(() => import('./components/CtaBoldSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const FAQSection = dynamic(() => import('./components/FAQSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Updated component signature
export default function NonProfitSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Fetch client-side data
  // const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  // const { data: blogsData } = useSWR(`${apiBaseUrl}/site/blogs?id=${companyId}`, fetcher);
  // const { data: faqsData } = useSWR(`${apiBaseUrl}/site/faqs?id=${companyId}`, fetcher);
  // const { data: eventsData } = useSWR(`${apiBaseUrl}/site/events?id=${companyId}`, fetcher);

  return (
      <main className="min-h-screen bg-gray-100 font-sans">
        {/* Hero Section - Render immediately */}
        <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
          <HeroSection storeFormData={pageData} />
        </div>

        {/* Core Highlights / Impact Areas */}
        <div id="section-core-highlights" data-editor-section="core-highlights" data-editor-component="CoreHighlightsSection">
          <CoreHighlightsSection storeFormData={pageData} />
        </div>

        {/* About Us Spotlight */}
        <div id="section-about-us-spotlight" data-editor-section="about-us-spotlight" data-editor-component="AboutUsSpotlight">
          <AboutUsSpotlight storeFormData={pageData} />
        </div>

        {/* Our Programs / Featured Causes */}
        <div id="section-programs-causes" data-editor-section="programs-causes" data-editor-component="ProgramsCausesSection">
          <ProgramsCausesSection storeFormData={pageData} />
        </div>

        {/* Impact Stats */}
        <div id="section-impact-stats" data-editor-section="impact-stats" data-editor-component="ImpactStatsSection">
          <ImpactStatsSection storeFormData={pageData} />
        </div>

        {/* Events & Updates - Render when data is ready */}
        <div id="section-events-updates" data-editor-section="events-updates" data-editor-component="EventsUpdatesSection">
          <EventsUpdatesSection storeFormData={pageData} />
        </div>

        {/* News - Render when data is ready */}
        <div id="section-news" data-editor-section="news" data-editor-component="NewsSection">
          <NewsSection storeFormData={pageData} />
        </div>

        {/* Testimonials & News - Render when data is ready */}
        <div id="section-testimonials-news" data-editor-section="testimonials-news" data-editor-component="TestimonialsNewsSection">
          <TestimonialsNewsSection storeFormData={pageData} />
        </div>

        {/* Call to Action - Bold */}
        <div id="section-cta-bold" data-editor-section="cta-bold" data-editor-component="CtaBoldSection">
          <CtaBoldSection storeFormData={pageData} />
        </div>

        {/* FAQs - Render when data is ready */}
        <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
          <FAQSection storeFormData={pageData} />
        </div>
      </main>
  );
}
