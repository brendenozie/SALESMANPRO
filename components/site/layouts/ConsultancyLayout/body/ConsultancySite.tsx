"use client";

import React, {  } from "react";
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";
import FeaturedProgramsSection from "./components/FeaturedProgramsSection";
import HeroSection from "./components/HeroSection";
import VideoShowcaseSection from "./components/VideoShowcaseSection";
import BrowseByCategory from "./components/BrowseByCategorySection";
import FeaturedListings from "./components/FeaturedListingsSection";
import HowItWorks from "./components/HowItWorksSection";
import TestimonialsCarouselSection from "./components/TestimonialsCarouselSection";
import SocialProofSection from "./components/SocialProofSection";
import AboutSection from "./components/AboutSection";
import ServicesSection from "./components/ServicesSection";
import CallToActionSection from "./components/CallToActionSection";

export default function ConsultancySite({ pageData }: { pageData: StoreForm }) {
  
  const { storeFormData } = useStoreContext(); // Use for global theme settings only

  // Use pageData for all content
  const siteData = pageData || storeFormData;
  
  // marketplaceListings from siteData → map to VehicleCardProps
  const listings = siteData?.marketplaceListings || [];

  return (
    <div className="space-y-24 font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">

      <div className="bg-gradient-to-br from-gray-50 to-orange-50 font-sans antialiased">
      
      {/* Hero */}
      <HeroSection/>      

      <SocialProofSection />
      
      <AboutSection />

      <ServicesSection />  
      
      <FeaturedListings listings={listings} slug=""/>

      <HowItWorks />

      <BrowseByCategory listings={listings} storeSlug=""/>   

      {/* Featured Vehicles */}
      <FeaturedProgramsSection  listings={listings} slug=""/>

      {/* If videos are stored under latestVideos */}
      {<VideoShowcaseSection blogs={(storeFormData?.blogs || []).map(b => ({ ...b, excerpt: b.excerpt ?? "", coverImage: b.coverImage ?? "", videoAlbumId: b.videoAlbumId ?? undefined }))} />}

      <TestimonialsCarouselSection  testimonials={storeFormData?.testimonials || []} />

      <CallToActionSection />

      {/* <PromotionSection/> */}

      {/* <AppPromoSection /> */}
    </div>
     
    </div>
  );
}

