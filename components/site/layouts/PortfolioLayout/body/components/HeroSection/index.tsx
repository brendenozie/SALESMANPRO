'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRightIcon, 
    BoltIcon, 
    TrophyIcon, 
    ArrowDownIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { Award, Testimonial } from '@/types/typings';

// --- Fluid Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 120, damping: 20 }
    }
};

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 200 : -200,
        opacity: 0,
        scale: 0.98
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 100, damping: 20 }
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 200 : -200,
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.2 }
    })
};

// --- Structural Headline Accent Engine ---
function renderHeadline(headline: string, primaryColor: string) {
    const words = headline.split(' ');
    if (words.length <= 2) {
        return <span className="text-slate-900 font-black tracking-tight">{headline}</span>;
    }
    
    const lastTwo = [words.pop(), words.pop()].reverse().join(' ');
    return (
        <span className="font-black tracking-tight text-slate-900 block leading-[1.1]">
            {words.join(' ')}{' '}
            <span style={{ color: primaryColor }} className="inline-block select-none font-black">
                {lastTwo}
            </span>
        </span>
    );
}

// --- Component Interfaces ---
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
        description?: string | undefined | null; 
    }[];
    testimonials: Testimonial[] | undefined | null;
    awards: Award[] | undefined | null;
}

// --- Main Hero Component Core ---
export default function HeroSection({ name, themeSettings, tagline, heroSlides, testimonials, awards }: HeroSectionProps) {
    const primaryColor = themeSettings?.primaryColor || '#000000';
    const secondaryColor = themeSettings?.secondaryColor || '#4b5563';
    
    // Carousel State Configuration
    const [[page, direction], setPage] = useState([0, 0]);
    const totalSlides = Array.isArray(heroSlides) && heroSlides.length > 0 ? heroSlides.length : 1;
    const activeIndex = ((page % totalSlides) + totalSlides) % totalSlides;

    // Direct Safe Mappings
    const currentSlide = heroSlides?.[activeIndex] || {};
    const headline = currentSlide?.headline || 'Unleash the Full Potential of Your Digital Identity';
    const description = currentSlide?.description || 'Engineered with clean architectural layouts and micro-interactions optimized seamlessly to captivate your core audience.';
    const displayImage = currentSlide?.imageUrl || currentSlide?.productImageUrl || 'https://images.unsplash.com/photo-1542831371-29b0f74f9d13?q=80&w=2940&auto=format&fit=crop';

    // Auto Cycle Slide Effect 
    useEffect(() => {
        if (totalSlides <= 1) return;
        const timer = setInterval(() => {
            setPage([page + 1, 1]);
        }, 7000);
        return () => clearInterval(timer);
    }, [page, totalSlides]);

    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    };

    // Social Proof Parsing
    const validTestimonials = Array.isArray(testimonials) ? testimonials.filter(t => typeof t.rating === 'number') : [];
    const reviewCount = validTestimonials.length;
    const averageRating = reviewCount > 0 ? validTestimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / reviewCount : 5.0;

    return (
        <section id="hero" className="relative flex items-center min-h-screen bg-white text-slate-800 overflow-hidden border-b border-slate-100">
            {/* Minimal Background Wire Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center py-24 lg:py-32">
                
                {/* LEFT: Context Panel (Balanced allocation to 6/12) */}
                <motion.div
                    className="lg:col-span-6 text-center lg:text-left flex flex-col items-center lg:items-start"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Minimal Border Pill Tagline */}
                    <motion.div 
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-slate-50 border border-slate-200 mb-6"
                        variants={itemVariants}
                    >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                            {tagline || 'Portfolio Presentation'}
                        </p>
                    </motion.div>

                    {/* Dynamic Header Display Node */}
                    <motion.h1 
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black tracking-tight mb-6 w-full"
                        variants={itemVariants}
                    >
                        {renderHeadline(headline, primaryColor)}
                    </motion.h1>

                    {/* Subtext description wrapper */}
                    <motion.p
                        className="text-lg text-slate-500 font-normal leading-relaxed mb-10 max-w-xl"
                        variants={itemVariants}
                    >
                        {description}
                    </motion.p>

                    {/* Clean Solid CTA Grid Layout */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12"
                        variants={itemVariants}
                    >
                        <a
                            href="#contact"
                            className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto text-base font-bold px-8 py-4 rounded-xl border-2 shadow-xs transition-all duration-200 active:scale-98"
                            style={{ 
                                backgroundColor: primaryColor, 
                                borderColor: primaryColor,
                                color: '#ffffff'
                            }}
                        >
                            <BoltIcon className="w-4 h-4" />
                            Start a Project
                        </a>
                        
                        <a
                            href="#portfolio"
                            className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto text-base font-bold px-8 py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-800 transition-all duration-200 hover:border-slate-800"
                        >
                            View All Projects
                            <ArrowRightIcon className="w-4 h-4" />
                        </a>
                    </motion.div>

                    {/* Trust Infrastructure Segment */}
                    <motion.div
                        className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 pt-6 border-t border-slate-100 w-full"
                        variants={itemVariants}
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-left">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <StarIcon key={i} className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'text-slate-900' : 'text-slate-200'}`} />
                                    ))}
                                    <span className="text-xs font-bold text-slate-900 ml-1">{averageRating.toFixed(1)}</span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">Verified Client Satisfaction</p>
                            </div>
                        </div>

                        {Array.isArray(awards) && awards.length > 0 ? (
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                                <TrophyIcon className="w-4 h-4 text-slate-800" />
                                <span className="text-xs font-semibold text-slate-700">Awarded Professional Showcase</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                <span className="text-xs font-semibold text-slate-700">Available For Client Work</span>
                            </div>
                        )}
                    </motion.div>
                </motion.div>

                {/* RIGHT: Upscaled Visual Slideshow Panel (Now taking 6/12 width) */}
                <div className="lg:col-span-6 flex flex-col justify-center items-center w-full relative">
                    <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[1.4] rounded-2xl border border-slate-150/70 p-0 overflow-hidden shadow-2xl bg-slate-50">
                        
                        {/* Frame Content Layer Container */}
                        <div className="w-full h-full rounded-2xl overflow-hidden relative bg-white">
                            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                <motion.img
                                    key={page}
                                    src={displayImage}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    alt="Showcase Visual Portfolio Index"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </AnimatePresence>
                        </div>

                        {/* Minimal Navigation Overlay Controls */}
                        {totalSlides > 1 && (
                            <div className="absolute bottom-4 right-4 flex items-center gap-1 z-20">
                                <button
                                    onClick={() => paginate(-1)}
                                    className="p-2.5 rounded-lg bg-white/90 border border-slate-200 text-slate-800 hover:bg-white active:scale-95 transition-all shadow-md"
                                >
                                    <ChevronLeftIcon className="w-4 h-4 stroke-[2.5]" />
                                </button>
                                <button
                                    onClick={() => paginate(1)}
                                    className="p-2.5 rounded-lg bg-white/90 border border-slate-200 text-slate-800 hover:bg-white active:scale-95 transition-all shadow-md"
                                >
                                    <ChevronRightIcon className="w-4 h-4 stroke-[2.5]" />
                                </button>
                            </div>
                        )}

                        {/* Slide Absolute Track Counter */}
                        {totalSlides > 1 && (
                            <span className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase shadow-sm">
                                {activeIndex + 1} / {totalSlides}
                            </span>
                        )}
                    </div>

                    {/* Progress Indicator Dots System */}
                    {totalSlides > 1 && (
                        <div className="flex items-center gap-1.5 mt-5">
                            {heroSlides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPage([index, index > activeIndex ? 1 : -1])}
                                    className="h-1 rounded-full transition-all duration-300"
                                    style={{
                                        width: index === activeIndex ? '1.25rem' : '0.35rem',
                                        backgroundColor: index === activeIndex ? primaryColor : '#cbd5e1'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Bottom Section Arrow Vector Anchor */}
            <motion.div 
                className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:block"
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
                <ArrowDownIcon className="w-4 h-4 text-slate-300" />
            </motion.div>
        </section>
    );
}