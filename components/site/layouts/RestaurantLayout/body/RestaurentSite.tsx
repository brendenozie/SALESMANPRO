'use client';

import React from "react";
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import RestaurantHero from "../components/RestaurantSite";

// Loading skeleton
import { SkeletonGrid } from './SkeletonGrid/SkeletonGrid';

// Dynamically import below-the-fold components
const SignatureDishes = dynamic(() => import('../components/SignatureDishes'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const WhyDineWithUs = dynamic(() => import('../components/WhyDineWithUs'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const Testimonials = dynamic(() => import('../components/Testimonials'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const RestaurantGallery = dynamic(() => import('../components/RestaurantGallery'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const RestaurantFAQs = dynamic(() => import('../components/RestaurantFAQs'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
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

        <SignatureDishes marketplaceListings={pageData.marketplaceListings} StoreCategory={pageData.StoreCategory} />

        <WhyDineWithUs storeFormData={pageData} />

        {testimonialsData?.data && <Testimonials />}
        
        <RestaurantGallery />

        {faqsData?.data && <RestaurantFAQs />}
        
      </div>
  );
}
