// File: components/site/layouts/ServicesLayout/ServiceSite.tsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { useStoreContext } from "../../../../../contexts/StoreContext";
import bannerFallback from "../../../../../assets/homebanner.png";
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


const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;


export default function ServiceSite() {
  
  const { storeFormData } = useStoreContext();
  // storeFormData should be the same shape you constructed in StoreLayout

  // If there's any chance `storeFormData` is not yet loaded, guard early:
  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <HeroSection storeFormData={storeFormData} />

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







