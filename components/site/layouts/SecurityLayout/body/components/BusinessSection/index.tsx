'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BoltIcon,
  LightBulbIcon,
  UsersIcon,
  CubeTransparentIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
// Assuming useStoreContext, IStoreCategory, ISubcategory are imported correctly

// Map category/service names to Heroicon components
const iconMap: Record<string, React.ElementType> = {
  'Business Coaching': BriefcaseIcon,
  'Executive Coaching': AcademicCapIcon,
  'Leadership Coaching': UsersIcon,
  'Accountability Coaching': BoltIcon,
  'Strategic Planning': ChartBarIcon,
  'Career Coaching': LightBulbIcon,
};

type Offering = {
  title: string;
  desc: string;
  id?: string;
  iconComponent: React.ElementType;
};

// Fallback data (Limit to 4-6 features for this stacked style)
const defaultCoachingSolutions: Offering[] = [
  { title: 'Business Coaching', desc: 'Enhance your business performance with expert coaching and actionable strategies designed for rapid growth and sustainable success.', iconComponent: BriefcaseIcon },
  { title: 'Executive Coaching', desc: 'Tailored sessions designed to elevate executive leadership, strategic foresight, and complex decision-making skills at the highest level.', iconComponent: AcademicCapIcon },
  { title: 'Leadership Coaching', desc: 'Boost team dynamics, communication, and overall leadership skills. Develop a culture of accountability and innovation within your organization.', iconComponent: UsersIcon },
  { title: 'Strategic Planning', desc: 'Define your vision, set clear, measurable objectives, and align your entire team for focused, sustainable long-term market growth.', iconComponent: ChartBarIcon },
];

// Framer Motion variants
const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const featureBlockVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 12,
      duration: 0.8,
    },
  },
};

interface BusinessSectionProps {
  name: string | undefined | null;
  slug: string | undefined | null;
  description: string | undefined | null;
  themeSettings: {
    primaryColor?: string;
    secondaryColor?: string;
  } | undefined | null;
  StoreCategory: any[];
}

// Helper to get icon
const getIcon = (title: string): React.ElementType => {
    const Icon = iconMap[title] || iconMap[title.split(' ')[0] as keyof typeof iconMap];
    return Icon || CubeTransparentIcon;
};


export default function ServicesSection({ name, slug, description, themeSettings, StoreCategory }: BusinessSectionProps) {
  
  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const secondaryColor = themeSettings?.secondaryColor || '#10B981';

  // --- Data Processing Logic (Kept concise) ---
  const hasCategories = Array.isArray(StoreCategory) && StoreCategory.length > 0;
  let offeringsToShow: Offering[] = [];

  if (hasCategories) {
      if (StoreCategory.length < 3) {
          const allSubcategories = StoreCategory.flatMap(cat => cat.subcategories || []).slice(0, 6);
          offeringsToShow = allSubcategories.map(subcat => ({
              title: subcat.name || 'Service',
              desc: subcat.description || `Explore our specialized ${subcat.name} solutions.`,
              id: subcat.id,
              iconComponent: getIcon(subcat.name || ''),
          }));
      } else {
          offeringsToShow = (StoreCategory as any[]).slice(0, 6).map(cat => ({
              title: cat.displayName || 'Service',
              desc: cat.description || `Explore our specialized ${cat.displayName} solutions.`,
              id: cat.id,
              iconComponent: getIcon(cat.displayName || ''),
          }));
      }
  } else {
    offeringsToShow = defaultCoachingSolutions;
  }
  // --- End of Data Processing Logic ---

  const sectionTitle = name ? `What We ${name}` : 'What We Offer';
  const subtitle = description || 'Our proven methodology is delivered through focused, tailored services designed to achieve measurable results.';
  
  const cssVars = {
    '--primary': primaryColor,
    '--secondary': secondaryColor,
  } as React.CSSProperties;

  return (
    <AnimatePresence>
      <section 
        id="services" 
        // LIGHT MODE: Clean white background
        className="relative py-24 md:py-32 px-6 lg:px-12 bg-white text-gray-900 overflow-hidden" 
        style={cssVars}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header */}
          <motion.div
            className="text-center mb-16 max-w-4xl mx-auto"
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <p 
              className="text-lg font-semibold uppercase tracking-widest mb-3" 
              style={{ color: primaryColor }}
            >
              Our Core Services
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
              {sectionTitle}
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              {subtitle}
            </p>
          </motion.div>

          {/* Feature Blocks Container */}
          <div className="space-y-24">
            {offeringsToShow.map((offer, idx) => {
              const Icon = offer.iconComponent;
              const isFlipped = idx % 2 !== 0; // Alternate the layout
              
              return (
                <motion.div
                  key={offer.id || idx}
                  className={`flex flex-col lg:flex-row items-center gap-12 ${isFlipped ? 'lg:flex-row-reverse' : ''}`}
                  variants={featureBlockVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  
                  {/* Visual Element (Icon/Number/Shape) */}
                  <div className={`w-full lg:w-1/3 relative p-8 ${isFlipped ? 'lg:p-0' : 'lg:p-0'}`}>
                    <div 
                      className={`relative aspect-square max-w-xs mx-auto flex items-center justify-center rounded-3xl transition-all duration-500 transform hover:scale-[1.03] shadow-2xl`}
                      style={{ 
                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        boxShadow: `0 10px 30px -5px ${primaryColor}50`,
                      }}
                    >
                        {/* Large Animated Icon */}
                        <motion.div
                            initial={{ scale: 0.8, rotate: -5 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
                        >
                            <Icon className="w-24 h-24 text-white p-2" />
                        </motion.div>
                        
                        {/* Subtle Index Number */}
                        <span className="absolute top-4 right-4 text-white/50 text-7xl font-extrabold opacity-5">
                            0{idx + 1}
                        </span>
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <div className="w-full lg:w-2/3 text-center lg:text-left">
                    <span 
                      className="text-sm font-semibold uppercase tracking-widest mb-2 inline-block"
                      style={{ color: primaryColor }}
                    >
                      Step {idx + 1}
                    </span>
                    <h3 className="text-4xl md:text-5xl font-bold mb-4 leading-snug">
                      {offer.title}
                    </h3>
                    <p className="text-xl text-gray-700 mb-8 max-w-2xl lg:max-w-full mx-auto">
                      {offer.desc}
                    </p>
                    
                    <Link
                      href={offer.id ? `/${slug}/product/${offer.id}` : `/${slug}/contact`}
                      className="inline-flex items-center gap-2 text-base font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-[1.05]"
                      style={{ color: primaryColor, border: `2px solid ${primaryColor}` }}
                    >
                      {offer.id ? 'Discover Full Details' : 'Book a Strategy Call'}
                      <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
        </div>
      </section>
    </AnimatePresence>
  );
}