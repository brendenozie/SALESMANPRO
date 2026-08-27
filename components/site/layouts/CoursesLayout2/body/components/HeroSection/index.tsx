"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  PlayIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from "@heroicons/react/24/solid"; // Heroicons as requested
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function ProfessionalHero({storeFormData}: { storeFormData: any }) {
  // const { storeFormData } = useStoreContext();

  const activeHeroSlide = storeFormData?.heroSlides?.[0];
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';

  return (
    <section className="relative min-h-[85vh] flex items-center bg-white overflow-hidden pt-20">
      {/* Structural Background Layout */}
      <div className="absolute inset-0 z-0 flex">
        <div className="w-full lg:w-1/2 bg-gray-50" /> {/* Subtle split background */}
        <div className="hidden lg:block w-1/2 relative">
           <Image
            src={activeHeroSlide?.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"}
            alt="Professional Environment"
            fill
            className="object-cover"
            priority
            loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
          />
          {/* Professional Overlay: Clean gradient for text legibility if needed */}
          <div className="absolute inset-0 bg-gray-900/10" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Content Column */}
          <motion.div 
            className="lg:col-span-6 py-12"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {/* Status Badge */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
              <span 
                className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: primaryColor }} 
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">
                {storeFormData?.tagline || "Professional Excellence"}
              </span>
            </motion.div>

            {/* Corporate Typography */}
            <motion.h1 
              variants={fadeUp}
              className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-8"
            >
              {activeHeroSlide?.headline || "Drive Success Through Strategic Learning."}
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              className="text-lg text-gray-600 leading-relaxed max-w-lg mb-10 border-l-2 pl-6"
              style={{ borderColor: `${primaryColor}40` }}
            >
              {activeHeroSlide?.subline || "Empowering organizations and professionals with industry-validated curriculum and measurable learning outcomes."}
            </motion.p>

            {/* Action Group */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6">
              <button
                className="group flex items-center gap-3 px-8 py-4 rounded-none font-bold text-sm uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: primaryColor }}
                onClick={() => window.location.href = activeHeroSlide?.ctaLink || '#'}
              >
                {activeHeroSlide?.ctaText || "Explore Curriculum"}
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {activeHeroSlide?.videoLink && (
                <button 
                  className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-900 hover:text-gray-600 transition-colors"
                  onClick={() => window.open(activeHeroSlide?.videoLink || '', '_blank')}
                >
                  <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
                    <PlayIcon className="w-3 h-3 text-gray-900" />
                  </div>
                  Overview
                </button>
              )}
            </motion.div>

            {/* Trust Signals */}
            <motion.div 
              variants={fadeUp}
              className="mt-16 grid grid-cols-3 gap-4"
            >
              <div className="space-y-2">
                <CheckBadgeIcon className="w-5 h-5 text-gray-400" />
                <p className="text-[10px] font-black uppercase text-gray-400">Certified</p>
                <p className="text-sm font-bold text-gray-900">Accredited Programs</p>
              </div>
              <div className="space-y-2">
                <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                <p className="text-[10px] font-black uppercase text-gray-400">Security</p>
                <p className="text-sm font-bold text-gray-900">Safe Enrollment</p>
              </div>
              <div className="space-y-2">
                <ChartBarIcon className="w-5 h-5 text-gray-400" />
                <p className="text-[10px] font-black uppercase text-gray-400">Outcomes</p>
                <p className="text-sm font-bold text-gray-900">Career Growth</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: High-Impact Image Card (Mobile only, or inset for desktop) */}
          <div className="lg:col-span-6 lg:hidden">
            <div className="relative aspect-video rounded-none overflow-hidden shadow-2xl">
               <Image
                src={activeHeroSlide?.productImageUrl || activeHeroSlide?.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"}
                alt="Product"
                fill
                className="object-cover"
                loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}