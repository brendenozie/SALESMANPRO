"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Assuming useStoreContext provides data for the site; if not, remove or adjust.
import { useStoreContext } from "../../../../../contexts/StoreContext";

// Import all your transformed child components
import HeroSection from "./components/heroSection";
import PracticeAreasSection from "./components/PracticeAreasSection";
import WhyChooseUsSection from "./components/WhyChooseUsSection";
import CaseStudiesTestimonials from "./components/CaseStudiesTestimonialsSection";
import ProcessWorkflowSection from "./components/ProcessWorkflowSection";
import MeetOurExperts from "./components/MeetOurExperts";
import ConsultationPackagesSection from "./components/ConsultationPackagesSection";
import FAQSection from "./components/FAQSection";
import ContactSection from "./components/ContactSection";

// --- Global Theme Colors (for Navbar and Footer consistency) ---
const darkBackground = "#0A192F"; // Main background for sections, navbar, footer
const cardBackground = "#1B2A41"; // Used for cards/elements on dark background
const accentColor = "#66B2FF"; // Primary accent blue
const textColorLight = "#E0E7FF"; // Lighter text on dark background
const textColorMuted = "#A7B8D6"; // Muted text for secondary info

// --- Navbar Component ---
const Navbar = () => {
  // Navigation links - link to section IDs
  const navLinks = [
    { name: "Home", href: "#top" },
    { name: "Services", href: "#practice-areas" },
    { name: "Why Us", href: "#why-choose-us" },
    { name: "Process", href: "#our-process" },
    { name: "Team", href: "#our-experts" },
    { name: "Packages", href: "#consultation-packages" },
    { name: "FAQs", href: "#faqs" },
    { name: "Contact", href: "#contact-us" },
  ];

  const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-8 shadow-lg"
      style={{ backgroundColor: darkBackground, borderBottom: `1px solid ${cardBackground}` }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Brand Name */}
        <Link href="#top" className="flex items-center space-x-2 text-white text-2xl font-bold hover:text-blue-300 transition-colors duration-300">
          <Image src="/images/logo-placeholder.png" alt="CapitalEdge Logo" loader={loader} width={40} height={40} className="rounded-full" />
          <span>CapitalEdge</span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-lg font-medium text-blue-200 hover:text-white transition-colors duration-300"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button (You'd implement actual mobile menu logic here) */}
        <div className="md:hidden">
          {/* Example: Hamburger Icon */}
          <button className="text-white focus:outline-none">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

// --- Footer Component ---
const Footer = () => {
  return (
    <footer className="py-12 px-6 md:px-8" style={{ backgroundColor: darkBackground, borderTop: `1px solid ${cardBackground}` }}>
      <div className="max-w-7xl mx-auto text-center text-blue-300">
        <p className="text-lg font-semibold mb-4">CapitalEdge</p>
        <p className="mb-2">123 Lumina Tower, Suite 500, Strategic Avenue, Nairobi, Kenya</p>
        <p className="mb-2">+1 (234) 567-890 | info@capitaledge.com</p>
        <div className="flex justify-center space-x-6 mt-6">
          {/* Social Media Icons (replace with actual icons/links) */}
          <a href="#" aria-label="Facebook" className="text-blue-300 hover:text-white transition-colors duration-200">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M14 12.006c0-1.12.92-1.994 2.012-1.994s2.012.875 2.012 1.994-.92 1.994-2.012 1.994-2.012-.875-2.012-1.994zm5-7v14c0 2.761-2.239 5-5 5h-14c-2.761 0-5-2.239-5-5v-14c0-2.761 2.239-5 5-5h14c2.761 0 5 2.239 5 5zm-4 11h-2l-.004-7.107c-.446-.341-.758-.582-1.153-.722-.401-.143-.88-.215-1.439-.215-1.399 0-2.316.892-2.316 2.508v5.536h-2v-11h2v1.765c.379-.652.842-1.229 1.401-1.688.559-.459 1.258-.797 2.091-.797 2.003 0 3.398 1.492 3.398 5.706v6.214z"></path></svg>
          </a>
          <a href="#" aria-label="Twitter" className="text-blue-300 hover:text-white transition-colors duration-200">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.29 8.29-4.59 4.59-2.29-2.29c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41L9.7 16.59c.39.39 1.02.39 1.41 0l5.3-5.3c.39-.39.39-1.02 0-1.41s-1.03-.39-1.42 0z"></path></svg>
          </a>
          <a href="#" aria-label="LinkedIn" className="text-blue-300 hover:text-white transition-colors duration-200">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
          </a>
        </div>
        <p className="mt-8 text-sm text-blue-400">&copy; {new Date().getFullYear()} CapitalEdge. All rights reserved.</p>
      </div>
    </footer>
  );
};


export default function FinancSite() {
  const router = useRouter();
  // Using the context, but also providing local 'store' for demo purposes
  // In a real app, you'd likely fetch this data or get it from a CMS.
  const { storeFormData } = useStoreContext(); 

  // Combined data source (prioritize storeFormData if available, else use hardcoded 'store')
  const siteData = storeFormData && Object.keys(storeFormData).length > 0 ? storeFormData : {
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
    experts:[
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

  // State initialization: Use the combined siteData for child components
  const [metrics, setMetrics] = useState<any[]>(siteData.metrics);
  const [services, setServices] = useState<any[]>(siteData.services);
  const [testimonials, setTestimonials] = useState<any[]>(siteData.testimonials);
  const [faqs, setFaqs] = useState<any[]>(siteData.faqs);
  const [experts, setExperts] = useState<any[]>(siteData.experts);
  const [packages, setPackages] = useState<any[]>(siteData.packages);


  // useEffect to update states if storeFormData changes (e.g., from a CMS)
  useEffect(() => {
    if (storeFormData && Object.keys(storeFormData).length > 0) {
      setMetrics(storeFormData.metrics || []);
      setServices(storeFormData.services || []);
      setTestimonials(storeFormData.testimonials || []);
      setFaqs(storeFormData.faqs || []);
      setExperts(storeFormData.experts || []);
      setPackages(storeFormData.packages || []);
    }
  }, [storeFormData]);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: darkBackground }}>
      {/* Set the main background color for the entire page */}
      <span id="top" className="absolute -top-20" /> {/* Anchor for 'Home' link */}

      {/* Navbar Component */}
      <Navbar />

      {/* Main Content Area - Sections with consistent spacing */}
      <main className="pt-20"> {/* Add padding-top to account for fixed navbar */}
        <HeroSection
          headline={siteData.name}
          subline="Your Partner in Legal & Financial Excellence" // Hardcoded for demo, adjust as needed
          imageUrl={siteData.bannerUrl ||  'https://via.placeholder.com/1500x600?text=Hero+Image'} // Fallback image
          metrics={metrics} // Pass metrics to HeroSection
          primary={siteData.themeSettings?.primaryColor}
          secondary={siteData.themeSettings?.secondaryColor}
        />

        <div className="space-y-24 lg:space-y-36"> {/* Consistent vertical spacing between sections */}
          <PracticeAreasSection services={services} />
          <WhyChooseUsSection />
          <CaseStudiesTestimonials testimonials={testimonials} />
          <ProcessWorkflowSection />
          <MeetOurExperts experts={experts} />
          <ConsultationPackagesSection packages={packages} />
          <FAQSection faqs={faqs} />
          <ContactSection />
        </div>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}