"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeroSlide } from "@/types/typings";

// --- ICONS ---
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const CheckBadgeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const ScaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
  </svg>
);

const CurrencyDollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LightBulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] } 
  },
};

const imageVariants = {
  hidden: { opacity: 0, x: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1, 
    transition: { duration: 1, ease: "easeOut" } 
  },
};

const floatingCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { delay: 0.8, duration: 0.6, type: "spring" } 
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
  
  // Content Fallbacks
  const headline = activeHeroSlide?.headline || "Strategic Clarity for Complex Challenges";
  const subline = activeHeroSlide?.subline || "We bridge the gap between intricate legal requirements and ambitious financial goals with expert, personalized counsel.";
  const ctaText = activeHeroSlide?.ctaText || "Schedule Consultation";
  const ctaLink = activeHeroSlide?.ctaLink || "/contact";
  
  // Image Fallback - Using a high-quality office/business splash
  const imageUrl = activeHeroSlide?.imageUrl || activeHeroSlide?.productImageUrl || "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80";

  const primary = themeSettings?.primaryColor || "#2563EB"; 

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-50 font-sans">
      
      {/* --- BACKGROUND AMBIANCE --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large gradient blob top left */}
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-100 rounded-full blur-[120px] opacity-60 mix-blend-multiply animate-pulse" />
        {/* Large gradient blob bottom right */}
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-100 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
        {/* Grid Texture */}
        <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-24 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* --- LEFT COLUMN: TEXT CONTENT --- */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            {/* Trust Badge */}
            <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-blue-100 shadow-sm text-sm font-semibold text-blue-700 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Accepting New Clients for 2024
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUpVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
            >
              Navigate with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Confidence.
              </span>
            </motion.h1>

            {/* Subline */}
            <motion.p
              variants={fadeUpVariants}
              className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed"
            >
              {subline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row gap-4 mb-12">
              <a
                href={ctaLink}
                className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1"
              >
                {ctaText}
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
              >
                Explore Services
              </a>
            </motion.div>

            {/* Trust Indicators Grid (Pills) */}
            <motion.div 
              variants={fadeUpVariants}
              className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-8"
            >
              {[
                { icon: ScaleIcon, text: "Legal Expertise" },
                { icon: CurrencyDollarIcon, text: "Wealth Strategy" },
                { icon: LightBulbIcon, text: "Innovative Solutions" },
                { icon: UsersIcon, text: "Client Focused" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <item.icon />
                  </div>
                  <span className="text-sm sm:text-base">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* --- RIGHT COLUMN: VISUAL COMPOSITION --- */}
          <div className="relative hidden lg:block h-full min-h-[600px]">
             {/* Main Image with Mask */}
             <motion.div
               variants={imageVariants}
               initial="hidden"
               animate="visible"
               className="absolute right-0 top-10 w-[90%] h-[85%] rounded-[2.5rem] overflow-hidden shadow-2xl z-10"
               style={{ transform: 'rotate(-2deg)' }}
             >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                <img 
                  src={imageUrl} 
                  alt="Strategic Planning" 
                  className="w-full h-full object-cover"
                />
             </motion.div>
             
             {/* Background Decor Element (Behind Image) */}
             <div className="absolute right-[-20px] top-0 w-[90%] h-[85%] rounded-[2.5rem] border-2 border-blue-200 z-0" style={{ transform: 'rotate(3deg)' }} />

             {/* Floating "Success" Card */}
             <motion.div
               variants={floatingCardVariants}
               initial="hidden"
               animate="visible"
               className="absolute bottom-24 -left-8 z-20 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 max-w-[260px]"
             >
                <div className="flex items-center gap-4 mb-3">
                   <div className="p-3 bg-green-100 rounded-full text-green-600">
                      <CheckBadgeIcon className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Success Rate</p>
                      <p className="text-2xl font-black text-slate-900">98.5%</p>
                   </div>
                </div>
                <p className="text-sm text-slate-600 leading-snug">
                  Proven track record in dispute resolution & asset growth.
                </p>
             </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}