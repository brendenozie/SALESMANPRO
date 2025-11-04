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
import ProgramModulesSection from "./components/ProgramModulesSection";
import SteppingOutSection from "./components/SteppingOutSection";

export default function PublicSpeakingSite({ pageData }: { pageData: StoreForm }) {
  
  // const { storeFormData } = useStoreContext(); // Use for global theme settings only

  // Use pageData for all content
  const siteData = pageData;// || storeFormData;
  
  // marketplaceListings from siteData → map to VehicleCardProps
  const Ebookslistings = siteData?.marketplaceListings.filter(listing => listing.type === "ebook") || [];
  const Programslisting = siteData?.marketplaceListings.filter(listing => listing.type !== "ebook") || [];

  console.log("ConsultancySite - siteData:", siteData.marketplaceListings);

  return (
    // This outer div provides the full-width background color
    <div className="font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      
      {/* 
        This new inner div acts as the main content container.
        - `max-w-7xl`: Sets a maximum width (e.g., 1280px). You can adjust this (e.g., max-w-6xl).
        - `mx-auto`: Centers the container horizontally.
        - `px-4 sm:px-6 lg:px-8`: Adds padding on the sides for smaller screens.
        - `space-y-24`: Adds vertical spacing between your section components.
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-12">
        {/* 
          The gradient background is now gone from this example, 
          as it's often better to have backgrounds inside each section 
          if they need to be full-width (a common design pattern).

          If you want the gradient on the entire page, apply it to the outermost div.
        */}
      
        {/* Hero */}
        <HeroSection heroSlides={siteData?.heroSlides} themeSettings={siteData?.themeSettings} />

        <SocialProofSection />
        
        {/* <SteppingOutSection storeSlug={siteData?.slug || ''} /> */}

        {/* <ServicesSection />  
        
        <FeaturedListings listings={Ebookslistings} slug={siteData?.slug || ''} />

        <HowItWorks /> */}

        <BrowseByCategory listings={Programslisting} storeSlug={siteData?.slug || ''} /> 
        
        <AboutSection />  

        {/* <ProgramModulesSection /> */}

        {/* Featured  */}
        {/* <FeaturedProgramsSection  listings={Programslisting} slug=""/> */}

        {/* If videos are stored under latestVideos */}
        {/* {<VideoShowcaseSection blogs={(pageData?.blogs || []).map(b => ({ ...b, excerpt: b.excerpt ?? "", coverImage: b.coverImage ?? "", videoAlbumId: b.videoAlbumId ?? undefined }))} />} */}

        <TestimonialsCarouselSection  testimonials={pageData?.testimonials || []} />

        <CallToActionSection companyId={siteData?.id || ''} />

        {/* <PromotionSection/> */}

        {/* <AppPromoSection /> */}
      </div>
    </div>
  );
}