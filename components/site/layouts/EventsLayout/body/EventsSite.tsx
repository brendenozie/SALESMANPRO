'use client';

import React from "react";
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroComponent from "./components/HeroSection";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
// Loading skeleton
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

// Dynamically import below-the-fold components
const AboutSection = dynamic(() => import('./components/AboutSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const FeaturesSection = dynamic(() => import('./components/FeaturesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const HowItWorksSection = dynamic(() => import('./components/HowItWorksSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const LiveEventsSection = dynamic(() => import('./components/LiveEventsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const PricingSection = dynamic(() => import('./components/PricingSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const FAQSection = dynamic(() => import('./components/FAQSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const CallToActionSection = dynamic(() => import('./components/CallToActionSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });

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

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

//----------------------------------------------
// EventsSite component, using StoreContext
//----------------------------------------------
export default function EventsSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Fetch client-side data
  const { data: eventsData } = useSWR(`${apiBaseUrl}/site/events?id=${companyId}`, fetcher);
  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: faqsData } = useSWR(`${apiBaseUrl}/site/faqs?id=${companyId}`, fetcher);

  return (
    <div className="font-sans">
      {/* Hero */}
      <HeroComponent storeFormData={pageData} />

      {/* About */}
      <AboutSection storeFormData={pageData}/>

      {/* Features */}
      <FeaturesSection promotions={pageData.promotions} description={pageData.description} />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Live Events - Render when data is ready */}
      {eventsData?.data && <LiveEventsSection events={eventsData.data} />}

      {/* Testimonials - Render when data is ready */}
      {testimonialsData?.data && <TestimonialsSection testimonials={testimonialsData.data} />}

      {/* Pricing (for event organizers) */}
      <PricingSection />

      {/* FAQ - Render when data is ready */}
      {faqsData?.data && <FAQSection />}

      <CallToActionSection />

    </div>
  );
}

