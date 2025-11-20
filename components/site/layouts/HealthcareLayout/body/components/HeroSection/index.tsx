"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, ClipboardDocumentListIcon, AcademicCapIcon, BanknotesIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import { HeroSlide } from '@/types/typings';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring", stiffness: 50 } 
  },
};

const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// NEW: Ken Burns Background Animation
const backgroundVariants = {
    initial: { scale: 1.0 },
    animate: { 
        scale: 1.15,
        transition: {
            duration: 20, // Very slow duration
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse" as const // Zooms in, then zooms out
        }
    }
};

// --- Loader ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => `${src}?w=${width}&q=${quality || 75}`;

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
    headline: "Your Health, Our Passion",
    subline: "Providing compassionate, comprehensive care for you and your family using state-of-the-art technology.",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop",
    productImageUrl: "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop",
    ctaText: "Book an Appointment",
    ctaLink: `/${slug || 'unbite-healthcare'}/book`,
    badgeText: "New: Telehealth Available",
  };

  const { headline, subline, imageUrl, productImageUrl, ctaText, ctaLink, badgeText } = primarySlide;
  const primaryColor = themeSettings?.primaryColor || "#0d9488"; 
  
  return (
    <section className="relative h-[95vh] min-h-screen w-full overflow-hidden bg-gray-900 group">
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Wrapped Image in motion.div for the Ken Burns Effect */}
        <motion.div 
            className="relative w-full h-full"
            variants={backgroundVariants}
            initial="initial"
            animate="animate"
        >
            <Image
                src={productImageUrl || imageUrl || "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop"}
                alt={headline || "Healthcare Background"}
                fill
                className="object-cover object-center opacity-90"
                loader={loader}
                priority
            />
        </motion.div>

        {/* Gradient Overlay: Stays static on top of the moving image */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent z-10" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        
        <motion.div 
          className="max-w-2xl mt-24 sm:mt-32 lg:mt-40"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            {/* Glass Card Container */}
            <div className="relative p-8 md:p-10 rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
                
                {/* Decorative Glow Blob */}
                <div 
                    className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-30 pointer-events-none"
                    style={{ backgroundColor: primaryColor }}
                />

                {/* Badge */}
                {badgeText && (
                    <motion.div variants={itemVariants} className="relative mb-6">
                    <span 
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase text-white shadow-lg ring-1 ring-white/20 backdrop-blur-xl"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    >
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                        {badgeText}
                    </span>
                    </motion.div>
                )}

                {/* Headline */}
                <motion.h1 
                    variants={itemVariants}
                    className="relative text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6 drop-shadow-lg"
                >
                    {headline}
                </motion.h1>

                {/* Subline */}
                <motion.p 
                    variants={itemVariants}
                    className="relative text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed font-light max-w-lg border-l-4 pl-4"
                    style={{ borderColor: primaryColor }}
                >
                    {subline}
                </motion.p>

                {/* Buttons */}
                <motion.div variants={itemVariants} className="relative flex flex-col sm:flex-row gap-4">
                    {ctaLink && (
                    <Link
                        href={ctaLink}
                        className="group flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold shadow-lg shadow-teal-900/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <ClipboardDocumentListIcon className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        {ctaText || "Book Now"}
                    </Link>
                    )}

                    <Link
                        href={`/${slug}/contact`}
                        className="group flex items-center justify-center px-8 py-4 rounded-xl bg-white/10 text-white font-semibold backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/20"
                    >
                        <PlayCircleIcon className="w-5 h-5 mr-2 text-white/80 group-hover:text-white" />
                        Watch Video
                    </Link>
                </motion.div>
            </div>

            {/* Features Grid */}
            <motion.div 
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.8 }}
                className="mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-xl"
            >
                {[
                    { icon: AcademicCapIcon, label: "Top Doctors" },
                    { icon: BanknotesIcon, label: "Best Prices" },
                    { icon: HeartIcon, label: "Patient First" }
                ].map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row items-center md:items-start gap-3 group cursor-default">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/30 transition-colors">
                            <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-white font-medium text-sm md:text-base">{item.label}</p>
                            <div className="h-0.5 w-0 group-hover:w-full bg-white/50 transition-all duration-500 mt-1 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </motion.div>

        </motion.div>
      </div>
    </section>
  );
}