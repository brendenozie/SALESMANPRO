"use client";

import React from 'react';
import AboutUsSpotlight from './components/AboutUsSpotlight';
import CoreHighlightsSection from './components/CoreHighlightsSection';
import CtaBoldSection from './components/CtaBoldSection';
import FAQSection from './components/FAQSection';
import HeroSection from './components/HeroSection';
import ImpactStatsSection from './components/ImpactStatsSection';
import ProgramsCausesSection from './components/ProgramsCausesSection';
import TestimonialsNewsSection from './components/TestimonialsNewsSection';
import EventsUpdatesSection from './components/EventsUpdatesSection';

export default function NonProfitApp() {
  return (
      <main className="min-h-screen bg-gray-100 font-sans">
        {/* Hero Section */}
        <HeroSection />

        {/* Core Highlights / Impact Areas */}
        <CoreHighlightsSection />

        {/* About Us Spotlight */}
        <AboutUsSpotlight />

        {/* Our Programs / Featured Causes */}
        <ProgramsCausesSection />

        {/* Impact Stats */}
        <ImpactStatsSection />

        {/* Impact Stats */}
        <EventsUpdatesSection />/

        {/* Testimonials & News */}
        <TestimonialsNewsSection />

        {/* Call to Action - Bold */}
        <CtaBoldSection />

        {/* FAQs */}
        <FAQSection />
      </main>
  );
}
