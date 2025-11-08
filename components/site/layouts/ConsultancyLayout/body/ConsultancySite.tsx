'use client';

import React from "react";
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "./components/HeroSection";

// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;

// Dynamically import below-the-fold components
const SocialProofSection = dynamic(() => import('./components/SocialProofSection'), { loading: () => <SectionSkeleton />, ssr: false });
const AboutSection = dynamic(() => import('./components/AboutSection'), { loading: () => <SectionSkeleton />, ssr: false });
const ServicesSection = dynamic(() => import('./components/ServicesSection'), { loading: () => <SectionSkeleton />, ssr: false });
const FeaturedListings = dynamic(() => import('./components/FeaturedListingsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const HowItWorks = dynamic(() => import('./components/HowItWorksSection'), { loading: () => <SectionSkeleton />, ssr: false });
const BrowseByCategory = dynamic(() => import('./components/BrowseByCategorySection'), { loading: () => <SectionSkeleton />, ssr: false });
const VideoShowcaseSection = dynamic(() => import('./components/VideoShowcaseSection'), { loading: () => <SectionSkeleton />, ssr: false });
const TestimonialsCarouselSection = dynamic(() => import('./components/TestimonialsCarouselSection'), { loading: () => <SectionSkeleton />, ssr: false });
const CallToActionSection = dynamic(() => import('./components/CallToActionSection'), { loading: () => <SectionSkeleton />, ssr: false });

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ConsultancySite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  
  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`${apiBaserUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: blogsData } = useSWR(`${apiBaserUrl}/site/blogs?id=${companyId}`, fetcher);

  // Use pageData for all content
  const siteData = pageData;
  
  // marketplaceListings from siteData → map to VehicleCardProps
  const Ebookslistings = siteData?.marketplaceListings.filter(listing => listing.type === "ebook") || [];
  const Programslisting = siteData?.marketplaceListings.filter(listing => listing.type !== "ebook") || [];

  console.log("ConsultancySite - siteData:", siteData.marketplaceListings);

  return (
    <div className="space-y-24 font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200  justify-self-center">

      <div className="bg-gradient-to-br from-gray-50 to-orange-50 font-sans antialiased">
      
      {/* Hero */}
      <HeroSection heroSlides={siteData?.heroSlides} themeSettings={siteData?.themeSettings} />

      <SocialProofSection />
      
      <AboutSection />

      <ServicesSection />  
      
      <FeaturedListings listings={Ebookslistings} slug={siteData?.slug || ''} />

      <HowItWorks />

      <BrowseByCategory listings={Programslisting} storeSlug={siteData?.slug || ''} />   

      {/* If videos are stored under latestVideos */}
      {blogsData?.data && <VideoShowcaseSection blogs={(blogsData.data || []).map((b: any) => ({ ...b, excerpt: b.excerpt ?? "", coverImage: b.coverImage ?? "", videoAlbumId: b.videoAlbumId ?? undefined }))} />}

      {testimonialsData?.data && <TestimonialsCarouselSection  testimonials={testimonialsData.data || []} />}

      <CallToActionSection />

    </div>
     
    </div>
  );
}

