'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';
// File: components/site/SaasSite.tsx

import React from "react";
import { useRouter } from "next/navigation";
// Assuming useStoreContext might still be used elsewhere, keeping it,
// but for the sake of this component, we'll define store data directly.
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

// Import all enhanced child components
import EnhancedHeroSection from "./components/EnhancedHeroSection";
import FeaturesSection from "./components/FeaturesSection"; // This is the FeaturesSection you updated, not EnhancedFeaturesSection
import EnhancedPricingSection from "./components/EnhancedPricingSection";
import EnhancedTestimonialsSection from "./components/EnhancedTestimonialsSection";
import EnhancedFAQsSection from "./components/EnhancedFAQsSection";

// Import Heroicons for features data
import {
  ChartBarIcon,
  UsersIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

// --- Enriched and Accurate Sample Data for the Store ---
const siteStoreData = {
  name: "AscendFlow",
  slug: "ascendflow",
  description: "Propel your business forward with intelligent automation and collaborative insights.",
  tagline: "Unleash Your Team's Potential with AI-Powered Workflow Optimization.",
  bannerUrl: "/images/saas-hero-bg.jpg", // Ensure this path is correct in your /public folder
  logoUrl: "/images/ascendflow-logo.svg", // Example logo for hero
  ctaText: "Start Your Free Trial",
  stats: [ // Example stats for Hero section
    { value: "10K+", label: "Happy Customers" },
    { value: "99.9%", label: "Uptime Reliability" },
    { value: "2X", label: "Productivity Boost" },
  ],

  features: [
    {
      title: "Intuitive Dashboard & Analytics",
      description: "Gain actionable insights with our easy-to-use, customizable dashboards. Track key metrics and make data-driven decisions effortlessly.",
      image: "/images/feature-dashboard.png", // Replace with your dashboard screenshot
      alt: "Intuitive Dashboard Screenshot",
      icon: ChartBarIcon,
    },
    {
      title: "Seamless Team Collaboration",
      description: "Facilitate efficient teamwork with real-time collaboration tools, shared workspaces, and integrated communication features.",
      image: "/images/feature-collaboration.png", // Replace with your collaboration screenshot
      alt: "Team Collaboration Interface",
      icon: UsersIcon,
    },
    {
      title: "Powerful Integrations & API",
      description: "Connect with your favorite tools and extend functionality with our robust API, ensuring your workflow is always streamlined.",
      image: "/images/feature-integrations.png", // Replace with your integrations screenshot
      alt: "Integrations Screen",
      icon: PuzzlePieceIcon,
    },
    {
      title: "Blazing Fast Performance",
      description: "Experience lightning-fast load times and smooth operations, powered by optimized infrastructure.",
      icon: RocketLaunchIcon, // No image for these, they go in the grid
    },
    {
      title: "Enterprise-Grade Security",
      description: "Your data is protected with advanced encryption and compliance standards, ensuring peace of mind.",
      icon: ShieldCheckIcon,
    },
    {
      title: "Scalable for Any Size",
      description: "Designed to grow with your business, our platform effortlessly handles increasing demands.",
      icon: CloudArrowUpIcon,
    },
    {
      title: "Customizable Workflows",
      description: "Tailor the platform to fit your unique business processes with flexible customization options.",
      icon: AdjustmentsHorizontalIcon,
    },
  ],

  plans: [
    {
      id: "starter",
      name: "Starter",
      tagline: "Perfect for individuals and small teams to get started.",
      price: "$29",
      perks: [
        "5 Users",
        "10 GB Storage",
        "Basic Analytics",
        "Email Support",
        "Standard Features Access",
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "Ideal for growing businesses and advanced teams needing more.",
      price: "$99",
      perks: [
        "Unlimited Users",
        "100 GB Storage",
        "Advanced Analytics",
        "Priority Email & Chat Support",
        "All Core Features",
        "Custom Integrations (Limited)",
      ],
      popular: true, // This plan will be highlighted
    },
    {
      id: "business",
      name: "Business",
      tagline: "For large enterprises needing robust and scalable solutions.",
      price: "$249",
      perks: [
        "Unlimited Users & Teams",
        "Unlimited Storage",
        "Premium Analytics & Reporting",
        "Dedicated Account Manager",
        "All Pro Features",
        "Advanced Security & Compliance",
        "SLA Support",
      ],
      popular: false,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tagline: "Tailored solutions built specifically for unique enterprise needs.",
      price: "Custom",
      perks: [
        "Custom User Management",
        "Bespoke Integrations",
        "On-Premise Deployment Options",
        "24/7 Premium Support",
        "Dedicated Infrastructure",
        "Strategic Partnership",
      ],
      popular: false,
      contact: true, // Mark this plan as requiring contact
    },
  ],

  testimonials: [
    {
      quote: "AscendFlow transformed our workflow! Its intuitive design and powerful automation capabilities have significantly boosted our team's productivity.",
      author: "Alex P.",
      role: "CEO",
      company: "Innovate Solutions",
      avatarUrl: "/images/avatar-alex.jpg", // Replace with actual avatar URL
      rating: 5,
    },
    {
      quote: "The collaboration features are a game-changer. We can now manage complex projects with unparalleled efficiency. Truly incredible!",
      author: "Jamie L.",
      role: "Project Lead",
      company: "Creative Minds Co.",
      avatarUrl: "/images/avatar-jamie.jpg", // Replace with actual avatar URL
      rating: 5,
    },
    {
      quote: "Outstanding support and an incredibly robust platform. AscendFlow has become indispensable for our daily operations and growth.",
      author: "Sarah M.",
      role: "Operations Director",
      company: "Global Logistics Inc.",
      avatarUrl: "/images/avatar-sarah-m.jpg", // Replace with actual avatar URL
      rating: 4,
    },
    {
      quote: "The analytics dashboard provides insights we never had before. It's made data-driven decisions so much easier.",
      author: "David K.",
      role: "Data Strategist",
      company: "Quantify Partners",
      avatarUrl: "/images/avatar-david-k.jpg", // Replace with actual avatar URL
      rating: 5,
    },
    {
      quote: "Seamless integration and an intuitive interface. It fits perfectly into our existing tech stack and has improved our overall efficiency.",
      author: "Emily C.",
      role: "Product Manager",
      company: "Nexus Tech",
      avatarUrl: "/images/avatar-emily-c.jpg", // Replace with actual avatar URL
      rating: 4,
    },
  ],

  faqs: [
    {
      question: "What exactly is AscendFlow and who is it for?",
      answer: "AscendFlow is a cutting-edge SaaS platform designed to optimize workflows, enhance team collaboration, and provide deep analytics. It's ideal for businesses of all sizes—from ambitious startups to large enterprises—looking to improve efficiency and make data-driven decisions.",
    },
    {
      question: "How difficult is it to set up and integrate with existing tools?",
      answer: "We've engineered AscendFlow for quick and easy onboarding. Most users can get up and running in under 15 minutes. Our robust API and extensive library of pre-built integrations ensure a seamless connection with your current tech stack. Comprehensive guides and a dedicated support team are always available to assist.",
    },
    {
      question: "What kind of support can I expect?",
      answer: "We pride ourselves on exceptional customer support. All plans include access to our extensive knowledge base and email support. Higher tiers offer priority live chat, dedicated account managers, and tailored onboarding sessions to ensure your success.",
    },
    {
      question: "Is my data secure with AscendFlow?",
      answer: "Your data security is our paramount concern. AscendFlow employs state-of-the-art encryption protocols, regular security audits, and strict compliance with global data protection standards like GDPR and SOC 2 Type II. We ensure your information is always protected and private.",
    },
    {
      question: "Can I try AscendFlow before committing to a plan?",
      answer: "Absolutely! We offer a generous 14-day free trial that provides full access to our core features. This allows you to explore AscendFlow's capabilities and see how it fits your operational needs without any credit card commitment.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, including Visa, MasterCard, American Express, and Discover. For annual subscriptions or large enterprise plans, we also facilitate invoicing and direct bank transfers for your convenience.",
    },
  ],
};

// Custom image loader (kept for consistency)
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

export default function SaaSSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const router = useRouter();
  // Using useStoreContext for global theme settings only
  const { storeFormData } = useStoreContext();
  
  // Use pageData or fallback to siteStoreData
  const siteData = pageData || siteStoreData;

  const handleSignup = (planId?: string) => {
    // Modify this if your signup page handles specific plan IDs
    if (planId && planId !== "enterprise") {
      router.push(`/${siteData.slug}/signup?plan=${planId}`);
    } else if (planId === "enterprise") {
      router.push(`/${siteData.slug}/contact`); // Direct to contact for enterprise
    } else {
      router.push(`/${siteData.slug}/signup`);
    }
  };

  
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <EnhancedHeroSection
        store={siteStoreData}
        loader={loader}
        handleSignup={handleSignup}
      />
    ),
    'enhanced-hero': (
      <EnhancedHeroSection
        store={siteStoreData}
        loader={loader}
        handleSignup={handleSignup}
      />
    ),
    'saas-enhancedherosection': (
      <EnhancedHeroSection
        store={siteStoreData}
        loader={loader}
        handleSignup={handleSignup}
      />
    ),
    'features': <FeaturesSection features={siteStoreData.features} />,
    'saas-featuressection': <FeaturesSection features={siteStoreData.features} />,
    'enhanced-pricing': (
      <EnhancedPricingSection
        plans={siteStoreData.plans}
        handleSignup={handleSignup}
      />
    ),
    'enhanced-testimonials': <EnhancedTestimonialsSection testimonials={siteStoreData.testimonials} />,
    'enhanced-faqs': <EnhancedFAQsSection faqs={siteStoreData.faqs} />,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="EnhancedHeroSection">
        <EnhancedHeroSection
          store={siteStoreData}
          loader={loader}
          handleSignup={handleSignup}
        />
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection features={siteStoreData.features} />
      </div>
      <div id="section-enhanced-pricing" data-editor-section="enhanced-pricing" data-editor-component="EnhancedPricingSection">
        <EnhancedPricingSection
          plans={siteStoreData.plans}
          handleSignup={handleSignup}
        />
      </div>
      <div id="section-enhanced-testimonials" data-editor-section="enhanced-testimonials" data-editor-component="EnhancedTestimonialsSection">
        <EnhancedTestimonialsSection testimonials={siteStoreData.testimonials} />
      </div>
      <div id="section-enhanced-faqs" data-editor-section="enhanced-faqs" data-editor-component="EnhancedFAQsSection">
        <EnhancedFAQsSection faqs={siteStoreData.faqs} />
      </div>
    </>
  );

  return (
    <div className="space-y-28 font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
