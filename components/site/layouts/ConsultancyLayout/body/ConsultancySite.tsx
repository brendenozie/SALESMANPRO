'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React from "react";
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "./components/HeroSection";


// Below-the-fold components - statically imported
import SocialProofSection from './components/SocialProofSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import FeaturedListings from './components/FeaturedListingsSection';
import HowItWorks from './components/HowItWorksSection';
import BrowseByCategory from './components/BrowseByCategorySection';
import VideoShowcaseSection from './components/VideoShowcaseSection';
import TestimonialsCarouselSection from './components/TestimonialsCarouselSection';
import CallToActionSection from './components/CallToActionSection';

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ConsultancySite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  
  // Fetch client-side data
  
  const testimonialsData = { data: pageData.testimonials || [] };
  const blogsData = { data: pageData.blogs || [] };

  // Use pageData for all content
  const siteData = pageData;
  
  // marketplaceListings from siteData → map to VehicleCardProps
  const Ebookslistings = siteData?.marketplaceListings.filter(listing => listing.type === "ebook") || [];
  const Programslisting = siteData?.marketplaceListings.filter(listing => listing.type !== "ebook") || [];

  console.log("ConsultancySite - siteData:", siteData.marketplaceListings);

  
  const heroElem = <HeroSection heroSlides={siteData?.heroSlides} themeSettings={siteData?.themeSettings} />;
  const socialProofElem = <SocialProofSection />;
  const aboutElem = <AboutSection />;
  const servicesElem = <ServicesSection />;
  const featuredListingsElem = <FeaturedListings listings={Ebookslistings} slug={siteData?.slug || ''} />;
  const howItWorksElem = <HowItWorks />;
  const browseByCategoryElem = <BrowseByCategory listings={Programslisting} storeSlug={siteData?.slug || ''} />;
  const videoShowcaseElem = (
    <VideoShowcaseSection blogs={(blogsData?.data || []).map((b: any) => ({ ...b, excerpt: b.excerpt ?? "", coverImage: b.coverImage ?? "", videoAlbumId: b.videoAlbumId ?? undefined }))} />
  );
  const testimonialsElem = (
    <TestimonialsCarouselSection testimonials={testimonialsData?.data || []} />
  );
  const ctaElem = <CallToActionSection />;

  const sectionMap: Record<string, React.ReactNode> = {
    'hero': heroElem,
    'consultancy-hero': heroElem,
    'social-proof': socialProofElem,
    'consultancy-social-proof': socialProofElem,
    'about': aboutElem,
    'consultancy-about': aboutElem,
    'services': servicesElem,
    'consultancy-services': servicesElem,
    'business': servicesElem,
    'consultancy-business': servicesElem,
    'featured-listings': featuredListingsElem,
    'consultancy-featured-listings': featuredListingsElem,
    'how-it-works': howItWorksElem,
    'consultancy-how-it-works': howItWorksElem,
    'browse-by-category': browseByCategoryElem,
    'consultancy-browse-by-category': browseByCategoryElem,
    'video-showcase': videoShowcaseElem,
    'consultancy-video-showcase': videoShowcaseElem,
    'testimonials': testimonialsElem,
    'consultancy-testimonials': testimonialsElem,
    'call-to-action': ctaElem,
    'consultancy-call-to-action': ctaElem,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        {heroElem}
      </div>
      <div id="section-social-proof" data-editor-section="social-proof" data-editor-component="SocialProofSection">
        {socialProofElem}
      </div>
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        {aboutElem}
      </div>
      <div id="section-services" data-editor-section="services" data-editor-component="ServicesSection">
        {servicesElem}
      </div>  
      <div id="section-featured-listings" data-editor-section="featured-listings" data-editor-component="FeaturedListings">
        {featuredListingsElem}
      </div>
      <div id="section-how-it-works" data-editor-section="how-it-works" data-editor-component="HowItWorks">
        {howItWorksElem}
      </div>
      <div id="section-browse-by-category" data-editor-section="browse-by-category" data-editor-component="BrowseByCategory">
        {browseByCategoryElem}
      </div>   
      <div id="section-video-showcase" data-editor-section="video-showcase" data-editor-component="VideoShowcaseSection">
        {videoShowcaseElem}
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsCarouselSection">
        {testimonialsElem}
      </div>
      <div id="section-call-to-action" data-editor-section="call-to-action" data-editor-component="CallToActionSection">
        {ctaElem}
      </div>
    </>
  );

  return (
    <div className="font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="bg-gradient-to-br from-gray-50 to-orange-50 font-sans antialiased">
        <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
      </div>
    </div>
  );
}
