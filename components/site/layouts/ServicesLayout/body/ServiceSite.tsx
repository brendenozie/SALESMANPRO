"use client";
// File: components/site/layouts/ServicesLayout/ServiceSite.tsx

import React, {  } from "react";

import { useStoreContext } from "@/contexts/StoreContext";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/aboutUs";
import ExcellenceSection from "../components/ExcellenceSection";
import ServicesSection from "../components/ServicesSection";
import PricingSection from "../components/PricingSection";
import TestimonialSection from "../components/TestimonialSection";
import FAQSection from "../components/FAQSection";
import CleaningTipsSection from "../components/CleaningTipsSection";
import GetStartedSection from "../components/GetStartedSection";
import BookingFormSection from "../components/BookingFormSection";
import { StoreForm } from "@/types/typings";

const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;


export default function ServiceSite({ pageData }: { pageData: StoreForm }) {
  
  const { storeFormData } = useStoreContext(); // Use for global theme settings only
  
  // Use pageData for all content
  const siteData = pageData || storeFormData;

  // If there's any chance data is not yet loaded, guard early:
  if (!siteData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <HeroSection storeFormData={siteData} />

      <AboutSection />

      <ExcellenceSection />

      <ServicesSection />

      <PricingSection />

      <TestimonialSection />

      <FAQSection />

      <CleaningTipsSection />
     
      <BookingFormSection />

      <GetStartedSection />
     
    </>
  );
}







