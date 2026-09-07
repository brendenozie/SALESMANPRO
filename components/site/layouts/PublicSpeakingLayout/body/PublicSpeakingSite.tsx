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

export default function PublicSpeakingSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  
  // const { storeFormData } = useStoreContext(); // Use for global theme settings only

  // Use pageData for all content
  const siteData = pageData;// || storeFormData;
  
  // marketplaceListings from siteData → map to VehicleCardProps
  const Ebookslistings = siteData?.marketplaceListings.filter(listing => listing.type === "ebook") || [];
  const Programslisting = siteData?.marketplaceListings.filter(listing => listing.type !== "ebook") || [];


  return (
    // This outer div provides the full-width background color
    <div className="font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      
        {/* Hero */}
        <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
          <HeroSection heroSlides={siteData?.heroSlides} themeSettings={siteData?.themeSettings} />
        </div>

        <div id="section-social-proof" data-editor-section="social-proof" data-editor-component="SocialProofSection">
          <SocialProofSection />
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
        
        <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
          <AboutSection />
        </div>  

        {/* <ProgramModulesSection /> */}

        {/* Featured  */}
        {/* <div id="section-featured-programs" data-editor-section="featured-programs" data-editor-component="FeaturedProgramsSection">
   <FeaturedProgramsSection  listings={Programslisting} slug=""/>
 </div> */}

        {/* If videos are stored under latestVideos */}
        {/* {<div id="section-video-showcase" data-editor-section="video-showcase" data-editor-component="VideoShowcaseSection">
  <VideoShowcaseSection blogs={(pageData?.blogs || []).map(b => ({ ...b, excerpt: b.excerpt ?? "", coverImage: b.coverImage ?? "", videoAlbumId: b.videoAlbumId ?? undefined }))} />
</div>} */}

        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsCarouselSection">
          <TestimonialsCarouselSection  testimonials={pageData?.testimonials || []} />
        </div>

        <div id="section-call-to-action" data-editor-section="call-to-action" data-editor-component="CallToActionSection">
          <CallToActionSection companyId={siteData?.id || ''} />
        </div>

        {/* <PromotionSection/> */}

        {/* <AppPromoSection /> */}
        
    </div>
  );
}