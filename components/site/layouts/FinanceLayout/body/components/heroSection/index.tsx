"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeroSlide } from "@/types/typings";

// --- CLEAN MODERN SYSTEM ICONS ---
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const CheckBadgeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const ScaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
  </svg>
);

const CurrencyDollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LightBulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

// --- SPRING KINETIC VARIATION MODULES ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.08, delayChildren: 0.05 } 
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  },
};

const imageCompositionVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

interface HeroSectionProps {
  heroSlides?: HeroSlide[] | null;
  themeSettings?: {
    primaryColor?: string;
    secondaryColor?: string;
  } | null;
}

export default function HeroSection({ heroSlides, themeSettings }: HeroSectionProps) {
  const activeHeroSlide = heroSlides?.[0];
  
  const headline = activeHeroSlide?.headline || "Strategic Clarity for Complex Challenges";
  const subline = activeHeroSlide?.subline || "We bridge the gap between intricate legal requirements and ambitious financial goals with expert, personalized counsel.";
  const ctaText = activeHeroSlide?.ctaText || "Schedule Consultation";
  const ctaLink = activeHeroSlide?.ctaLink || "/contact";
  
  const imageUrl = activeHeroSlide?.imageUrl || activeHeroSlide?.productImageUrl || "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80";

  const primaryColor = themeSettings?.primaryColor || "#2563EB"; 

  return (
    <section className="relative min-h-screen flex items-center bg-white text-slate-800 overflow-hidden py-24 lg:py-32 selection:bg-blue-500/10">
      
      {/* --- PREMIUM BACKDROP & BLURS --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div 
          className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-[0.08] mix-blend-multiply" 
          style={{ backgroundColor: primaryColor }} 
        />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-indigo-600/5 rounded-full blur-[130px] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-100" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          
          {/* --- LEFT COLUMN: CONTENT HUB --- */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 xl:col-span-6 flex flex-col items-start text-left"
          >
            {/* Live Indicator Pill */}
            <motion.div 
              variants={fadeUpVariants} 
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 shadow-sm text-xs font-semibold tracking-wide text-blue-600 mb-6 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Accepting Corporate Mandates for 2026
            </motion.div>

            {/* Typography Stack */}
            <motion.h1
              variants={fadeUpVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]"
            >
              Navigate with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600">
                Absolute Precision.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUpVariants}
              className="text-base text-slate-600 mb-10 leading-relaxed font-normal max-w-xl"
            >
              {subline}
            </motion.p>

            {/* Action Directives */}
            <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-14">
              <a
                href={ctaLink}
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20"
              >
                {ctaText}
                <ArrowRightIcon className="ml-2.5 w-3.5 h-3.5" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 active:scale-[0.98] transition-all backdrop-blur-sm"
              >
                Explore Services
              </a>
            </motion.div>

            {/* Value Track Minimal Grid */}
            <motion.div 
              variants={fadeUpVariants}
              className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-slate-100 pt-8 w-full max-w-xl"
            >
              {[
                { icon: ScaleIcon, text: "Legal Architecture" },
                { icon: CurrencyDollarIcon, text: "Capital Solutions" },
                { icon: LightBulbIcon, text: "Risk Strategy" },
                { icon: UsersIcon, text: "Bespoke Delivery" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3.5 text-slate-500 group">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 transition-colors group-hover:text-blue-600 group-hover:border-blue-500/30">
                    <item.icon />
                  </div>
                  <span className="text-sm font-medium text-slate-600 transition-colors group-hover:text-slate-900">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* --- RIGHT COLUMN: VISUAL ENGINE --- */}
          <div className="lg:col-span-5 xl:col-span-6 relative flex items-center justify-center min-h-[440px] lg:min-h-[540px]">
             
             {/* Integrated Framer Wrapper Container */}
             <motion.div
               variants={imageCompositionVariants}
               initial="hidden"
               animate="visible"
               className="relative w-full h-full max-w-[480px] lg:max-w-none px-4 sm:px-0"
             >
                {/* Background Framing Geometric Accent */}
                <div className="absolute inset-4 -right-2 -bottom-2 rounded-3xl border-2 border-slate-100 pointer-events-none z-0" />

                {/* Core Imagery Component Block */}
                <div className="relative aspect-[4/5] sm:aspect-[11/13] lg:aspect-[4/5] w-full bg-slate-50 rounded-3xl overflow-hidden shadow-xl border border-slate-200 z-10 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent z-10 pointer-events-none" />
                  <img 
                    src={imageUrl} 
                    alt="Strategic Advisory Operations" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-102"
                  />
                </div>

                {/* Metric Glass Float Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 15 }}
                  className="absolute bottom-6 -left-2 sm:-left-6 z-20 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-slate-200/80 max-w-[240px]"
                >
                  <div className="flex items-center gap-3.5 mb-2">
                     <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600">
                        <CheckBadgeIcon className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Historical Success</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight">98.5%</p>
                     </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Proven efficacy metrics inside complex corporate asset growth management.
                  </p>
                </motion.div>
             </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}