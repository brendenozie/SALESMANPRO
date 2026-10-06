'use client';

import React from "react";
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import RestaurantHero from "../components/RestaurantSite";


// Below-the-fold components - statically imported
import SignatureDishes from '../components/SignatureDishes';
import WhyDineWithUs from '../components/WhyDineWithUs';
import Testimonials from '../components/Testimonials';
import RestaurantGallery from '../components/RestaurantGallery';
import RestaurantFAQs from '../components/RestaurantFAQs';

import { ThemeSectionContainer } from "@/lib/website-builder/createThemeSectionAdapter";

//----------------------------------------------
// RestaurantSite component with authentic Theme Section Adapter
//----------------------------------------------
export default function RestaurentSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const hasTestimonials = (pageData?.testimonials?.length ?? 0) > 0;
  const hasFaqs = (pageData?.faqs?.length ?? 0) > 0;

  // Extract structured tenant section configuration
  const heroConfig =
    (pageData as any)?.heroConfig ||
    (pageData as any)?.sections?.find((s: any) => s.type === "hero" || s.id?.includes("hero"))?.content;

  const renderSection = (sec: any, idx: number) => {
    const key = (sec.component || sec.id || sec.type || '').toLowerCase();

    if (key.includes('hero') || key.includes('restauranthero')) {
      return (
        <div id={sec.id || "section-restaurant-hero"} data-editor-section={sec.id || "restaurant-hero"} data-editor-component="RestaurantHero" key={sec.id || idx}>
          <RestaurantHero 
            config={sec.content || heroConfig}
            heroSlides={pageData.heroSlides} 
            themeSettings={pageData.themeSettings} 
            slug={pageData.slug} 
          />
        </div>
      );
    }

    if (key.includes('dish') || key.includes('signaturedishes') || key.includes('signature-dishes')) {
      return (
        <div id={sec.id || "section-signature-dishes"} data-editor-section={sec.id || "signature-dishes"} data-editor-component="SignatureDishes" key={sec.id || idx}>
          <SignatureDishes marketplaceListings={pageData.marketplaceListings} StoreCategory={pageData.StoreCategory} />
        </div>
      );
    }

    if (key.includes('why') || key.includes('dine') || key.includes('whydinewithus') || key.includes('why-dine-with-us')) {
      return (
        <div id={sec.id || "section-why-dine-with-us"} data-editor-section={sec.id || "why-dine-with-us"} data-editor-component="WhyDineWithUs" key={sec.id || idx}>
          <WhyDineWithUs storeFormData={pageData} />
        </div>
      );
    }

    if (key.includes('testimonial')) {
      if (!hasTestimonials) return null;
      return (
        <div id={sec.id || "section-testimonials"} data-editor-section={sec.id || "testimonials"} data-editor-component="Testimonials" key={sec.id || idx}>
          <Testimonials />
        </div>
      );
    }

    if (key.includes('gallery') || key.includes('restaurantgallery')) {
      return (
        <div id={sec.id || "section-restaurant-gallery"} data-editor-section={sec.id || "restaurant-gallery"} data-editor-component="RestaurantGallery" key={sec.id || idx}>
          <RestaurantGallery />
        </div>
      );
    }

    if (key.includes('faq') || key.includes('restaurantfaqs')) {
      if (!hasFaqs) return null;
      return (
        <div id={sec.id || "section-restaurant-faqs"} data-editor-section={sec.id || "restaurant-faqs"} data-editor-component="RestaurantFAQs" key={sec.id || idx}>
          <RestaurantFAQs />
        </div>
      );
    }

    return null;
  };

  const staticFallback = (
    <>
      <div id="section-restaurant-hero" data-editor-section="restaurant-hero" data-editor-component="RestaurantHero">
        <RestaurantHero 
          config={heroConfig}
          heroSlides={pageData.heroSlides} 
          themeSettings={pageData.themeSettings} 
          slug={pageData.slug} 
        />
      </div>

      <div id="section-signature-dishes" data-editor-section="signature-dishes" data-editor-component="SignatureDishes">
        <SignatureDishes marketplaceListings={pageData.marketplaceListings} StoreCategory={pageData.StoreCategory} />
      </div>

      <div id="section-why-dine-with-us" data-editor-section="why-dine-with-us" data-editor-component="WhyDineWithUs">
        <WhyDineWithUs storeFormData={pageData} />
      </div>

      {hasTestimonials && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="Testimonials">
          <Testimonials />
        </div>
      )}
      
      <div id="section-restaurant-gallery" data-editor-section="restaurant-gallery" data-editor-component="RestaurantGallery">
        <RestaurantGallery />
      </div>

      {hasFaqs && (
        <div id="section-restaurant-faqs" data-editor-section="restaurant-faqs" data-editor-component="RestaurantFAQs">
          <RestaurantFAQs />
        </div>
      )}
    </>
  );

  return (
    <div className="relative bg-cream min-h-screen text-gray-900">
      <ThemeSectionContainer
        sections={(pageData as any)?.sections}
        renderSection={renderSection}
        fallback={staticFallback}
      />
    </div>
  );
}
