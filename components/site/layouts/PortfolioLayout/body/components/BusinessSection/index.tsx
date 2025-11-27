'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BoltIcon,
  LightBulbIcon,
  UsersIcon,
  SparklesIcon,
  // Imported Icons for Mock Data Mapping
  GlobeAltIcon,
  HeartIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { IStoreCategory } from '@/types/typings';


// Mock data structure matching IStoreCategory for the fallback logic
const mockStoreCategories: any[] = [
    { id: '1', displayName: 'Digital Strategy', description: 'Crafting future-proof plans for digital dominance.', subcategories: [{
      id: '1a', name: 'SEO', slug: 'seo-slug'
    }, {
      id: '1b', name: 'Content Marketing', slug: 'content-slug'
    }] },
    { id: '2', displayName: 'Product Development', description: 'Building scalable, user-centric software solutions.', subcategories: [{
      id: '2a', name: 'Frontend', slug: 'frontend-slug'
    }, {
      id: '2b', name: 'Backend', slug: 'backend-slug'
    }] },
    { id: '3', displayName: 'Business Consulting', description: 'Expert guidance to optimize operations and growth.', subcategories: [{
      id: '3a', name: 'Finance', slug: 'finance-slug'
    }, {
      id: '3b', name: 'HR', slug: 'hr-slug'
    }] },
    { id: '4', displayName: 'Marketing Automation', description: 'Streamlining customer engagement through smart tools.', subcategories: [{
      id: '4a', name: 'Email Flows', slug: 'email-slug'
    }] },
];

// List of icons to cycle through for offerings
const iconList: React.ElementType[] = [
  ChartBarIcon,
  CpuChipIcon,
  BriefcaseIcon,
  BoltIcon,
  GlobeAltIcon,
  SparklesIcon,
  AcademicCapIcon,
  UsersIcon,
  HeartIcon,
];

type Offering = {
  title: string;
  desc: string;
  id?: string;
  iconComponent: React.ElementType;
};

// Fallback data for a standalone preview
const defaultCoachingSolutions: Offering[] = [
  { title: 'Data Analytics', desc: 'Transform raw data into actionable insights for strategic decision-making.', id: 'mock-1', iconComponent: ChartBarIcon },
  { title: 'Cloud Integration', desc: 'Seamless migration and management of applications in the cloud.', id: 'mock-2', iconComponent: CpuChipIcon },
  { title: 'UX/UI Design', desc: 'Creating intuitive and beautiful interfaces that delight your users.', id: 'mock-3', iconComponent: LightBulbIcon },
  { title: 'Security Audits', desc: 'Identifying and mitigating vulnerabilities to protect your digital assets.', id: 'mock-4', iconComponent: BoltIcon },
  { title: 'Team Scaling', desc: 'Strategies for rapidly growing your engineering and product teams.', id: 'mock-5', iconComponent: UsersIcon },
  { title: 'Process Optimization', desc: 'Refining internal workflows for maximum efficiency and reduced cost.', id: 'mock-6', iconComponent: BriefcaseIcon },
];

// --- FRAMER MOTION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Slightly faster stagger
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 90,
      damping: 14,
    },
  },
};

// --- COMPONENT INTERFACE ---
interface BusinessSectionProps {
    name: string | undefined | null;
    slug: string | undefined | null;
    description: string | undefined | null;
    themeSettings: {
      primaryColor?: string;
      secondaryColor?: string;
    } | undefined | null;
    StoreCategory: IStoreCategory[] | undefined | null;
}

