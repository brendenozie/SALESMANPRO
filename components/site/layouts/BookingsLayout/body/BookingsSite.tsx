// File: components/site/layouts/BookingsLayout/BookingsSite.tsx
'use client';

import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import Hero from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import BenefitsSection from './components/BenefitsSection';
import PricingAndStatsSection from './components/PricingAndStatsSection';
import MassageFeatures from './components/MessagesSection';
import TestimonialsSection from './components/TestimonialsSection';
import CtaSection from './components/CtaSection';
import FAQsSection from './components/FAQsSection';

export default function BookingsSite() {

  return (
    <>
      {/* Hero */}
      <Hero />

      <FeaturesSection />

      <PricingAndStatsSection />

      <MassageFeatures />

      <BenefitsSection />

      <TestimonialsSection />

      <CtaSection />

      <FAQsSection />
      
    </>
  );
}

