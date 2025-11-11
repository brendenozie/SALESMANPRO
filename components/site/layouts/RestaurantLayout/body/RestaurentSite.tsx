'use client';

import React from "react";
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import RestaurantHero from "../components/RestaurantSite";

// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;

// Dynamically import below-the-fold components
const SignatureDishes = dynamic(() => import('../components/SignatureDishes'), { loading: () => <SectionSkeleton />, ssr: false });
const WhyDineWithUs = dynamic(() => import('../components/WhyDineWithUs'), { loading: () => <SectionSkeleton />, ssr: false });
const Testimonials = dynamic(() => import('../components/Testimonials'), { loading: () => <SectionSkeleton />, ssr: false });
const RestaurantGallery = dynamic(() => import('../components/RestaurantGallery'), { loading: () => <SectionSkeleton />, ssr: false });
const RestaurantFAQs = dynamic(() => import('../components/RestaurantFAQs'), { loading: () => <SectionSkeleton />, ssr: false });

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
//----------------------------------------------
// RestaurantSite component with hybrid rendering
//----------------------------------------------
export default function RestaurentSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: faqsData } = useSWR(`${apiBaseUrl}/site/faqs?id=${companyId}`, fetcher);

  return (
      <div className="relative bg-cream min-h-screen text-gray-900">
        {/* Patterned Frame */}
        {/* <div className="fixed inset-y-0 left-0 w-8 bg-teal-200 bg-[url('/images/pattern.svg')]"></div>
        <div className="fixed inset-y-0 right-0 w-8 bg-teal-200 bg-[url('/images/pattern.svg')]"></div> */}

        <RestaurantHero heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} slug={pageData.slug} />

        <SignatureDishes marketplaceListings={pageData.marketplaceListings} />

        <WhyDineWithUs />

        {testimonialsData?.data && <Testimonials />}
        
        <RestaurantGallery />

        {faqsData?.data && <RestaurantFAQs />}
        
      </div>
  );
}
