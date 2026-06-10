'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  ArrowRightIcon,
  AcademicCapIcon, 
  UserGroupIcon, 
  GlobeAltIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';

interface HeroSlide {
  imageUrl?: string;
  subline?: string;
}

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
}

interface StoreFormData {
  heroSlides?: HeroSlide[];
  themeSettings?: ThemeSettings;
  tagline?: string;
}

interface PristineHeroProps {
  storeFormData?: StoreFormData | null;
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => 
  `${src}?w=${width}&q=${quality || 75}`;

export default function PristineHero({ storeFormData }: PristineHeroProps) {
  const activeHeroSlide = storeFormData?.heroSlides?.[0];
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#d4af37';
  const defaultBanner = "https://images.unsplash.com/photo-1523050335102-c62595487d15?q=80&w=2070&auto=format&fit=crop";

  // Framer Motion Stagger Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  return (
    <section className="relative min-h-screen w-full flex items-stretch overflow-hidden bg-slate-900 select-none">
      
      {/* 1. IMMERSIVE HERO CANVAS BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Image
          src={activeHeroSlide?.imageUrl || defaultBanner}
          alt="Academy Campus Environment"
          fill
          className="object-cover object-center transform scale-105 filter brightness-[0.75] md:brightness-100 transition-all duration-700"
          loader={customLoader}
          priority
          unoptimized
        />
        {/* Dynamic Vignette Protectors for High Contrast Layout Logic */}
        <div className="absolute inset-0 bg-slate-950/40 md:bg-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent z-10" />
      </div>

      {/* 2. PERSISTENT BORDER-CONTROL GLASS ARCHITECTURE */}
      <div className="relative z-20 w-full flex items-stretch">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full flex items-stretch">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full lg:max-w-2xl bg-slate-950/40 md:bg-white/80 dark:md:bg-slate-900/80 backdrop-blur-xl md:backdrop-blur-2xl border-y md:border-y-0 md:border-r border-white/10 md:border-white/30 dark:md:border-slate-800/50 p-6 sm:p-12 md:p-16 lg:p-20 flex flex-col justify-center pt-32 pb-24 md:pt-40 shadow-2xl transition-colors duration-300"
          >
            {/* Tagline Indicator Frame */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
              <span className="w-6 h-[2px] rounded-full" style={{ backgroundColor: secondaryColor }} />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 md:text-slate-500">
                {storeFormData?.tagline || "Nurturing Excellence Since 1994"}
              </span>
            </motion.div>

            {/* Editorial Header Block */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-extrabold text-white md:text-slate-900 dark:md:text-white leading-[1.15] mb-6 tracking-tight text-balance"
            >
              Where Ambition <br />
              <span className="italic relative inline-block mt-1">
                <span className="relative z-10" style={{ color: primaryColor }}>Meets Opportunity.</span>
              </span>
            </motion.h1>

            {/* Narrative Context Block */}
            <motion.p 
              variants={itemVariants}
              className="text-sm sm:text-base md:text-lg text-slate-300 md:text-slate-600 dark:md:text-slate-400 mb-8 sm:mb-10 leading-relaxed font-normal max-w-lg"
            >
              {activeHeroSlide?.subline || "A prestigious foundation for your child's future, combining traditional academic foundations with global technological innovation."}
            </motion.p>

            {/* Action Interactivity Suite */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
              <motion.button
                whileHover={{ scale: 1.02, translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-xl shadow-slate-950/20 transition-all text-center"
                style={{ backgroundColor: primaryColor }}
              >
                Book a Private Tour
              </motion.button>

              <button className="flex items-center justify-center gap-3 group px-4 py-3 rounded-xl hover:bg-slate-500/10 transition-colors duration-200">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                  <PlayIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-200 md:text-slate-700 dark:md:text-slate-300">
                  Explore Campus
                </span>
              </button>
            </motion.div>

            {/* Data-Driven Trust Architecture */}
            <motion.div 
              variants={itemVariants}
              className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 md:border-slate-200/60 dark:md:border-slate-800/60 grid grid-cols-3 gap-4 sm:gap-6"
            >
              {[
                { label: 'Licensed PhDs', value: '45', icon: AcademicCapIcon },
                { label: 'Global Awards', value: '12', icon: GlobeAltIcon },
                { label: 'Student Safety', value: '100%', icon: UserGroupIcon },
              ].map((stat, i) => (
                <div key={i} className="text-left group">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white md:text-slate-900 dark:md:text-white tracking-tight leading-none">
                      {stat.value}
                    </span>
                    <stat.icon className="w-3.5 h-3.5 opacity-40 invisible sm:inline-block" style={{ color: secondaryColor }} />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 md:text-slate-400 dark:md:text-slate-500 mt-2 line-clamp-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* 3. FLOATING AMBIENT SOCIAL VALIDATION DECK */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
        className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 z-40 hidden md:flex items-center gap-4 bg-slate-950/80 dark:bg-slate-900/90 backdrop-blur-xl p-2.5 pl-5 rounded-2xl border border-white/10 shadow-2xl"
      >
        {/* Safer fallback UI badges without relying on external image configuration domains */}
        <div className="flex -space-x-2.5 pr-2">
          {['E', 'M', 'T', 'K'].map((char, idx) => (
            <div 
              key={idx} 
              className="w-7 h-7 rounded-full border-2 border-slate-900 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md"
            >
              <span className="text-[9px] font-black text-slate-300 tracking-tighter">{char}</span>
            </div>
          ))}
        </div>
        <div className="pr-4 border-r border-white/10">
          <p className="text-[10px] font-extrabold text-white leading-none uppercase tracking-wider">
            Joined by 500+ Families
          </p>
          <span className="text-[8px] text-slate-400 tracking-normal block mt-1 font-medium">Community vetted</span>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-950/40" 
          style={{ backgroundColor: primaryColor }}
          aria-label="Advance to admissions matrix"
        >
          <ArrowRightIcon className="w-4 h-4" />
        </motion.button>
      </motion.div>

    </section>
  );
}