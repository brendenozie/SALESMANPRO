"use client";

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

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => 
  `${src}?w=${width}&q=${quality || 75}`;

export default function PristineHero({ storeFormData }: any) {
  const activeHeroSlide = storeFormData?.heroSlides?.[0];
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#d4af37';
  const defaultBanner = "https://images.unsplash.com/photo-1523050335102-c62595487d15?q=80&w=2070&auto=format&fit=crop";

  return (
    <section className="relative min-h-screen w-full flex items-stretch overflow-hidden bg-slate-100">
      
      {/* --- THE FULL BACKGROUND IMAGE --- */}
      <div className="absolute inset-0 z-0">
        <Image
          src={activeHeroSlide?.imageUrl || defaultBanner}
          alt="Academy Campus"
          fill
          className="object-cover"
          loader={customLoader}
          priority
        />
        {/* Soft "Professional" overlay */}
        <div className="absolute inset-0 bg-white/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent hidden md:block" />
      </div>

      {/* --- THE FULL-HEIGHT GLASS PANEL --- */}
      <div className="relative z-10 w-full flex items-stretch">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-stretch">
          
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            /* The 'min-h-screen' and 'pt-40' ensures it covers the full height 
               and starts below your floating header (top-6 + padding).
            */
            className="w-full md:max-w-2xl bg-white/70 backdrop-blur-2xl border-r border-white/40 p-12 md:p-20 flex flex-col justify-center pt-40 md:pt-48 shadow-2xl"
          >
            {/* Tagline with Gold Accent */}
            <div className="flex items-center gap-3 mb-8">
              {/* <span className="w-8 h-[2px]" style={{ backgroundColor: secondaryColor }} /> */}
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
                {storeFormData?.tagline || "Nurturing Excellence Since 1994"}
              </span>
            </div>

            {/* Academic Headline */}
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 leading-[1.1] mb-8">
              Where Ambition <br />
              <span style={{ color: primaryColor }}>Meets Opportunity.</span>
            </h1>

            <p className="text-lg text-slate-600 mb-10 leading-relaxed font-light max-w-lg">
              {activeHeroSlide?.subline || "A prestigious foundation for your child's future, combining traditional values with world-class academic innovation."}
            </p>

            {/* Action Row */}
            <div className="flex flex-wrap items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 rounded-2xl font-bold text-[13px] text-white shadow-lg transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                Book a Private Tour
              </motion.button>

              <button className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md transition-all group-hover:scale-110">
                  <PlayIcon className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Explore Campus</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 pt-8 border-t border-slate-200/50 grid grid-cols-3 gap-8">
              {[
                { label: 'Licensed PhDs', value: '45', icon: AcademicCapIcon },
                { label: 'Global Awards', value: '12', icon: GlobeAltIcon },
                { label: 'Student Safety', value: '100%', icon: UserGroupIcon },
              ].map((stat, i) => (
                <div key={i} className="text-left">
                  <p className="text-2xl font-bold text-slate-900 leading-none">{stat.value}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- BOTTOM FLOATING NAVIGATION DOCK --- */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-10 right-10 z-40 hidden lg:flex items-center gap-4 bg-white/90 p-2 pl-4 rounded-full border border-slate-200 shadow-xl"
      >
        <div className="flex -space-x-3 pr-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
               <img src={`https://i.pravatar.cc/100?u=${i}`} alt="parent" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="pr-6">
          <p className="text-[10px] font-bold text-slate-900 leading-none uppercase tracking-tighter">Joined by 500+ Families</p>
        </div>
        <button className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </motion.div>

    </section>
  );
}