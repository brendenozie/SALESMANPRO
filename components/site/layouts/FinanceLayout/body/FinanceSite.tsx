'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "./components/heroSection";

// Loading skeleton
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

// Dynamically import below-the-fold components
const PracticeAreasSection = dynamic(() => import('./components/PracticeAreasSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const WhyChooseUsSection = dynamic(() => import('./components/WhyChooseUsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const CaseStudiesTestimonials = dynamic(() => import('./components/CaseStudiesTestimonialsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const ProcessWorkflowSection = dynamic(() => import('./components/ProcessWorkflowSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const MeetOurExperts = dynamic(() => import('./components/MeetOurExperts'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const ConsultationPackagesSection = dynamic(() => import('./components/ConsultationPackagesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const FAQSection = dynamic(() => import('./components/FAQSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const ContactSection = dynamic(() => import('./components/ContactSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });

// --- Global Theme Colors (for Navbar and Footer consistency) ---
const darkBackground = "#0A192F"; // Main background for sections, navbar, footer
const lightBackground = "#112240"; // Alternate background for contrast sections


export default function FinanceSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Using context for global theme settings only
  // const { storeFormData } = useStoreContext(); 

  // Use pageData for all content, with fallback to hardcoded data
  const siteData = pageData && Object.keys(pageData).length > 0 ? pageData : {
    name: "CapitalEdge",
    slug: "capitaledge",
    bannerUrl: "/images/finance-hero.webp", // Ensure this path is correct and image exists
    metrics: [
      { label: "Clients Served", value: "500+" },
      { label: "Assets Managed", value: "$10M+" },
      { label: "Expert Advisors", value: "20+" },
      { label: "Satisfaction Rate", value: "98%" },
    ],
    services: [
      { id: "sv1", name: "Wealth Planning", imageUrl: "/images/services/wealth.webp", slug: "wealth-planning", description: "Strategic wealth accumulation and preservation for future generations." },
      { id: "sv2", name: "Investment Management", imageUrl: "/images/services/investment.webp", slug: "investment-management", description: "Optimized portfolio strategies for maximum returns with controlled risk." },
      { id: "sv3", name: "Retirement Solutions", imageUrl: "/images/services/retirement.webp", slug: "retirement-solutions", description: "Secure your golden years with robust and personalized retirement plans." },
      { id: "sv4", name: "Estate Planning", imageUrl: "/images/services/estate.webp", slug: "estate-planning", description: "Comprehensive guidance for seamless asset transfer and legacy protection." },
    ],
    testimonials: [
      { id: 't1', quote: "CapitalEdge transformed my financial outlook. Their expertise is unmatched!", author: "Sarah M., Entrepreneur" },
      { id: 't2', quote: "The legal clarity they provided was invaluable. Highly professional and responsive.", author: "Dr. Alex J., Medical Director" },
      { id: 't3', quote: "Their team made complex tax planning seem effortless. Truly exceptional service.", author: "Michael C., Business Owner" },
    ],
    faqs: [
      { id: 'faq1', question: "What types of legal services do you offer?", answer: "We offer a comprehensive range of legal services including corporate law, intellectual property, real estate, litigation, and dispute resolution. Our experts are equipped to handle complex cases across various sectors." },
      { id: 'faq2', question: "How do your financial advisory services work?", answer: "Our financial advisory services cover wealth management, investment planning, tax strategy, and estate planning. We work closely with you to understand your financial goals and create tailored strategies for sustainable growth." },
      { id: 'faq3', question: "What is your typical client engagement process?", answer: "Our process begins with an initial consultation to understand your needs, followed by strategic planning, meticulous execution of the agreed-upon strategy, and continuous support with regular reviews to ensure long-term success." },
      { id: 'faq4', question: "Are your consultations confidential?", answer: "Absolutely. All consultations and client interactions are treated with the utmost confidentiality and discretion, adhering to the highest standards of professional ethics and legal privacy regulations." },
      { id: 'faq5', question: "How do I schedule an initial consultation?", answer: "You can easily schedule an initial consultation through our website's contact form, by calling our office directly, or by utilizing our online booking system available on the 'Consultation Packages' page." },
    ],
      Expert :[
      {
        id: 'exp1',
        name: 'Dr. Evelyn Reed',
        role: 'Chief Legal Officer',
        img: '/images/team/expert-evelyn.webp', // Updated path
        bio: 'A visionary leader with over 25 years in corporate law and strategic litigation. Evelyn is renowned for her innovative solutions in complex legal landscapes.',
        linkedin: 'https://linkedin.com/in/evelynreed',
        email: 'evelyn.reed@capitaledge.com'
      },
      {
        id: 'exp2',
        name: 'Mr. Benjamin Carter',
        role: 'Lead Financial Strategist',
        img: '/images/team/expert-benjamin.webp', // Updated path
        bio: 'Benjamin brings unparalleled expertise in wealth management, investment banking, and financial planning, helping clients achieve long-term prosperity.',
        linkedin: 'https://linkedin.com/in/benjamincarter',
        email: 'benjamin.carter@capitaledge.com'
      },
      {
        id: 'exp3',
        name: 'Ms. Olivia Hayes',
        role: 'Senior Tax Advisor',
        img: '/images/team/expert-olivia.webp', // Updated path
        bio: 'Specializing in intricate tax codes and compliance, Olivia ensures optimal financial efficiency and robust tax strategies for our diverse clientele.',
        linkedin: 'https://linkedin.com/in/oliviahayes',
        email: 'olivia.hayes@capitaledge.com'
      },
      {
        id: 'exp4',
        name: 'Mr. Alex Thorne',
        role: 'Real Estate Counsel',
        img: '/images/team/expert-alex.webp', // Updated path
        bio: 'Alex offers comprehensive legal support for property acquisitions, development projects, and dispute resolution, safeguarding client investments.',
        linkedin: 'https://linkedin.com/in/alexthorne',
        email: 'alex.thorne@capitaledge.com'
      },
    ],
    packages:[
      {
        id: 'basic',
        title: 'Foundational Insight',
        description: 'Ideal for initial guidance and understanding your legal or financial landscape.',
        price: '$299',
        frequency: 'One-time consultation',
        features: [
          '60-minute in-depth session',
          'Initial situation assessment',
          'High-level strategy overview',
          'Q&A with a specialist',
          'Post-consultation summary email',
        ],
        buttonText: 'Book Now',
      },
      {
        id: 'premium',
        title: 'Strategic Partnership',
        description: 'Comprehensive planning and advisory for complex legal or financial challenges.',
        price: '$999',
        frequency: 'Monthly Retainer (3-month minimum)',
        features: [
          'Unlimited consultations',
          'Dedicated lead advisor',
          'Customized action plan',
          'Ongoing tactical support',
          'Priority response time',
          'Quarterly performance review',
        ],
        featured: true,
        buttonText: 'Get Started',
      },
      {
        id: 'enterprise',
        title: 'Tailored Enterprise Solutions',
        description: 'Bespoke solutions crafted for complex corporate and institutional requirements.',
        price: 'Contact Us',
        frequency: 'Customized Pricing',
        features: [
          'Dedicated enterprise team',
          'On-site consultations available',
          'Integrated legal & financial services',
          'Risk management & compliance',
          'Proprietary data insights',
          '24/7 priority support',
        ],
        buttonText: 'Request Quote',
      },
    ],
    // themeSettings (example structure from previous usage)
    themeSettings: {
      primaryColor: '#004085', // Dark Blue for primary elements
      secondaryColor: '#1F77B4', // Lighter Blue for secondary elements
      accentColor: '#66B2FF', // Bright Blue for accents
    }
  };

  const testimonials = siteData.testimonials || [];
  const faqs = siteData.faqs || [];
  const hasTestimonials = testimonials.length > 0;
  const hasFaqs = faqs.length > 0;
  const experts = siteData.Expert || [];
  const packages = siteData.packages || [];

  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} />,
    'practice-areas': <PracticeAreasSection marketplaceListings={pageData.marketplaceListings} themeSettings={pageData.themeSettings}/>,
    'services': <PracticeAreasSection marketplaceListings={pageData.marketplaceListings} themeSettings={pageData.themeSettings}/>,
    'why-choose-us': <WhyChooseUsSection themeSettings={pageData.themeSettings} CoreValues={pageData.CoreValues} />,
    'case-studies-testimonials': hasTestimonials ? <CaseStudiesTestimonials testimonials={testimonials} /> : null,
    'testimonials': hasTestimonials ? <CaseStudiesTestimonials testimonials={testimonials} /> : null,
    'process-workflow': <ProcessWorkflowSection />,
    'meet-our-experts': <MeetOurExperts experts={experts} />,
    'consultation-packages': <ConsultationPackagesSection packages={packages} />,
    'faq': hasFaqs ? <FAQSection faqs={faqs} /> : null,
    'contact': <ContactSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection heroSlides={pageData.heroSlides} themeSettings={pageData.themeSettings} />
      </div>        
      <div id="section-practice-areas" data-editor-section="practice-areas" data-editor-component="PracticeAreasSection">
        <PracticeAreasSection marketplaceListings={pageData.marketplaceListings} themeSettings={pageData.themeSettings}/>
      </div>
      <div id="section-why-choose-us" data-editor-section="why-choose-us" data-editor-component="WhyChooseUsSection">
        <WhyChooseUsSection themeSettings={pageData.themeSettings} CoreValues={pageData.CoreValues} />
      </div>
      {hasTestimonials && (
        <div id="section-case-studies-testimonials" data-editor-section="case-studies-testimonials" data-editor-component="CaseStudiesTestimonials">
          <CaseStudiesTestimonials testimonials={testimonials} />
        </div>
      )}
      <div id="section-process-workflow" data-editor-section="process-workflow" data-editor-component="ProcessWorkflowSection">
        <ProcessWorkflowSection />
      </div>
      <div id="section-meet-our-experts" data-editor-section="meet-our-experts" data-editor-component="MeetOurExperts">
        <MeetOurExperts experts={experts} />
      </div>
      <div id="section-consultation-packages" data-editor-section="consultation-packages" data-editor-component="ConsultationPackagesSection">
        <ConsultationPackagesSection packages={packages} />
      </div>
      {hasFaqs && (
        <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
          <FAQSection faqs={faqs} />
        </div>
      )}
      <div id="section-contact" data-editor-section="contact" data-editor-component="ContactSection">
        <ContactSection />
      </div>
    </>
  );

  return (
    <div className="min-h-screen relative font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
