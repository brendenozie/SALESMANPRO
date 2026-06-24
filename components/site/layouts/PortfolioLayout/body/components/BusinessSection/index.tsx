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
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 16,
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
  
  const primaryColor = themeSettings?.primaryColor || '#000000';
  const effectiveStoreCategory = Array.isArray(StoreCategory) && StoreCategory.length > 0 ? StoreCategory : mockStoreCategories;

  // --- Core Logic Display Parser ---
  const hasCategories = Array.isArray(effectiveStoreCategory) && effectiveStoreCategory.length > 0;
  let offeringsToShow: Offering[] = [];

  if (hasCategories && effectiveStoreCategory.length < 3) {
    const allSubcategories = effectiveStoreCategory.flatMap(cat => cat.subcategories || []);
    const limitedSubcategories = allSubcategories.slice(0, 6);
    offeringsToShow = limitedSubcategories.map((subcat, index) => ({
      title: subcat.name || 'Service',
      desc: `Explore our specialized ${subcat.name} solutions for deep expertise.`,
      id: subcat.id,
      iconComponent: iconList[index % iconList.length], 
    }));
  } else if (hasCategories) {
    offeringsToShow = (effectiveStoreCategory as IStoreCategory[]).map((cat, index) => ({
      title: cat.displayName || 'Service',
      desc: `Explore our specialized ${cat.displayName} solutions.`, 
      id: cat.id,
      iconComponent: iconList[index % iconList.length], 
    }));
  } else {
    offeringsToShow = defaultCoachingSolutions;
  }

  return (
    <AnimatePresence>
      <section 
        id="services-grid" 
        className="relative py-24 lg:py-32 px-6 lg:px-8 bg-white text-slate-900 overflow-hidden border-b border-slate-100"
      >
        {/* Minimal Wire Grid Background Sync */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header Segment Node */}
          <motion.div
            className="text-center mb-20 flex flex-col items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Minimal Inline Badge Tagline */}
            <motion.div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 mb-5"
              variants={itemVariants}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                {offeringsToShow.length > 0 ? 'Ignite Your Growth' : 'Focused Expertise'}
              </p>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-[1.15]"
              variants={itemVariants}
            >
              The Catalyst for <span style={{ color: primaryColor }}>{name || 'Innovation'}</span>
            </motion.h2>

            {/* Sub-description */}
            <motion.p
              className="mt-6 text-slate-500 max-w-2xl text-lg font-normal leading-relaxed"
              variants={itemVariants}
            >
              {description || 'We deliver specialized solutions designed to dismantle bottlenecks, clarify strategy, and accelerate your path to market leadership.'}
            </motion.p>
          </motion.div>

          {/* Grid of Minimalist Structural Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {offeringsToShow.slice(0, 6).map((offer, idx) => {
              const Icon = offer.iconComponent;
              const delay = idx * 0.04; 
              
              return (
                <motion.a
                  href="#contact"
                  key={offer.id || idx}
                  className="block h-full group"
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { 
                      opacity: 1, y: 0,
                      transition: {
                        ...itemVariants.visible.transition,
                        delay: delay,
                      }
                    },
                  }}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="p-8 h-full rounded-2xl bg-white border border-slate-200 transition-all duration-200 hover:border-slate-900 hover:shadow-xl flex flex-col justify-between items-start relative">
                    
                    <div className="w-full">
                      {/* Crisp Monochromatic Structural Icon Cage */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-slate-50 border border-slate-200 transition-colors duration-200 group-hover:bg-slate-900 group-hover:border-slate-900">
                        <Icon className="w-5 h-5 text-slate-800 transition-colors duration-200 group-hover:text-white" strokeWidth={2} />
                      </div>

                      {/* Card Title */}
                      <h3 className="text-xl font-bold mb-3 text-slate-900 tracking-tight leading-snug">
                        {offer.title}
                      </h3>

                      {/* Card Description */}
                      <p className="text-sm text-slate-500 leading-relaxed mb-8 font-normal">
                        {offer.desc}
                      </p>
                    </div>

                    {/* Integrated Micro-Action Line */}
                    <span
                      className="inline-flex items-center gap-2 text-sm font-bold transition-colors duration-200"
                      style={{ color: primaryColor }}
                    >
                      {offer.id ? 'Start Exploration' : 'Begin Consultation'}
                      <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
          
          {/* Main Structural CTA Frame */}
          <motion.div
            className="mt-16 text-center"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
             <a
                href="#services"
                className="inline-flex items-center gap-2.5 text-base font-bold px-10 py-5 rounded-xl transition-all duration-200 active:scale-98 shadow-sm border-2"
                style={{ 
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                    color: '#ffffff'
                }}
            >
                <SparklesIcon className="w-4 h-4" />
                View All Solutions and Plans
            </a>
          </motion.div>

        </div>
      </section>
    </AnimatePresence>
  );
}