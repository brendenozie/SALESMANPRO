"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  name?: string; // For organization name in subtitle
  slug?: string; // For constructing dynamic links
  ctaSection?: { // Assuming a dedicated CTA section data
    title?: string;
    subtitle?: string;
    buttonLabel?: string;
    buttonHref?: string;
  };
  themeSettings?: ThemeSettings;
  // Add other relevant StoreForm fields if needed for this section
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     name: 'Children\'s Hope Foundation',
//     slug: 'childrens-hope-foundation',
//     ctaSection: {
//       title: 'Ready to Make a Lasting Impact?',
//       subtitle: 'Your support helps us build a future filled with hope and opportunities for children and communities worldwide.',
//       buttonLabel: 'Join Us Today',
//       buttonHref: '/volunteer', // Example link for joining/volunteering
//     },
//     themeSettings: {
//       primaryColor: "#FF5722", // Orange for primary actions
//       secondaryColor: "#FFFFFF", // White for secondary actions/text
//     },
//   } as StoreForm,
// });

export default function CtaBoldSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722'; // Default Orange
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#FFFFFF'; // Default White

  // Dynamic content with fallbacks
  const ctaTitle = 'Ready to Make a Lasting Impact?'; //storeFormData?.ctaSection?.title || 
  const ctaSubtitle = `Your support helps us build a future filled with hope and opportunities for children and communities worldwide.`; //storeFormData?.ctaSection?.subtitle || 
  const ctaButtonLabel = 'Join Us Today';//storeFormData?.ctaSection?.buttonLabel || 
  const ctaButtonHref = `/${storeFormData?.slug || 'non-profit'}/join`;//storeFormData?.ctaSection?.buttonHref || 

  return (
    <section
      id='contact'
      className="py-20"
      style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}E0)` }} // Dynamic primary color gradient
    >
      <div className="max-w-4xl mx-auto text-center text-white px-6">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight drop-shadow-lg"
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {ctaTitle}
        </motion.h2>
        <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
          {ctaSubtitle}
        </p>
        <Link
          href={ctaButtonHref}
          className="inline-flex items-center px-10 py-4 rounded-full font-bold text-lg shadow-xl transform hover:scale-105 transition duration-300"
          style={{ backgroundColor: secondaryColor, color: primaryColor }} // Inverted colors for CTA button
        >
          {ctaButtonLabel} <ArrowRightIcon className="w-6 h-6 ml-3" />
        </Link>
      </div>
    </section>
  );
}
