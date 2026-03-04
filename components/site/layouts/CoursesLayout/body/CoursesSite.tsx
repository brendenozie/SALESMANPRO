'use client';

import React from "react";
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "./components/HeroSection";

// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;
const  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

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
  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: blogsData } = useSWR(`${apiBaseUrl}/site/blogs?id=${companyId}`, fetcher);
  const { data: faqsData } = useSWR(`${apiBaseUrl}/site/faqs?id=${companyId}`, fetcher);
  
  return (
    <div className="font-sans">
      {/* Hero */}
      <HeroSection storeFormData={pageData} />

      <SchoolSection storeFormData={pageData} />

      <MainCoursesSection  storeFormData={pageData} />

      <AboutSection  storeFormData={pageData} />

      {testimonialsData?.data && <TestimonialsSection  storeFormData={pageData} />}

      {blogsData?.data && <PopularBlogsSection  storeFormData={pageData} />}

      <CtaSection />

      {faqsData?.data && <FAQSection  storeFormData={pageData} />}   

    </div>
  );
}
