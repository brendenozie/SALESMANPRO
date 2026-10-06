'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React from "react";

import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "./components/HeroSection";
import GlassInfoCardsSection from "./components/GlassInfoCardsSection";


import SchoolSection from './components/SchoolSection';
import MainCoursesSection from './components/MainCoursesSection';
import AboutSection from './components/AboutSection';
import TestimonialsSection from './components/TestimonialsSection';
import PopularBlogsSection from './components/PopularBlogsSection';
import CtaSection from './components/CtaSection';
import FAQSection from './components/FAQSection';

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

//----------------------------------------------
// Main CoursesSite component (client side)
//----------------------------------------------
export default function CoursesSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Fetch client-side data
  
  const testimonialsData = { data: pageData.testimonials || [] };
  const blogsData = { data: pageData.blogs || [] }; 
  const faqsData = { data: pageData.faqs || [] };
  
  
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection storeFormData={pageData} />,
    'glass-info-cards': <GlassInfoCardsSection storeFormData={pageData} />,
    'school': <SchoolSection storeFormData={pageData} />,
    'main-courses': <MainCoursesSection storeFormData={pageData} />,
    'about': <AboutSection storeFormData={pageData} />,
    'testimonials': testimonialsData?.data ? <TestimonialsSection storeFormData={pageData} /> : null,
    'popular-blogs': blogsData?.data ? <PopularBlogsSection storeFormData={pageData} /> : null,
    'cta': <CtaSection storeFormData={pageData} />,
    'faq': faqsData?.data ? <FAQSection storeFormData={pageData} /> : null,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection storeFormData={pageData} />
      </div>
      <div id="section-glass-info-cards" data-editor-section="glass-info-cards" data-editor-component="GlassInfoCardsSection">
        <GlassInfoCardsSection storeFormData={pageData} />
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
      {testimonialsData?.data && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
          <TestimonialsSection storeFormData={pageData} />
        </div>
      )}
      {blogsData?.data && (
        <div id="section-popular-blogs" data-editor-section="popular-blogs" data-editor-component="PopularBlogsSection">
          <PopularBlogsSection storeFormData={pageData} />
        </div>
      )}
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection storeFormData={pageData} />
      </div>
      {faqsData?.data && (
        <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
          <FAQSection storeFormData={pageData} />
        </div>
      )}
    </>
  );

  return (
    <div className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
