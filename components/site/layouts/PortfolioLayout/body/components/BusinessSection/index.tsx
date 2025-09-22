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
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { StoreForm, IStoreCategory, ISubcategory } from '@/types/typings';

// Map category names to Heroicon components
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

// Fallback data for a standalone preview
const defaultCoachingSolutions: Offering[] = [
  { title: 'Business Coaching', desc: 'Enhance your business performance with expert coaching and actionable strategies.', iconComponent: BriefcaseIcon },
  { title: 'Executive Coaching', desc: 'Tailored sessions designed to elevate executive leadership and decision-making.', iconComponent: AcademicCapIcon },
  { title: 'Leadership Coaching', desc: 'Boost team dynamics, communication, and overall leadership skills for success.', iconComponent: UsersIcon },
  { title: 'Accountability Coaching', desc: 'Stay on track and achieve your goals with dedicated accountability experts.', iconComponent: BoltIcon },
  { title: 'Strategic Planning', desc: 'Define your vision, set clear objectives, and align your team for sustainable growth.', iconComponent: ChartBarIcon },
  { title: 'Career Coaching', desc: 'Gain clarity, overcome challenges, and take control of your professional path.', iconComponent: LightBulbIcon },
];

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function ServicesSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreForm };
  const {
    name,
    slug,
    description,
    themeSettings = {},
    StoreCategory = [],
  } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const secondaryColor = themeSettings?.secondaryColor || '#10B981';

  // --- Core Logic Update ---
  const hasCategories = Array.isArray(StoreCategory) && StoreCategory.length > 0;
  let offeringsToShow: Offering[] = [];

  if (hasCategories && StoreCategory.length < 3) {
    // If fewer than 3 categories, flatten subcategories and take up to 6
    const allSubcategories = StoreCategory.flatMap(cat => cat.subcategories || []);
    const limitedSubcategories = allSubcategories.slice(0, 6);
    offeringsToShow = limitedSubcategories.map(subcat => ({
      title: subcat.name || 'Service',
      desc: `Explore our specialized ${subcat.name} solutions.`,
      id: subcat.id,
      iconComponent: SparklesIcon, // No specific icon for subcategories, using a fallback
    }));
  } else if (hasCategories) {
    // If 3 or more categories, display the categories themselves
    offeringsToShow = (StoreCategory as IStoreCategory[]).map(cat => ({
      title: cat.displayName || 'Service',
      desc:`Explore our specialized ${cat.displayName} solutions.`, // cat.description || 
      id: cat.id,
      iconComponent:  SparklesIcon, //iconMap[cat.displayName] ||
    }));
  } else {
    // Fallback if no categories exist
    offeringsToShow = defaultCoachingSolutions;
  }
  // --- End of Core Logic Update ---

  return (
    <AnimatePresence>
      <section id="features" className="relative py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-950 overflow-hidden">
        {/* Dynamic Background Gradients */}
        <div
          className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 10% 20%, ${primaryColor}10, transparent 40%), radial-gradient(circle at 90% 80%, ${secondaryColor}10, transparent 40%)`,
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
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 drop-shadow-sm"
              variants={itemVariants}
            >
              Our Specialized{' '}
              <span style={{ color: primaryColor }}>
                {name || 'Solutions'}
              </span>
            </motion.h2>
            <motion.p
              className="mt-4 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed"
              variants={itemVariants}
            >
              {description || 'We offer a suite of tailored services designed to help you achieve your goals and unlock your full potential.'}
            </motion.p>
          </motion.div>

          {/* Grid of Cards, now with portfolio styling */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {offeringsToShow.map((offer, idx) => {
              const Icon = offer.iconComponent;
              return (
                <motion.div
                  key={offer.id || idx}
                  className="relative group bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl transform transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="p-6 md:p-8">
                    {/* Tag to match portfolio style */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className="px-3 py-1 text-sm font-medium rounded-full"
                        style={{
                          backgroundColor: `${primaryColor}10`,
                          color: primaryColor,
                        }}
                      >
                        Service
                      </span>
                    </div>

                    <div className="relative z-10">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg transform transition-all duration-300 ease-in-out group-hover:scale-110"
                        style={{ 
                          backgroundColor: primaryColor,
                          // background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
                        }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white leading-snug">
                        {offer.title}
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                        {offer.desc}
                      </p>
                      <Link
                        href={offer.id ? `/${slug}/product/${offer.id}` : `/${slug}/contact`}
                        className="inline-flex items-center gap-2 text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                        style={{ backgroundColor: primaryColor, color: '#fff' }}
                      >
                        {offer.id ? 'View Details' : 'Book Consultation'}
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}
