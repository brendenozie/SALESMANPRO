'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, ArrowRightIcon, StarIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { Award, Testimonial } from '@/types/typings';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'linear' },
  },
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const renderTaglineWithBold = (text: string, accentColor: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g); 
  return parts.map((part, idx) => {
    if (idx % 2 !== 0) { 
      return (
        <span key={idx} style={{ color: accentColor }} className="font-black tracking-tight">
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
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

export default function SecurityHeroSectionLight({ 
  name, 
  themeSettings, 
  tagline, 
  heroSlides, 
  testimonials, 
  awards 
}: HeroSectionProps) {

  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6';

  const defaultHeadline = 'Proactive Cyber Defense in a **Complex World**';
  const defaultTagline = 'Global Intelligence. Local Action. Absolute Protection.';

  const headline = heroSlides[0]?.headline || defaultHeadline;
  const distinctVisualUrl = heroSlides[0]?.productImageUrl || 'https://images.unsplash.com/photo-1544455589-cf77d8538600?q=80&w=1200&h=1600&fit=crop';

  const validTestimonials: Testimonial[] = Array.isArray(testimonials) ? testimonials.filter(t => typeof t.rating === 'number') : [];
  const reviewCount = validTestimonials.length;
  const averageRating = reviewCount > 0 ? validTestimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / reviewCount : 0;
  const roundedRating = Math.round(averageRating * 2) / 2;
  const awardsData: Award[] = Array.isArray(awards) && awards.length > 0 ? awards : [];

  return (
    <AnimatePresence>
      <section
        id="hero"
        className="relative flex items-center min-h-[90vh] py-24 md:py-32 px-6 lg:px-12 bg-white border-b border-gray-100 overflow-hidden" 
      >
        {/* STRUCTURAL BACKGROUND GRID LAYER */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none border-x border-gray-900 max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-gray-900 h-full" />
          ))}
        </div>

        {/* INTERFACE SPLIT GRID */}
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          
          {/* CONTENT FIELD NODE */}
          <motion.div
            className="lg:col-span-7 text-left order-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* SYSTEM METADATA STATUS TAG */}
            <motion.div className="inline-flex items-center gap-3 mb-6" variants={itemVariants}>
              <span className="w-2 h-2 rounded-none animate-pulse" style={{ backgroundColor: primaryColor }} />
              <p className="text-[10px] font-mono font-black uppercase tracking-widest text-gray-400">
                SYS_STATUS // ONLINE_SECURE
              </p>
            </motion.div>

            {/* TAGLINE STRUCT */}
            <motion.p className="text-xs font-mono font-bold uppercase tracking-wider mb-4 text-gray-500" variants={itemVariants}>
              {renderTaglineWithBold(tagline || defaultTagline, primaryColor)}
            </motion.p>

            {/* COMMAND HEADLINE */}
            <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-[1.05] mb-6 text-gray-900" variants={itemVariants}>
              {renderTaglineWithBold(headline, primaryColor)}
            </motion.h1>
            
            {/* INSTRUCTIONAL DESCRIPTION */}
            <motion.p className="text-xs font-mono text-gray-400 max-w-xl mb-10 leading-relaxed" variants={itemVariants}>
              Executing real-time defensive architecture matrices. Deploying active telemetry points across localized client operational vectors to prevent perimeter degradation.
            </motion.p>
            
            {/* TELEMETRY ACTION STRINGS */}
            <motion.div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12" variants={itemVariants}>
              <Link
                href="#contact"
                className="inline-flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider px-8 py-4 border transition-colors text-white justify-center" 
                style={{ 
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }} 
              >
                <ShieldCheckIcon className="w-4 h-4" />
                Initialize Assessment
              </Link>
              
              <Link
                href="#services"
                className="inline-flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider px-8 py-4 border border-gray-200 text-gray-900 hover:border-gray-900 transition-colors justify-center"
              >
                <ArrowRightIcon className="w-4 h-4" />
                View Services Index
              </Link>
            </motion.div>

            {/* CREDIBILITY TELEMETRY PACKET */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100 max-w-xl" variants={itemVariants}>
              {reviewCount > 0 && (
                <div className="flex flex-col gap-1 font-mono">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">TELEMETRY_RATING</span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(roundedRating) ? 'text-gray-900' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      [{averageRating.toFixed(1)} / 5.0]
                    </span>
                  </div>
                </div>
              )}
              {awardsData.length > 0 && (
                <div className="flex flex-col gap-1 font-mono">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">COMPLIANCE_VERIFIED</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <TrophyIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{awardsData[0]?.name}</span>
                  </div>
                </div>
              )}
            </motion.div>

          </motion.div>

          {/* RIGHT: PORTRAIT FRAME INTERFACE ELEMENT */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative order-2 w-full">
            <div className="relative w-full max-w-sm lg:w-[360px] aspect-[3/4] border border-gray-200 bg-gray-50 p-2">
              <div className="absolute top-0 left-0 bg-gray-200 text-[9px] font-mono uppercase px-2 py-0.5 z-20 border-r border-b border-gray-200 text-gray-500">
                FRAME_LOCK // CAPTURE
              </div>
              <div className="relative w-full h-full overflow-hidden ">
                <Image
                  src={distinctVisualUrl}
                  loader={imageLoader}
                  alt="Professional Security Guard or Cyber Security Expert" 
                  fill
                  priority
                  className="object-cover object-center transition-transform duration-300 hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 360px"
                /> 
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </AnimatePresence>
  );
}