// --- MAIN COMPONENT ---
export default function ServicesSection({name, slug, description, themeSettings, StoreCategory}: BusinessSectionProps) {
  
  // Resolve colors and ensure fallbacks are used
  const primaryColor = themeSettings?.primaryColor || '#10B981'; // Tailwind emerald 500
  const secondaryColor = themeSettings?.secondaryColor || '#059669'; // Tailwind emerald 600

  const effectiveStoreCategory = Array.isArray(StoreCategory) && StoreCategory.length > 0 ? StoreCategory : mockStoreCategories;

  // --- Core Logic Update: Decide what to display (Categories or Subcategories) ---
  const hasCategories = Array.isArray(effectiveStoreCategory) && effectiveStoreCategory.length > 0;
  let offeringsToShow: Offering[] = [];

  if (hasCategories && effectiveStoreCategory.length < 3) {
    // If fewer than 3 categories, flatten subcategories and take up to 6
    const allSubcategories = effectiveStoreCategory.flatMap(cat => cat.subcategories || []);
    const limitedSubcategories = allSubcategories.slice(0, 6);
    offeringsToShow = limitedSubcategories.map((subcat, index) => ({
      title: subcat.name || 'Service',
      desc: `Explore our specialized ${subcat.name} solutions for deep expertise.`,
      id: subcat.id,
      iconComponent: iconList[index % iconList.length], 
    }));
  } else if (hasCategories) {
    // If 3 or more categories, display the categories themselves
    offeringsToShow = (effectiveStoreCategory as IStoreCategory[]).map((cat, index) => ({
      title: cat.displayName || 'Service',
      desc: `Explore our specialized ${cat.displayName} solutions.`, 
      id: cat.id,
      iconComponent: iconList[index % iconList.length], 
    }));
  } else {
    // Fallback if no categories exist (using hardcoded mocks)
    offeringsToShow = defaultCoachingSolutions;
  }
  // --- End of Core Logic Update ---

  return (
    <AnimatePresence>
      <section 
        id="services-grid" 
        // Light Mode: Soft white background
        className="relative py-24 md:py-32 px-6 lg:px-12 bg-gray-50 text-gray-900 overflow-hidden"
      >
        {/* Abstract Particle/Grid Background Effect - Softened for light mode */}
        <div
          className="absolute inset-0 z-0 opacity-10 pointer-events-none transition-opacity duration-500"
          style={{
            // Creating a subtle light background with barely visible color whispers
            background: `radial-gradient(circle at 5% 15%, ${primaryColor}10, transparent 40%), radial-gradient(circle at 95% 85%, ${secondaryColor}10, transparent 50%)`,
          }}
        />

        {/* Content Container */}
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Tagline */}
            <motion.p
                className="text-md md:text-lg font-bold uppercase tracking-widest mb-3"
                style={{ color: primaryColor }} // Primary color still pops
                variants={itemVariants}
            >
                {offeringsToShow.length > 0 ? 'Ignite Your Growth' : 'Focused Expertise'}
            </motion.p>
            
            {/* Main Headline */}
            <motion.h2
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-4 drop-shadow-md"
              variants={itemVariants}
            >
              The Catalyst for <span style={{ color: primaryColor }}>{name || 'Innovation'}</span>
            </motion.h2>

            {/* Sub-description */}
            <motion.p
              className="mt-6 text-gray-600 max-w-4xl mx-auto text-xl md:text-2xl leading-relaxed"
              variants={itemVariants}
            >
              {description || 'We deliver specialized solutions designed to dismantle bottlenecks, clarify strategy, and accelerate your path to market leadership.'}
            </motion.p>
          </motion.div>

          {/* Grid of Captivating Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {offeringsToShow.slice(0, 6).map((offer, idx) => {
              const Icon = offer.iconComponent;
              const delay = idx * 0.08; 
              
              return (
                <motion.a
                  // href={offer.id ? `/portfolio/category/${offer.id}` : `/${slug || 'store'}/contact`}
                  href={"#contact"}
                  key={offer.id || idx}
                  className="block"
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { 
                      opacity: 1, y: 0,
                      transition: {
                        ...itemVariants.visible.transition,
                        delay: delay,
                      }
                    },
                  }}
                  // Enhanced Hover Effect: Deeper lift and pronounced glow/shadow
                  whileHover={{ y: -10, scale: 1.03, boxShadow: `0 20px 40px -5px ${primaryColor}40` }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="p-8 h-full rounded-2xl cursor-pointer group shadow-xl transform transition-all duration-300 ease-in-out border border-gray-200 hover:border-transparent relative overflow-hidden bg-white"
                    style={{
                        // Light Mode Shadow: Soft background shadow
                        boxShadow: `0 8px 30px -10px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.05)`,
                    }}
                  >
                    
                    {/* Icon Container with Gradient Border */}
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-xl transform transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:rotate-1 relative p-0.5"
                      style={{ 
                        // Using a pseudo-element effect via inline style padding/margin trick for a gradient glow
                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      }}
                    >
                      {/* Inner circle is now white */}
                      <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                        {/* Icon color is primary color, maintaining drop shadow effect */}
                        <Icon className="w-8 h-8" style={{ color: primaryColor, filter: `drop-shadow(0 0 3px ${primaryColor}40)` }}/>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 leading-snug transition-colors duration-300 group-hover:text-gray-700">
                      {offer.title}
                    </h3>

                    {/* Description */}
                    <p className="text-base text-gray-500 leading-relaxed mb-6">
                      {offer.desc}
                    </p>

                    {/* CTA Link Text */}
                    <span
                        className="inline-flex items-center gap-2 text-base font-semibold transition-all duration-300 ease-in-out group-hover:gap-3"
                        style={{ color: primaryColor }}
                    >
                      {offer.id ? 'Start Exploration' : 'Begin Consultation'}
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>

                    {/* Floating Accent (Behind text, subtle effect) */}
                    <div className="absolute top-0 right-0 w-2/3 h-2/3 opacity-5 pointer-events-none transition-opacity duration-500 group-hover:opacity-10"
                         style={{ background: `radial-gradient(circle, ${primaryColor}, transparent 70%)` }}/>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
          
          {/* Main CTA Below Grid (Highly Visible) */}
          <motion.div
            className="mt-20 text-center"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
             <a
                href={`#services`}
                className="inline-flex items-center gap-3 text-xl font-extrabold px-12 py-5 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-[1.05] relative overflow-hidden"
                style={{ 
                    // Maintain primary gradient background for the CTA
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    color: '#fff', 
                    boxShadow: `0 15px 45px -10px ${primaryColor}70`,
                }}
            >
                <SparklesIcon className="w-7 h-7 animate-pulse" />
                View All Solutions and Plans
            </a>
          </motion.div>

        </div>
      </section>
    </AnimatePresence>
  );
}