"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import HeroComponent from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorksSection from "./components/HowItWorksSection";
import LiveEventsSection from "./components/LiveEventsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import PricingSection from "./components/PricingSection";
import FAQSection from "./components/FAQSection";
import CallToActionSection from "./components/CallToActionSection";

//----------------------------------------------
// Image loader (same as elsewhere)
//----------------------------------------------
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

//----------------------------------------------
// EventsSite component, using StoreContext
//----------------------------------------------
export default function EventsSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    description,
    bannerUrl,
    storeCategories: categories,
    marketplaceListings: upcoming,
    testimonials,
    faqs,
  } = storeFormData;

  return (
    <div className="font-sans">
      {/* Hero */}
      <HeroComponent name={name} bannerUrl={bannerUrl} />

      {/* About */}
      <AboutSection description={description} />

      {/* Features */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Live Events */}
      <LiveEventsSection upcoming={upcoming} slug={slug} />

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* Pricing (for event organizers) */}
      <PricingSection />

      {/* FAQ */}
      <FAQSection faqs={faqs} />

      <CallToActionSection slug={""} />

      
    </div>
  );
}

