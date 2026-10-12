'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';
import React from "react";
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "./components/HeroSection";

// Below-the-fold components - statically imported
import SchoolSection from './components/SchoolSection';
import MainCoursesSection from './components/MainCoursesSection';
import AboutSection from './components/AboutSection';
import TestimonialsSection from './components/TestimonialsSection';
import PopularBlogsSection from './components/PopularBlogsSection';
import CtaSection from './components/CtaSection';
import FAQSection from './components/FAQSection';

//----------------------------------------------
// Main CoursesSite3 component (client side)
//----------------------------------------------
export default function CoursesSite3({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection storeFormData={pageData} />,
    'courses3-hero': <HeroSection storeFormData={pageData} />,
    'courses-hero': <HeroSection storeFormData={pageData} />,
    'school': <SchoolSection storeFormData={pageData} />,
    'courses3-school': <SchoolSection storeFormData={pageData} />,
    'main-courses': <MainCoursesSection storeFormData={pageData} />,
    'courses3-main-courses': <MainCoursesSection storeFormData={pageData} />,
    'about': <AboutSection storeFormData={pageData} />,
    'courses3-about': <AboutSection storeFormData={pageData} />,
    'testimonials': <TestimonialsSection storeFormData={pageData} />,
    'courses3-testimonials': <TestimonialsSection storeFormData={pageData} />,
    'popular-blogs': <PopularBlogsSection storeFormData={pageData} />,
    'courses3-popular-blogs': <PopularBlogsSection storeFormData={pageData} />,
    'cta': <CtaSection storeFormData={pageData} />,
    'courses3-cta': <CtaSection storeFormData={pageData} />,
    'faq': <FAQSection storeFormData={pageData} />,
    'courses3-faq': <FAQSection storeFormData={pageData} />,
    'faqs': <FAQSection storeFormData={pageData} />,
    'courses3-faqs': <FAQSection storeFormData={pageData} />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection storeFormData={pageData} />
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
