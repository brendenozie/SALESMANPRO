"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  AcademicCapIcon, 
  StarIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  PlayIcon,
  GlobeAltIcon
} from '@heroicons/react/24/solid'; 
import Image from 'next/image';

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- Animations: Faster, Bright Reveal ---
const fadeUpReveal = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: [0.33, 1, 0.68, 1] 
    } 
  }
};

const maskReveal = {
  hidden: { scaleY: 1, originY: 0 },
  visible: { 
    scaleY: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.19, 1, 0.22, 1],
      delay: 0.1 
    } 
  }
};

export default function BrightProfessionalHero({storeFormData}: { storeFormData: any }) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';
  const secondaryAccent = '#14b8a6'; 

  const activeSlide = storeFormData?.heroSlides?.[0];

  const headline = activeSlide?.headline || "Building Foundations for a Lifetime of Excellence.";
  const subline = activeSlide?.subline || "A nurturing environment where curiosity meets world-class curriculum. We prepare your child for the global stage with values-based primary education.";

  return (
    <div className="relative bg-white font-sans overflow-hidden">
      
      {/* --- ACADEMIC TRUST BAR --- */}
      {/* <div className="bg-gray-50/50 border-b border-gray-100 py-3 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">
              <CheckBadgeIcon className="w-3.5 h-3.5" style={{ color: secondaryAccent }} />
              Accredited Institution 2026
            </span>
            <div className="h-3 w-px bg-gray-200" />
            <span className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">
              <GlobeAltIcon className="w-3.5 h-3.5" style={{ color: secondaryAccent }} />
              Global Standards
            </span>
          </div>
          <div className="flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-1.5 rounded-full shadow-sm">
            {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3 h-3" style={{ color: primaryColor }} />)}
            <span className="text-[9px] font-black text-gray-900 ml-3 uppercase tracking-widest">Top Tier Rank</span>
          </div>
        </div>
      </div> */}

      <section className="relative pt-8 pb-24 lg:pt-8 lg:pb-32">
       
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* --- LEFT: CONTENT (Takes up 7 columns on desktop) --- */}
            <div className="lg:col-span-7">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              >
                <motion.div variants={fadeUpReveal} className="inline-flex items-center gap-3 mb-8 border-l-2 pl-4" style={{ borderColor: `${primaryColor}40` }}>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                    Admission Cycle Active
                  </span>
                </motion.div>

                <motion.h1 
                  variants={fadeUpReveal}
                  className="text-5xl md:text-7xl xl:text-8xl font-serif font-bold text-gray-900 leading-[1.0] mb-8 tracking-tighter"
                >
                  {headline.split(' ').map((word: string, i: number) => (
                    <span key={i} className={`${i === 2 ? "italic font-light text-gray-400" : "text-gray-900"}`}>
                      {word}{' '}
                    </span>
                  ))}
                </motion.h1>

                <motion.p 
                  variants={fadeUpReveal}
                  className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10 max-w-xl font-medium"
                >
                  {subline}
                </motion.p>

                <motion.div variants={fadeUpReveal} className="flex flex-wrap gap-5 mb-16">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#fff', color: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}40` }}
                    whileTap={{ scale: 0.98 }}
                    className="px-10 py-5 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Initiate Enrollment
                  </motion.button>
                  
                  <button className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 group">
                    <div className="w-12 h-12 border border-gray-200 bg-white flex items-center justify-center transition-all group-hover:border-gray-900">
                      <PlayIcon className="w-4 h-4" />
                    </div>
                    Experience Campus
                  </button>
                </motion.div>

                {/* Technical Metric Grid */}
                <motion.div variants={fadeUpReveal} className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-100">
                  {[
                    { val: "12:1", label: "Student Ratio" },
                    { val: "IB/STEM", label: "Curriculum" },
                    { val: "100%", label: "Security Rate" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-50/50 border border-gray-100 p-5">
                      <p className="text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>{stat.val}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* --- RIGHT: IMAGE (Takes up 5 columns on desktop) --- */}
            <div className="lg:col-span-5 relative">
              <motion.div 
                className="relative z-10"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Main Image Frame */}
                <div className="relative bg-white p-3 shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.07)] border border-gray-100">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image decoding="async"
                      src={activeSlide?.imageUrl || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80"}
                      alt="Student Excellence"
                      fill
                      className="object-cover"
                      priority
                    />
                    
                    {/* Instant Brightening Mask */}
                    <motion.div 
                      variants={maskReveal}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="absolute inset-0 bg-white z-10"
                    />

                    {/* Integrated Detail Card */}
                    <div className="absolute bottom-4 left-4 right-4 p-5 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg z-20">
                      <div className="flex items-center gap-3 mb-2">
                        <AcademicCapIcon className="w-4 h-4" style={{ color: secondaryAccent }} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">Verified Pedagogy</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                        Recognized globally for excellence in child development and primary education.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Institutional Vertical Text */}
                <div className="absolute -right-12 top-1/2 -rotate-90 origin-right hidden xl:block">
                  <span className="text-[10px] font-black text-gray-200 uppercase tracking-[0.8em] whitespace-nowrap">
                    Institutional Excellence • Est. 2026
                  </span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}