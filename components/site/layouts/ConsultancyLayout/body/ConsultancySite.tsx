'use client';

import React from "react";
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "./components/HeroSection";
import { SkeletonGrid } from "./components/SkeletonGrid/SkeletonGrid";

// Loading skeleton

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// Dynamically import below-the-fold components
const SocialProofSection = dynamic(() => import('./components/SocialProofSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const AboutSection = dynamic(() => import('./components/AboutSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const ServicesSection = dynamic(() => import('./components/ServicesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const FeaturedListings = dynamic(() => import('./components/FeaturedListingsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const HowItWorks = dynamic(() => import('./components/HowItWorksSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const BrowseByCategory = dynamic(() => import('./components/BrowseByCategorySection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const VideoShowcaseSection = dynamic(() => import('./components/VideoShowcaseSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const TestimonialsCarouselSection = dynamic(() => import('./components/TestimonialsCarouselSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const CallToActionSection = dynamic(() => import('./components/CallToActionSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ConsultancySite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  
  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: blogsData } = useSWR(`${apiBaseUrl}/site/blogs?id=${companyId}`, fetcher);

  // Use pageData for all content
  const siteData = pageData;
  
  // marketplaceListings from siteData → map to VehicleCardProps
  const Ebookslistings = siteData?.marketplaceListings.filter(listing => listing.type === "ebook") || [];
  const Programslisting = siteData?.marketplaceListings.filter(listing => listing.type !== "ebook") || [];

  console.log("ConsultancySite - siteData:", siteData.marketplaceListings);

  return (
    <div className=" font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200  ">

      <div className="bg-gradient-to-br from-gray-50 to-orange-50 font-sans antialiased">
      
      {/* Hero */}
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection heroSlides={siteData?.heroSlides} themeSettings={siteData?.themeSettings} />
      </div>

      <div id="section-social-proof" data-editor-section="social-proof" data-editor-component="SocialProofSection">
        <SocialProofSection />
      </div>
      
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection />
      </div>

      <div id="section-services" data-editor-section="services" data-editor-component="ServicesSection">
        <ServicesSection />
      </div>  
      
      <div id="section-featured-listings" data-editor-section="featured-listings" data-editor-component="FeaturedListings">
        <FeaturedListings listings={Ebookslistings} slug={siteData?.slug || ''} />
      </div>

      <div id="section-how-it-works" data-editor-section="how-it-works" data-editor-component="HowItWorks">
        <HowItWorks />
      </div>

      <div id="section-browse-by-category" data-editor-section="browse-by-category" data-editor-component="BrowseByCategory">
        <BrowseByCategory listings={Programslisting} storeSlug={siteData?.slug || ''} />
      </div>   

      {/* If videos are stored under latestVideos */}
      {blogsData?.data && (
        <div id="section-video-showcase" data-editor-section="video-showcase" data-editor-component="VideoShowcaseSection">
          <VideoShowcaseSection blogs={(blogsData.data || []).map((b: any) => ({ ...b, excerpt: b.excerpt ?? "", coverImage: b.coverImage ?? "", videoAlbumId: b.videoAlbumId ?? undefined }))} />
        </div>
      )}

      {testimonialsData?.data && <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsCarouselSection">
   <TestimonialsCarouselSection  testimonials={testimonialsData.data || []} />
 </div>}

      <div id="section-call-to-action" data-editor-section="call-to-action" data-editor-component="CallToActionSection">
        <CallToActionSection />
      </div>

    </div>
     
    </div>
  );
}

