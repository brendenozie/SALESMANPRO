'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import HeroSection from './components/HeroSection';

// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;

// Dynamically import below-the-fold components
const CoreHighlightsSection = dynamic(() => import('./components/CoreHighlightsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const AboutUsSpotlight = dynamic(() => import('./components/AboutUsSpotlight'), { loading: () => <SectionSkeleton />, ssr: false });
const ProgramsCausesSection = dynamic(() => import('./components/ProgramsCausesSection'), { loading: () => <SectionSkeleton />, ssr: false });
const ImpactStatsSection = dynamic(() => import('./components/ImpactStatsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const EventsUpdatesSection = dynamic(() => import('./components/EventsUpdatesSection'), { loading: () => <SectionSkeleton />, ssr: false });
const NewsSection = dynamic(() => import('./components/NewsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const TestimonialsNewsSection = dynamic(() => import('./components/TestimonialsNewsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const CtaBoldSection = dynamic(() => import('./components/CtaBoldSection'), { loading: () => <SectionSkeleton />, ssr: false });
const FAQSection = dynamic(() => import('./components/FAQSection'), { loading: () => <SectionSkeleton />, ssr: false });

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Updated component signature
export default function NonProfitSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`${apiBaserUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: blogsData } = useSWR(`${apiBaserUrl}/site/blogs?id=${companyId}`, fetcher);
  const { data: faqsData } = useSWR(`${apiBaserUrl}/site/faqs?id=${companyId}`, fetcher);
  const { data: eventsData } = useSWR(`${apiBaserUrl}/site/events?id=${companyId}`, fetcher);

  return (
      <main className="min-h-screen bg-gray-100 font-sans">
        {/* Hero Section - Render immediately */}
        <HeroSection />

        {/* Core Highlights / Impact Areas */}
        <CoreHighlightsSection />

        {/* About Us Spotlight */}
        <AboutUsSpotlight />

        {/* Our Programs / Featured Causes */}
        <ProgramsCausesSection />

        {/* Impact Stats */}
        <ImpactStatsSection />

        {/* Events & Updates - Render when data is ready */}
        {eventsData?.data && <EventsUpdatesSection />}

        {/* News - Render when data is ready */}
        {blogsData?.data && <NewsSection />}

        {/* Testimonials & News - Render when data is ready */}
        {testimonialsData?.data && <TestimonialsNewsSection />}

        {/* Call to Action - Bold */}
        <CtaBoldSection />

        {/* FAQs - Render when data is ready */}
        {faqsData?.data && <FAQSection />}
      </main>
  );
}
