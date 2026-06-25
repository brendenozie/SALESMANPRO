'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, ArrowRightIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { StarIcon, TrophyIcon } from '@heroicons/react/24/solid'; 
import { Award, Testimonial } from '@/types/typings'; 

// --- ADVANCED MICRO-ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const telemetryVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
};

const floatingVisualVariants = {
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface HeroSectionProps {
  name: string | undefined | null;
  themeSettings: {
    primaryColor?: string;
    secondaryColor?: string;
  } | undefined | null;
  tagline?: string | undefined | null;
  heroSlides: {
    headline?: string | undefined | null;
    imageUrl?: string | undefined | null; 
    productImageUrl?: string | undefined | null; 
  }[];
  testimonials: Testimonial[] | undefined | null;
  awards: Award[] | undefined | null;
}

export default function PremiumSecurityHero({ name, themeSettings, tagline, heroSlides, testimonials, awards }: HeroSectionProps) {
  const primaryColor = themeSettings?.primaryColor || '#00A880'; // e.g., Teal / Cyber Green
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6'; // e.g., Deep Tech Blue

  const headline = heroSlides[0]?.headline || "Proactive Cyber Defense in a {accent}Complex World{/accent}";
  const distinctVisualUrl = heroSlides[0]?.productImageUrl || '/placeholder-security-shield.png';

  const validTestimonials = Array.isArray(testimonials) ? testimonials.filter(t => typeof t.rating === 'number') : [];
  const reviewCount = validTestimonials.length;
  const awardsData = Array.isArray(awards) && awards.length > 0 ? awards : [];

  const renderHeadline = (text: string) => {
    const parts = text.split(/\{accent\}(.*?)\{\/accent\}/g);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return (
          <span key={idx} className="relative inline-block text-gray-900 font-black">
            {part}
            <span className="absolute bottom-2 left-0 w-full h-[30%] -z-10 opacity-20 mix-blend-multiply" style={{ backgroundColor: primaryColor }} />
          </span>
        );
      }
      return <span key={idx} className="font-extrabold text-gray-900">{part}</span>;
    });
  };

  return (
    <AnimatePresence>
      <section id="hero" className="relative min-h-screen bg-white overflow-hidden flex items-center justify-center py-20 lg:py-0">
        
        {/* --- THE DEFENSE GRID (Abstract Technical Framework Background) --- */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Dot Matrix Layer */}
          <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: `radial-gradient(${secondaryColor} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
          {/* Large structural glass geometric shape in the background */}
          <div className="absolute top-[-10%] right-[-5%] w-[55vw] h-[120vh] bg-gradient-to-bl from-gray-50 via-slate-50/50 to-transparent transform rotate-6 border-l border-gray-100/70" />
          {/* Radial Ambient Glow */}
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.08] animate-pulse" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* --- MAIN HERO WRAPPER --- */}
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* LEFT: STRUCTURAL COPY & HERO INTEL */}
          <motion.div 
            className="lg:col-span-7 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* System Status Pill Tag */}
            <motion.div 
              variants={telemetryVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-gray-200 bg-gray-50/80 shadow-sm backdrop-blur-md"
            >
              <div className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                {tagline || "SYSTEMS ACTIVE // ZERO TRUST ENFORCED"}
              </span>
            </motion.div>

            {/* Premium Typographic Stack */}
            <div className="space-y-4 max-w-2xl lg:max-w-none">
              <motion.h1 
                variants={telemetryVariants}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.08]"
              >
                {renderHeadline(headline)}
              </motion.h1>

              <motion.p 
                variants={telemetryVariants}
                className="text-lg sm:text-xl text-gray-500 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Enterprise infrastructure demands more than reactive patching. We position highly specialized execution layers to safeguard your high-value digital systems.
              </motion.p>
            </div>

            {/* CTA Interaction Blocks */}
            <motion.div 
              variants={telemetryVariants}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link href="#contact" className="group relative w-full sm:w-auto overflow-hidden rounded-xl">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3 px-8 py-4 font-bold text-sm text-white shadow-md transition-all duration-300"
                  style={{ backgroundColor: primaryColor }}
                >
                  <ShieldCheckIcon className="w-5 h-5 transition-transform group-hover:rotate-6" />
                  Request Infrastructure Audit
                </motion.div>
              </Link>

              <Link href="#services" className="group w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-8 py-4 font-semibold text-sm border bg-transparent rounded-xl transition-all duration-200"
                  style={{ color: textSecondaryFallback(secondaryColor), borderColor: '#e5e7eb' }}
                >
                  <span>Our Architecture</span>
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </Link>
            </motion.div>

            {/* Embedded Live Trust Metrics */}
            <motion.div 
              variants={telemetryVariants}
              className="flex flex-wrap justify-center lg:justify-start items-center gap-6 border-t border-gray-100 pt-6 w-full"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <LockClosedIcon className="w-5 h-5" style={{ color: secondaryColor }} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">99.99% Resilience</div>
                  <div className="text-[11px] text-gray-400">Threat Mitigation Vector</div>
                </div>
              </div>

              {awardsData.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <TrophyIcon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 truncate max-w-[160px]">{awardsData[0].name}</div>
                    <div className="text-[11px] text-gray-400">Industry Validation</div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* RIGHT: THE FLOATING INTERACTIVE TELEMETRY FRAME */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            
            {/* Structural Technical Frame Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,#ef4444_45%,#ef4444_55%,transparent_55%)] bg-[size:10px_10px] opacity-[0.03] pointer-events-none" />

            <motion.div
              variants={floatingVisualVariants}
              animate="animate"
              className="relative w-full max-w-sm aspect-[4/5] rounded-[2rem] p-1 bg-gradient-to-b from-gray-100 to-transparent shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] group"
            >
              {/* Glassmorphic Shell Outer Layer */}
              <div className="w-full h-full rounded-[1.9rem] bg-white border border-white p-6 flex flex-col justify-between relative overflow-hidden">
                
                {/* Visual Header HUD element */}
                <div className="flex justify-between items-center opacity-40 border-b border-gray-100 pb-4">
                  <span className="text-[9px] font-mono tracking-widest text-gray-500">CORE_SHIELD_V4.8</span>
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  </div>
                </div>

                {/* Primary Core Asset Image Container */}
                <div className="relative w-full h-[60%] my-auto flex items-center justify-center transform group-hover:scale-[1.03] transition-transform duration-700 ease-out">
                  <Image
                    src={distinctVisualUrl}
                    alt={`${name || 'Security'} platform engine interface`}
                    loader={({ src }) => src}
                    fill
                    priority
                    className="object-contain p-4 drop-shadow-[0_16px_24px_rgba(0,0,0,0.04)]"
                    sizes="(max-width: 1024px) 80vw, 30vw"
                  />
                </div>

                {/* Simulated Floating Status Callout Card */}
                <div className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm p-3.5 rounded-xl flex items-center gap-3 transform translate-y-2 group-hover:-translate-y-1 transition-transform duration-500">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-inner" style={{ backgroundColor: primaryColor }}>
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">Secured Endpoint Active</div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-tighter">INTELLIGENCE NETWORK REALTIME</div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </section>
    </AnimatePresence>
  );
}

// Utility styling helper fallback
function textSecondaryFallback(color: string) {
  return color === '#3B82F6' ? '#2563EB' : color;
}