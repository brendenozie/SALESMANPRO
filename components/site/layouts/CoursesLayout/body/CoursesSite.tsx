"use client";

import React from "react";
import HeroSection from "./components/HeroSection";
import SchoolSection from "./components/SchoolSection";
import MainCoursesSection from "./components/MainCoursesSection";
import AboutSection from "./components/AboutSection";
import TestimonialsSection from "./components/TestimonialsSection";
import PopularBlogsSection from "./components/PopularBlogsSection";
import CtaSection from "./components/CtaSection";
import FAQSection from "./components/FAQSection";
import { StoreForm } from "@/types/typings";


//----------------------------------------------
// Main CoursesSite component (client side)
//----------------------------------------------
export default function CoursesSite({ pageData }: { pageData: StoreForm }) {
  
  return (
    <div className="space-y-32 font-sans">
      {/* Hero */}
      <HeroSection />

      <SchoolSection />

      <MainCoursesSection />

      <AboutSection />

      <TestimonialsSection />

      <PopularBlogsSection />

      <CtaSection />

      <FAQSection/>   

    </div>
  );
}
