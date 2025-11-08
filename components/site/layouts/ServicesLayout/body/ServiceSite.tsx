'use client';
// File: components/site/layouts/ServicesLayout/ServiceSite.tsx

import React from "react";
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "../components/HeroSection";

// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;
const  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Dynamically import below-the-fold components
const AboutSection = dynamic(() => import('../components/aboutUs'), { loading: () => <SectionSkeleton />, ssr: false });
const ExcellenceSection = dynamic(() => import('../components/ExcellenceSection'), { loading: () => <SectionSkeleton />, ssr: false });
const ServicesSection = dynamic(() => import('../components/ServicesSection'), { loading: () => <SectionSkeleton />, ssr: false });
const PricingSection = dynamic(() => import('../components/PricingSection'), { loading: () => <SectionSkeleton />, ssr: false });
const TestimonialSection = dynamic(() => import('../components/TestimonialSection'), { loading: () => <SectionSkeleton />, ssr: false });
const FAQSection = dynamic(() => import('../components/FAQSection'), { loading: () => <SectionSkeleton />, ssr: false });
const CleaningTipsSection = dynamic(() => import('../components/CleaningTipsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const GetStartedSection = dynamic(() => import('../components/GetStartedSection'), { loading: () => <SectionSkeleton />, ssr: false });
const BookingFormSection = dynamic(() => import('../components/BookingFormSection'), { loading: () => <SectionSkeleton />, ssr: false });

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

export default function ServiceSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  
  const { storeFormData } = useStoreContext(); // Use for global theme settings only
  
  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: faqsData } = useSWR(`${apiBaseUrl}/site/faqs?id=${companyId}`, fetcher);
  
  // Use pageData for all content
  const siteData = pageData || storeFormData;

  // If there's any chance data is not yet loaded, guard early:
  if (!siteData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <HeroSection storeFormData={siteData} heroSlides={siteData.heroSlides}/>

      <AboutSection />

      <ExcellenceSection slug={siteData.slug} themeSettings={siteData.themeSettings} promotions={siteData.promotions} />

      <ServicesSection slug={siteData.slug} themeSettings={siteData.themeSettings} marketplaceListings={siteData.marketplaceListings} />

      <PricingSection pricingTiers={siteData.pricingTiers} themeSettings={siteData.themeSettings} />

      {testimonialsData?.data && <TestimonialSection />}

      {faqsData?.data && <FAQSection />}

      <CleaningTipsSection />
     
      <BookingFormSection />

      <GetStartedSection />
     
    </>
  );
}







