"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  HeartIcon, 
  ClipboardDocumentListIcon, 
  AcademicCapIcon, 
  BanknotesIcon, 
  PlayCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';
import { HeroSlide } from '@/types/typings';

// --- Polished Animation Configs ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.1, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 70 } 
  },
};

const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
    }
  }
};

const backgroundVariants = {
  initial: { scale: 1.02 },
  animate: { 
    scale: 1.08,
    transition: { duration: 24, ease: "linear", repeat: Infinity, repeatType: "reverse" as const }
  }
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => `${src}?w=${width}&q=${quality || 85}`;

interface HealthcareHeroProps {
  heroSlides?: HeroSlide[];
  slug?: string;
  themeSettings?: {
    primaryColor?: string;
    secondaryColor?: string;
  } | null;
}

export default function HealthcareHero({ heroSlides, slug, themeSettings }: HealthcareHeroProps) {
  
  const primarySlide = heroSlides?.[0] || {
    id: "default-slide",
    headline: "Your Health, Our Sacred Mission",
    subline: "Providing compassionate, comprehensive medical care for you and your family using state-of-the-art diagnostic technology.",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop",
    productImageUrl: "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop",
    ctaText: "Schedule Consultation",
    ctaLink: `/${slug || 'unbite-healthcare'}/book`,
    badgeText: "✨ Telehealth Appointments Open",
  };

  const { headline, subline, imageUrl, productImageUrl, ctaText, ctaLink, badgeText } = primarySlide;
  const primaryColor = themeSettings?.primaryColor || "#0d9488"; 

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-slate-50 flex items-center selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="relative w-full h-full"
          variants={backgroundVariants}
          initial="initial"
          animate="animate"
        >
          <Image
            src={productImageUrl || imageUrl || "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop"}
            alt={headline || "Healthcare Facility"}
            fill
            className="object-cover object-center mix-blend-multiply opacity-[0.25] lg:opacity-100"
            loader={loader}
            priority
          />
        </motion.div>

        {/* Premium Soft White Overlays for maximum Light Mode readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/25 to-transparent z-10 hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent z-10 lg:hidden" />
        
        {/* Dynamic Light Ambient Glow Blobs */}
        <div 
          className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 pointer-events-none mix-blend-multiply animate-pulse"
          style={{ backgroundColor: primaryColor, animationDuration: '10s' }}
        />
        <div className="absolute bottom-12 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none bg-blue-400" />
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* LEFT COLUMN: INFORMATION & ACTIONS */}
        <motion.div 
          className="lg:col-span-7 space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Light Mode Pill Badge */}
          {badgeText && (
            <motion.div variants={itemVariants} className="inline-block">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase text-teal-800 bg-teal-50 border border-teal-200/60 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primaryColor }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: primaryColor }} />
                </span>
                {badgeText}
              </span>
            </motion.div>
          )}

          {/* Clean Editorial Typography */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]"
          >
            {headline.split(',').map((chunk, index) => (
              <span key={index} className={index === 1 ? "block mt-1 text-slate-800" : ""}>
                {chunk}{index === 0 && ','}
              </span>
            ))}
          </motion.h1>

          {/* Crisp, Highly Readable Subtext */}
          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal"
          >
            {subline}
          </motion.p>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            {ctaLink && (
              <Link
                href={ctaLink}
                className="group relative flex items-center justify-center px-8 py-4 rounded-2xl text-white font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 hover:shadow-xl"
                style={{ backgroundColor: primaryColor }}
              >
                <ClipboardDocumentListIcon className="w-5 h-5 mr-3 group-hover:scale-105 transition-transform" />
                {ctaText || "Book Now"}
              </Link>
            )}

            <Link
              href={`/${slug}/contact`}
              className="group flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
            >
              <PlayCircleIcon className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600 transition-colors" />
              Explore Specialties
            </Link>
          </motion.div>

          {/* Grid Feature Cards */}
          <motion.div 
            variants={itemVariants}
            className="pt-4 grid grid-cols-3 gap-3 md:gap-4 max-w-lg"
          >
            {[
              { icon: AcademicCapIcon, title: "Elite Faculty", desc: "Board certified" },
              { icon: BanknotesIcon, title: "Clear Pricing", desc: "No hidden fees" },
              { icon: HeartIcon, title: "Patient-First", desc: "Empathetic care" }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="flex flex-col p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:border-slate-200"
              >
                <div className="p-2 w-fit rounded-xl bg-slate-50 border border-slate-100 mb-3 text-slate-700">
                  <item.icon className="w-5 h-5 text-teal-600" />
                </div>
                <p className="text-slate-900 font-bold text-xs md:text-sm tracking-tight leading-tight mb-0.5">{item.title}</p>
                <p className="text-slate-500 text-[11px] leading-none">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

      

      </div>
    </section>
  );
}