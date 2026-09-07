'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import HeroSection from './components/HeroSection';

// Loading skeleton

import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';
import GreyServicesSection from './components/ServicesSection';

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
const CallToActionSection = dynamic(() => import('./components/CallToActionSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
// Generic fetcher

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Updated component signature
export default function CompanyPortfolioSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  
  // Fetch client-side data
  // const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  // const { data: blogsData } = useSWR(`${apiBaseUrl}/site/blogs?id=${companyId}`, fetcher);
  // const { data: faqsData } = useSWR(`${apiBaseUrl}/site/faqs?id=${companyId}`, fetcher);
  // const { data: eventsData } = useSWR(`${apiBaseUrl}/site/events?id=${companyId}`, fetcher);

  return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
        {/* Hero Section - Render immediately */}
        <HeroSection heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} name={pageData.name} />

        {/* Core Highlights / Impact Areas */}
        <CoreHighlightsSection pagedata={pageData} />

        <GreyServicesSection services={pageData.marketplaceListings} storeSlug='' />

        {/* About Us Spotlight */}
        <AboutUsSpotlight pagedata={pageData} />

        {/* Our Programs / Featured Causes */}
        <ProgramsCausesSection pagedata={pageData} />

        {/* Impact Stats */}
        <ImpactStatsSection pagedata={pageData} />

        {/* Events & Updates - Render when data is ready */}
        {/* {eventsData?.data && <EventsUpdatesSection />} */}

        {/* News - Render when data is ready */}
        {<NewsSection pagedata={pageData} />}

        {/* Testimonials & News - Render when data is ready */}
        {<TestimonialsNewsSection pagedata={pageData} />}

        {/* Call to Action - Bold */}
        <CtaBoldSection pagedata={pageData} />

        {/* FAQs - Render when data is ready */}
        {<FAQSection pagedata={pageData} />}

        <CallToActionSection companyId={companyId} schedulingLink={``} pagedata={pageData}   />
      </main>
  );
}
