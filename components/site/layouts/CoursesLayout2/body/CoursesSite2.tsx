'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';
import React from "react";
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "./components/HeroSection";

// Below-the-fold components - statically imported
import ProfessionalInfoGrid from './components/ProfessionalInfoGrid';
import SchoolSection from './components/SchoolSection';
import MainCoursesSection from './components/MainCoursesSection';
import AboutSection from './components/AboutSection';
import TestimonialsSection from './components/TestimonialsSection';
import PopularBlogsSection from './components/PopularBlogsSection';
import CtaSection from './components/CtaSection';
import FAQSection from './components/FAQSection';

//----------------------------------------------
// Main CoursesSite2 component (client side)
//----------------------------------------------
export default function CoursesSite2({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection storeFormData={pageData} />,
    'courses2-hero': <HeroSection storeFormData={pageData} />,
    'courses-hero': <HeroSection storeFormData={pageData} />,
    'glass-info-cards': <ProfessionalInfoGrid storeFormData={pageData} />,
    'courses2-glass-info-cards': <ProfessionalInfoGrid storeFormData={pageData} />,
    'professional-info-grid': <ProfessionalInfoGrid storeFormData={pageData} />,
    'courses2-professional-info-grid': <ProfessionalInfoGrid storeFormData={pageData} />,
    'school': <SchoolSection storeFormData={pageData} />,
    'courses2-school': <SchoolSection storeFormData={pageData} />,
    'main-courses': <MainCoursesSection storeFormData={pageData} />,
    'courses2-main-courses': <MainCoursesSection storeFormData={pageData} />,
    'about': <AboutSection storeFormData={pageData} />,
    'courses2-about': <AboutSection storeFormData={pageData} />,
    'testimonials': <TestimonialsSection storeFormData={pageData} />,
    'courses2-testimonials': <TestimonialsSection storeFormData={pageData} />,
    'popular-blogs': <PopularBlogsSection storeFormData={pageData} />,
    'courses2-popular-blogs': <PopularBlogsSection storeFormData={pageData} />,
    'cta': <CtaSection storeFormData={pageData} />,
    'courses2-cta': <CtaSection storeFormData={pageData} />,
    'faq': <FAQSection storeFormData={pageData} />,
    'courses2-faq': <FAQSection storeFormData={pageData} />,
    'faqs': <FAQSection storeFormData={pageData} />,
    'courses2-faqs': <FAQSection storeFormData={pageData} />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection storeFormData={pageData} />
      </div>
      <div id="section-professional-info-grid" data-editor-section="glass-info-cards" data-editor-component="ProfessionalInfoGrid">
        <ProfessionalInfoGrid storeFormData={pageData} />
      </div>
      <div id="section-school" data-editor-section="school" data-editor-component="SchoolSection">
        <SchoolSection storeFormData={pageData} />
      </div>
      <div id="section-main-courses" data-editor-section="main-courses" data-editor-component="MainCoursesSection">
        <MainCoursesSection storeFormData={pageData} />
      </div>
      <div id="section-about" data-editor-section="about" data-editor-component="AboutSection">
        <AboutSection storeFormData={pageData} />
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
        <TestimonialsSection storeFormData={pageData} />
      </div>
      <div id="section-popular-blogs" data-editor-section="popular-blogs" data-editor-component="PopularBlogsSection">
        <PopularBlogsSection storeFormData={pageData} />
      </div>
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection storeFormData={pageData} />
      </div>
      <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
        <FAQSection storeFormData={pageData} />
      </div>
    </>
  );

  return (
    <div className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
