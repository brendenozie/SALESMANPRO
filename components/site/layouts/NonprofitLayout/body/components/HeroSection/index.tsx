"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  ArrowRightIcon, 
  HeartIcon, 
  ShieldCheckIcon, 
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export type HeroSlide = {
  id: string;
  imageUrl: string;
  headline: string;
  subline: string;
  ctaText: string;
  ctaLink: string;
  order: number;
};

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
};

export type StoreForm = {
  id?: string;
  name?: string;
  tagline?: string;
  description?: string;
  bannerUrl?: string;
  heroSlides?: HeroSlide[];
  themeSettings?: ThemeSettings;
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 80}`;
};

// Clean fallback slides to ensure visual elegance if data is missing
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'default-1',
    imageUrl: 'https://images.unsplash.com/photo-1579762635293-9c869911e3b5?q=80&w=2670&auto=format&fit=crop',
    headline: 'Empowering Communities, Transforming Futures Together',
    subline: 'Your support enables us to provide education, healthcare, and sustainable development to those who need it most.',
    ctaText: 'Discover Our Initiatives',
    ctaLink: '/initiatives',
    order: 1,
  },
  {
    id: 'default-2',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2670&auto=format&fit=crop',
    headline: 'Providing Quality Education To Every Child',
    subline: 'We build classrooms, supply essential learning materials, and train local educators to spark lifelong opportunities.',
    ctaText: 'Explore Educational Programs',
    ctaLink: '/programs/education',
    order: 2,
  },
  {
    id: 'default-3',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=2670&auto=format&fit=crop',
    headline: 'Delivering Vital Health Solutions Globally',
    subline: 'Establishing clean water sources, mobile medical clinics, and persistent nutritional support to remote regions.',
    ctaText: 'Support Healthcare Missions',
    ctaLink: '/programs/health',
    order: 3,
  }
];

export default function HeroSection({storeFormData}: {storeFormData: StoreForm}) {
  // const { storeFormData } = useStoreContext();

  // Color Configurations - Pure colors, no gradients
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#2563EB'; // Professional Royal Blue
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#FFFFFF'; // Clean White
  const accentColor = storeFormData?.themeSettings?.accentColor || '#D97706'; // Flat Ochre/Amber

  // Extract custom slides or fallback to high-quality defaults
  const slides: HeroSlide[] = (storeFormData?.heroSlides && storeFormData.heroSlides.length > 0)
    ? [...storeFormData.heroSlides].sort((a, b) => a.order - b.order)
    : DEFAULT_SLIDES;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Slide navigation handlers
  const handleNext = () => {
    setDirection('forward');
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setDirection('backward');
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const activeSlide = slides[currentIdx];

  // Dynamic image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=2000";
  };

  // Framer Motion layout configurations for transitions
  const slideVariants = {
    enter: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 18 }
    },
    exit: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? -100 : 100,
      opacity: 0,
      transition: { duration: 0.2 }
    })
  };

  return (
    <section id="home" className="relative min-h-screen lg:h-screen flex items-center justify-center bg-slate-50 text-slate-900 overflow-hidden font-sans pt-24 pb-16 lg:py-0">
      
      {/* Light Professional Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.4] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Column: Typography Content & Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-8 lg:space-y-12">
          
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div 
              key={activeSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 sm:space-y-8 text-left"
            >
              {/* Top Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold tracking-wide text-slate-700">
                <SparklesIcon className="w-4 h-4 text-amber-600" />
                <span>Featured Cause of the Month</span>
              </div>

              {/* Headline with strategic flat accent coloring */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                {activeSlide.headline.split(' ').map((word, index) => {
                  const highlightWords = ["Empowering", "Transforming", "Together", "Futures", "Communities", "Quality", "Education", "Vital", "Health"];
                  const cleanWord = word.replace(/[.,]/g, "");
                  const isHighlighted = highlightWords.includes(cleanWord);
                  
                  return (
                    <span key={index} className="inline-block mr-2.5">
                      {isHighlighted ? (
                        <span className="font-extrabold" style={{ color: accentColor }}>
                          {word}
                        </span>
                      ) : (
                        word
                      )}
                    </span>
                  );
                })}
              </h1>

              {/* Subtitle Description */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl font-light">
                {activeSlide.subline}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href={activeSlide.ctaLink}
                  className="group relative flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 shadow-md active:scale-[0.98]"
                  style={{ backgroundColor: primaryColor, color: secondaryColor }}
                >
                  <span>{activeSlide.ctaText}</span>
                  <ArrowRightIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/#donate"
                  className="group flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-slate-400 bg-white px-8 py-4 rounded-xl font-bold text-base text-slate-800 transition-all duration-200 active:scale-[0.98] shadow-sm"
                >
                  <HeartIcon className="w-5 h-5 text-rose-500 group-hover:scale-105 transition-transform" />
                  <span>Make a Direct Donation</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls & Mini Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-slate-200 w-full">
            
            {/* Slide Navigation Selectors */}
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrev}
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all shadow-sm active:scale-95"
                aria-label="Previous Slide"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              {/* Horizontal Progress Indicators */}
              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentIdx ? 'forward' : 'backward');
                      setCurrentIdx(idx);
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentIdx ? 'w-8 bg-slate-900' : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button 
                onClick={handleNext}
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all shadow-sm active:scale-95"
                aria-label="Next Slide"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Verification Metadata */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
              <span>Verified 501(c)(3) Public Charity</span>
            </div>

          </div>
        </div>

        {/* Right Column: Visual Image frame with floating non-gradient metric blocks */}
        <div className="lg:col-span-5 relative flex justify-center items-center w-full aspect-square max-w-[500px] lg:max-w-none mx-auto">
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeSlide.id}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xl"
            >
              <Image
                src={activeSlide.imageUrl}
                alt="Community Empowerment Visual representation"
                fill
                className="object-cover"
                loader={loader}
                priority
                onError={handleImageError}
                sizes="(max-w-1024px) 100vw, 45vw"
              />
              {/* Flat color protective screen layer for crisp readability */}
              <div className="absolute inset-0 bg-slate-900/[0.04]" />
            </motion.div>
          </AnimatePresence>

          {/* Transparent-free glassmorphic/flat style metrics */}
          <div className="absolute -bottom-4 -left-4 sm:left-6 bg-white border border-slate-200 p-4 rounded-xl shadow-lg flex items-center gap-4 max-w-[240px]">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-lg border border-emerald-100">
              94%
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold tracking-wider uppercase leading-none">Funding Efficacy</p>
              <p className="text-sm font-bold text-slate-800 mt-1">Direct deployment to field operations</p>
            </div>
          </div>

          <div className="absolute -top-4 -right-4 bg-white border border-slate-200 px-5 py-3.5 rounded-xl shadow-lg hidden sm:flex flex-col gap-0.5 text-right">
            <span className="text-2xl font-black text-slate-900 tracking-tight" style={{ color: primaryColor }}>
              120,000+
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Uplifted Global Lives
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}