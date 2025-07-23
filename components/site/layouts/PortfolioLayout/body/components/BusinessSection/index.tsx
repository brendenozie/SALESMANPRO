'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import {
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BoltIcon,
  LightBulbIcon,
  UsersIcon,
  SparklesIcon // Fallback for unspecified icons
} from '@heroicons/react/24/outline';

import { useStoreContext } from '@/contexts/StoreContext';
import { MarketListingForm, StoreForm, StoreCategoryEntry, StoreCategory } from '@/types/typings';

// Map offering titles to Heroicon components
const iconMap: Record<string, React.ElementType> = {
  'Business Coaching': BriefcaseIcon,
  'Executive Coaching': AcademicCapIcon,
  'Leadership Coaching': UsersIcon,
  'Accountability Coaching': BoltIcon,
  'Strategic Planning': ChartBarIcon,
  'Career Coaching': LightBulbIcon,
  // You can map more category or listing names here
};

type Offering = {
  title: string;
  desc: string;
  id?: string;
  iconComponent: React.ElementType;
};

export default function BusinessSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreForm };
  const {
    name,
    slug,
    description,
    themeSettings = {},
    storeCategories = [],
    marketplaceListings = [],
  } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#3b82f6'; // Tailwind blue-500
  const secondaryColor = themeSettings.secondaryColor || '#2563eb'; // Tailwind blue-600

  // Default sample offerings
  const defaultCoachingSolutions: Offering[] = [
    { title: 'Business Coaching', desc: 'Enhance your business performance with expert coaching.', iconComponent: BriefcaseIcon },
    { title: 'Executive Coaching', desc: 'Tailored sessions to elevate executive leadership.', iconComponent: AcademicCapIcon },
    { title: 'Leadership Coaching', desc: 'Boost team dynamics and leadership skills.', iconComponent: UsersIcon },
    { title: 'Accountability Coaching', desc: 'Set goals and track progress with accountability experts.', iconComponent: BoltIcon },
    { title: 'Strategic Planning', desc: 'Define visions and align growth strategies.', iconComponent: ChartBarIcon },
    { title: 'Career Coaching', desc: 'Gain clarity and control of your career path.', iconComponent: LightBulbIcon },
  ];

  // Determine which data source to use
  const hasCategories = Array.isArray(storeCategories) && storeCategories.length > 0;
  const hasListings = Array.isArray(marketplaceListings) && marketplaceListings.length > 0;

  const dynamicOfferings: Offering[] = hasCategories
    ? (storeCategories as StoreCategory[]).map(cat => ({
        title: cat.displayName || cat.displayName,
        desc: '',
        id: cat.id,
        iconComponent: iconMap[cat.displayName] || SparklesIcon,
      }))
    : hasListings
    ? (marketplaceListings as MarketListingForm[]).map(item => ({
        title: item.name || 'Service',
        desc: item.description || '',
        id: item.id,
        iconComponent: SparklesIcon,
      }))
    : defaultCoachingSolutions;

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <section id="services" className="relative py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 10% 20%, ${primaryColor}10, transparent 40%), radial-gradient(circle at 90% 80%, ${secondaryColor}10, transparent 40%)`,
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'url("/assets/dot-grid.svg")', backgroundSize: '20px 20px' }} />

      <motion.div
        className="max-w-7xl mx-auto text-center mb-16 relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 drop-shadow-sm"
          variants={itemVariants}
        >
          {name ? `Our Specialized ` : 'Our '}
          <span style={{ color: primaryColor }}>{name || 'Solutions'}</span>
        </motion.h2>
        {description && (
          <motion.p
            className="mt-4 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed"
            variants={itemVariants}
          >
            {description}
          </motion.p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {dynamicOfferings.map((offer, idx) => {
          const Icon = offer.iconComponent;
          return (
            <motion.div
              key={offer.id || idx}
              className="relative bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden group transform transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl"
              initial="hidden"
              whileInView="show"
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              viewport={{ once: true }}
              variants={itemVariants}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-xl group-hover:opacity-30 transition-opacity duration-300" style={{ backgroundColor: primaryColor }} />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10 blur-xl group-hover:opacity-30 transition-opacity duration-300" style={{ backgroundColor: secondaryColor }} />

              <div className="p-8 flex flex-col h-full">
                <div className="mb-6 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-bold p-3 shadow-md" style={{ backgroundColor: primaryColor }}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white leading-snug">{offer.title}</h3>
                <p className="text-base text-gray-600 dark:text-gray-300 flex-grow leading-relaxed">{offer.desc}</p>

                <div className="mt-8 flex-shrink-0">
                  <Link
                    href={offer.id ? `/${slug}/product/${offer.id}` : `/${slug}/contact`}
                    className="inline-flex items-center gap-2 text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-300 ease-in-out transform group-hover:scale-105 group-hover:shadow-lg"
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
      </div>
    </section>
  );
}
