"use client";

import React from "react";
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

  return (
    <div className="font-sans">
      {/* Hero */}
      <HeroComponent/>

      {/* About */}
      <AboutSection />

      {/* Features */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Live Events */}
      <LiveEventsSection/>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing (for event organizers) */}
      <PricingSection />

      {/* FAQ */}
      <FAQSection />

      <CallToActionSection />

    </div>
  );
}

