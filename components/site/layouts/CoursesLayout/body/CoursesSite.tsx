'use client';

import React from "react";
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "./components/HeroSection";
import GlassInfoCardsSection from "./components/GlassInfoCardsSection";
import { SkeletonGrid } from "./components/SkeletonGrid/SkeletonGrid";

// Loading skeleton

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// Dynamically import below-the-fold components
const SchoolSection = dynamic(() => import('./components/SchoolSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const MainCoursesSection = dynamic(() => import('./components/MainCoursesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const AboutSection = dynamic(() => import('./components/AboutSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const PopularBlogsSection = dynamic(() => import('./components/PopularBlogsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const CtaSection = dynamic(() => import('./components/CtaSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const FAQSection = dynamic(() => import('./components/FAQSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });

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

      <GlassInfoCardsSection storeFormData={pageData} />

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
