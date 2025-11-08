'use client';

import React from "react";
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "./components/HeroSection";

// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;

// Dynamically import below-the-fold components
const SchoolSection = dynamic(() => import('./components/SchoolSection'), { loading: () => <SectionSkeleton />, ssr: false });
const MainCoursesSection = dynamic(() => import('./components/MainCoursesSection'), { loading: () => <SectionSkeleton />, ssr: false });
const AboutSection = dynamic(() => import('./components/AboutSection'), { loading: () => <SectionSkeleton />, ssr: false });
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const PopularBlogsSection = dynamic(() => import('./components/PopularBlogsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const CtaSection = dynamic(() => import('./components/CtaSection'), { loading: () => <SectionSkeleton />, ssr: false });
const FAQSection = dynamic(() => import('./components/FAQSection'), { loading: () => <SectionSkeleton />, ssr: false });

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

//----------------------------------------------
// Main CoursesSite component (client side)
//----------------------------------------------
export default function CoursesSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`${apiBaserUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: blogsData } = useSWR(`${apiBaserUrl}/site/blogs?id=${companyId}`, fetcher);
  const { data: faqsData } = useSWR(`${apiBaserUrl}/site/faqs?id=${companyId}`, fetcher);
  
  return (
    <div className="space-y-32 font-sans">
      {/* Hero */}
      <HeroSection />

      <SchoolSection />

      <MainCoursesSection />

      <AboutSection />

      {testimonialsData?.data && <TestimonialsSection />}

      {blogsData?.data && <PopularBlogsSection />}

      <CtaSection />

      {faqsData?.data && <FAQSection/>}   

    </div>
  );
}
