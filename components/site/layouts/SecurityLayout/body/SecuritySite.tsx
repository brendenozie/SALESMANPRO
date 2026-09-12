'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';
// File: components/site/layouts/PortfolioLayout/PortfolioSite.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import MarketplaceListingsSection from './components/MarketplaceListingsSection';
import GettingStartedSection from './components/GettingStartedSection';
import FeaturesSection from './components/FeaturesSection';
import AboutSection from './components/AboutSection';
import CaseStudiesSection from './components/CaseStudiesSection';
import DiscoveryCallSection from './components/DiscoveryCallSection';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import CtaSection from './components/CtaSection';
import ContactSection from './components/ContactSection';
import { MarketListingForm, StoreForm } from '@/types/typings';

// Loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function SecuritySite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {

  const {
    name,
    slug,
    bannerUrl,
    description,
    StoreCategory,
    themeSettings = {},
    heroSlides = [],
    testimonials = [],
    awards = [],  
    tagline,
    marketplaceListings = [],
    promotions = [],
    stats=[],
    projects,
    contactEmail,
    CoreValues,
    faqs
  } = pageData;

  
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection name={name} themeSettings={themeSettings} tagline={tagline} heroSlides={heroSlides} testimonials={testimonials} awards={awards} />,
    'services': <ServicesSection name={name} slug={slug} description={description} themeSettings={themeSettings} StoreCategory={StoreCategory} />,
    'marketplace-listings': <MarketplaceListingsSection name={name} slug={slug} themeSettings={themeSettings} marketplaceListings={marketplaceListings} />,
    'getting-started': <GettingStartedSection />,
    'features': <FeaturesSection themeSettings={themeSettings} name={name} promotions={promotions} tagline={tagline} />,
    'about': <AboutSection name={name} slug={slug} bannerUrl={bannerUrl} contactEmail={contactEmail} stats={stats} themeSettings={themeSettings} description={description} tagline={tagline} heroSlides={heroSlides} />,
    'case-studies': <CaseStudiesSection themeSettings={themeSettings} CoreValues={CoreValues} />,
    'discovery-call': <DiscoveryCallSection />,
    'testimonials': <TestimonialsSection themeSettings={themeSettings} testimonials={testimonials} name={name} />,
    'faq': <FAQSection faqs={faqs} themeSettings={themeSettings} />,
    'cta': <CtaSection imageUrl={bannerUrl} />,
    'contact': <ContactSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection name={name} themeSettings={themeSettings} tagline={tagline} heroSlides={heroSlides} testimonials={testimonials} awards={awards} />
      </div>
      <div id="section-services" data-editor-section="services" data-editor-component="ServicesSection">
        <ServicesSection name={name} slug={slug} description={description} themeSettings={themeSettings} StoreCategory={StoreCategory} />
      </div>
      <div id="section-marketplace-listings" data-editor-section="marketplace-listings" data-editor-component="MarketplaceListingsSection">
        <MarketplaceListingsSection name={name} slug={slug} themeSettings={themeSettings} marketplaceListings={marketplaceListings} />
      </div>
      <div id="section-getting-started" data-editor-section="getting-started" data-editor-component="GettingStartedSection">
        <GettingStartedSection />
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection themeSettings={themeSettings} name={name} promotions={promotions} tagline={tagline}/>
      </div> 
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection name={name} slug={slug} bannerUrl={bannerUrl} contactEmail={contactEmail} stats={stats} themeSettings={themeSettings} description={description} tagline={tagline} heroSlides={heroSlides}/>
      </div>
      <div id="section-case-studies" data-editor-section="case-studies" data-editor-component="CaseStudiesSection">
        <CaseStudiesSection themeSettings={themeSettings} CoreValues={CoreValues} />
      </div>
      <div id="section-discovery-call" data-editor-section="discovery-call" data-editor-component="DiscoveryCallSection">
        <DiscoveryCallSection/>
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
        <TestimonialsSection themeSettings={themeSettings} testimonials={testimonials} name={name} />
      </div>
      <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
        <FAQSection faqs={faqs} themeSettings={themeSettings}/>
      </div>
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection imageUrl={bannerUrl}/>
      </div>
      <div id="section-contact" data-editor-section="contact" data-editor-component="ContactSection">
        <ContactSection />
      </div>
    </>
  );

  return (
    <div className="font-sans text-gray-800">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
