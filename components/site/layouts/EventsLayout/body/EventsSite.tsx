'use client';

import React from "react";
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroComponent from "./components/HeroSection";

// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;

// Dynamically import below-the-fold components
const AboutSection = dynamic(() => import('./components/AboutSection'), { loading: () => <SectionSkeleton />, ssr: false });
const FeaturesSection = dynamic(() => import('./components/FeaturesSection'), { loading: () => <SectionSkeleton />, ssr: false });
const HowItWorksSection = dynamic(() => import('./components/HowItWorksSection'), { loading: () => <SectionSkeleton />, ssr: false });
const LiveEventsSection = dynamic(() => import('./components/LiveEventsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const PricingSection = dynamic(() => import('./components/PricingSection'), { loading: () => <SectionSkeleton />, ssr: false });
const FAQSection = dynamic(() => import('./components/FAQSection'), { loading: () => <SectionSkeleton />, ssr: false });
const CallToActionSection = dynamic(() => import('./components/CallToActionSection'), { loading: () => <SectionSkeleton />, ssr: false });

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
  const { data: eventsData } = useSWR(`${apiBaserUrl}/site/events?id=${companyId}`, fetcher);
  const { data: testimonialsData } = useSWR(`${apiBaserUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: faqsData } = useSWR(`${apiBaserUrl}/site/faqs?id=${companyId}`, fetcher);

  return (
    <div className="font-sans">
      {/* Hero */}
      <HeroComponent/>

      {/* About */}
      <AboutSection />

      {/* Features */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Live Events - Render when data is ready */}
      {eventsData?.data && <LiveEventsSection/>}

      {/* Testimonials - Render when data is ready */}
      {testimonialsData?.data && <TestimonialsSection />}

      {/* Pricing (for event organizers) */}
      <PricingSection />

      {/* FAQ - Render when data is ready */}
      {faqsData?.data && <FAQSection />}

      <CallToActionSection />

    </div>
  );
}

