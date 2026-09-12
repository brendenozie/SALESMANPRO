'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LightBulbIcon, SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { EditableElement } from '@/contexts/EditableContentContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 85}`;

export default function GetStartedSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-56 bg-slate-50 dark:bg-slate-950 -mb-24 relative z-10 border-t border-b border-slate-200 dark:border-slate-800">
        <p className="text-slate-400 dark:text-slate-500 text-sm font-black uppercase tracking-widest animate-pulse">
          Crafting your perfect welcome...
        </p>
      </div>
    );
  }

  const { slug, themeSettings, bannerUrl } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || '#0d9488'; // Teal-600 fallback
  const secondaryColor = themeSettings?.secondaryColor || '#f97316'; // Orange-500 fallback

  // Structural reveal animation blocks
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const structuralVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const elementVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <section className="relative z-25 -mb-24 lg:-mb-32 bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, amount: 0.2 }}
          className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[500px]"
        >
          {/* Decorative Minimal Line Network (Grid Structure Accents instead of gradients) */}
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <div className="absolute top-0 bottom-0 left-[8%] border-l border-slate-100 dark:border-slate-800/40" />
            <div className="absolute top-0 bottom-0 left-[55%] border-l border-slate-100 dark:border-slate-800/40" />
          </div>

          {/* LEFT SECTION: HIGH CONTRAST TYPOGRAPHY & VALUE LAYERS */}
          <div className="relative z-10 lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-between items-start">
            
            <div className="w-full">
              {/* Context Tagline */}
              <motion.div 
                variants={elementVariants}
                className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                <EditableElement
                  targetId="services.home.getStartedSection.GetStartedSection.main.badgeText"
                  componentKey="GetStartedSection"
                  elementKey="badgeText"
                  label="Badge Text"
                  defaultValue="Exclusive Invitation"
                  inline
                >
                  {(val) => (
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                      {val}
                    </span>
                  )}
                </EditableElement>
              </motion.div>

              {/* Clean Stark Typography Heading */}
              <EditableElement
                targetId="services.home.getStartedSection.GetStartedSection.main.title"
                componentKey="GetStartedSection"
                elementKey="title"
                label="Heading"
                defaultValue="Ready for a Sparkling New Beginning?"
              >
                {(val) => {
                  const t = typeof val === "string" ? val : "Ready for a Sparkling New Beginning?";
                  return (
                    <motion.h2 
                      variants={structuralVariants}
                      className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-6"
                    >
                      {t}
                    </motion.h2>
                  );
                }}
              </EditableElement>

              {/* Descriptive Paragraph Block */}
              <EditableElement
                targetId="services.home.getStartedSection.GetStartedSection.main.subtitle"
                componentKey="GetStartedSection"
                elementKey="subtitle"
                label="Subtitle"
                defaultValue="Unlock the comfort and confidence of a professionally cleaned environment. Our seamless digital process makes mapping out your service simple and execution flawless."
              >
                {(val) => (
                  <motion.p 
                    variants={elementVariants}
                    className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl font-medium leading-relaxed"
                  >
                    {val}
                  </motion.p>
                )}
              </EditableElement>

              {/* Solid High-Contrast Feature List */}
              <motion.div variants={elementVariants} className="mb-10 max-w-md">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-slate-700 dark:text-slate-200 font-bold text-base sm:text-lg">
                    <div className="mt-1 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <LightBulbIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    </div>
                    <span>Transparent Pricing, No Surprises.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-700 dark:text-slate-200 font-bold text-base sm:text-lg">
                    <div className="mt-1 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <SparklesIcon className="w-3.5 h-3.5" style={{ color: secondaryColor }} />
                    </div>
                    <span>Expert Cleaners, Impeccable Results.</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Premium Button Container */}
            <motion.div variants={elementVariants} className="w-full sm:w-auto">
              <Link href="#booking" passHref legacyBehavior>
                <motion.a
                  className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white shadow-sm transition-all duration-300 ease-out gap-3 group relative overflow-hidden cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                  whileTap={{ scale: 0.98 }}
                >
                  <EditableElement
                    targetId="services.home.getStartedSection.GetStartedSection.main.buttonText"
                    componentKey="GetStartedSection"
                    elementKey="buttonText"
                    label="Button Text"
                    defaultValue="Get Your Free Quote"
                    inline
                  >
                    {(val) => (
                      <span className="relative z-10">{val}</span>
                    )}
                  </EditableElement>
                  <ChevronRightIcon className="w-4 h-4 relative z-10 transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300 ease-out" />
                  
                  {/* Subtle clean absolute layer swap on hover instead of heavy shadows */}
                  <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
                </motion.a>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT SECTION: PREMIUM ASYMMETRIC PICTURE FIELD */}
          <div className="relative lg:col-span-5 min-h-[320px] lg:min-h-full bg-slate-50 dark:bg-slate-950/40 p-6 lg:p-8 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
            
            {/* Structural Geometric Backdrops */}
            <div className="absolute top-12 bottom-12 left-12 right-12 border border-dashed border-slate-300 dark:border-slate-800 pointer-events-none hidden lg:block rounded-xl" />
            
            <motion.div 
              variants={structuralVariants}
              className="relative w-full h-full min-h-[280px] lg:h-[88%] lg:w-[95%] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 group"
            >
              <Image
                loader={loader}
                src={bannerUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'}
                alt="Aspirational representation of clear organized results"
                fill
                className="object-cover grayscale contrast-[1.05] group-hover:grayscale-0 transition-all duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
              
              {/* Minimal geometric corner badge over the image */}
              <div className="absolute bottom-4 right-4 bg-slate-900 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-md border border-slate-800 shadow-md">
                Verified Standard
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}