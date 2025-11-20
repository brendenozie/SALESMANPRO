'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon, BoltIcon, TrophyIcon, ArrowDownIcon, UsersIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { Award, Testimonial } from '@/types/typings';


// --- Animation Variants ---

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
};

const imageCardVariants = {
    hidden: { opacity: 0, scale: 0.9, rotate: 3 },
    visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 10,
            delay: 0.6,
        },
    },
};

// --- Utility Functions ---

function renderHeadline(headline: string, primaryColor: string) {
    const words = headline.split(' ');
    if (words.length <= 1) {
        // Changed from text-white to text-gray-900 for light mode
        return <span className="text-gray-900">{headline}</span>;
    }
    const lastWord = words.pop();
    return (
        <>
            {/* Changed from text-white to text-gray-900 for light mode */}
            <span className="text-gray-900">{words.join(' ')}</span>{' '}
            <span style={{ color: primaryColor }} className="drop-shadow-lg font-black">
                {lastWord}
            </span>
        </>
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

// --- Sub-Components (Integrated for standard HTML img/a tags) ---

const ImageCard = ({ productImageUrl, primaryColor }: { productImageUrl: string, primaryColor: string }) => {
    // Fallback for image loading errors
    const imageUrl = productImageUrl || 'https://placehold.co/1024x768/F3F4F6/374151?text=Dynamic+Web+Design';

    return (
        <motion.div
            // Updated card background, border, and blur for light mode
            className="relative w-full max-w-xl aspect-[4/3] rounded-3xl p-4 md:p-6 overflow-hidden bg-white/70 backdrop-blur-sm border border-gray-200 shadow-2xl transition-all duration-700 ease-out"
            variants={imageCardVariants}
            whileHover={{ scale: 1.03, rotate: -1 }}
            style={{
                // Subtle glowing shadow in light mode
                boxShadow: `0 0 30px -10px ${primaryColor}30, 0 10px 20px -5px rgba(0,0,0,0.1)`,
            }}
        >
            {/* Inner image container */}
            <div className="relative w-full h-full rounded-xl overflow-hidden">
                <img
                    src={imageUrl}
                    alt="Featured Product or Service Visual"
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
            </div>

            {/* Dynamic Glow Element (Subtle) */}
            <div 
                className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-2xl pointer-events-none"
                style={{ background: primaryColor }}
            />
            
            {/* Updated badge colors for light mode */}
            <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-lg px-3 py-1 rounded-full text-xs font-medium text-gray-800 shadow-md border border-gray-100">
                The Future Is Now
            </div>
        </motion.div>
    );
};


// --- Component Start ---

export default function HeroSection( { name, themeSettings, tagline, heroSlides, testimonials, awards }: HeroSectionProps) {
    
    const primaryColor = themeSettings?.primaryColor || '#00A880';
    const secondaryColor = themeSettings?.secondaryColor || '#10B981';
    
    // Fallback content logic
    const slide = heroSlides[0];
    const headline = slide?.headline || 'Unleash the Full Potential of Your Digital Presence';
    const description = slide?.description || 'We craft bespoke, lightning-fast, and highly scalable web applications designed to convert visitors into loyal customers.';
    const productImageUrl = slide?.imageUrl || slide?.productImageUrl || 'https://images.unsplash.com/photo-1542831371-29b0f74f9d13?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

    // Trust Signal calculation
    const validTestimonials: Testimonial[] = Array.isArray(testimonials) ? testimonials.filter(t => typeof t.rating === 'number') : [];
    const reviewCount = validTestimonials.length;
    const averageRating =
        reviewCount > 0
          ? validTestimonials.reduce((sum, t) => sum + (typeof t.rating === 'number' ? t.rating : 0), 0) / reviewCount
          : 0;
    const roundedRating = Math.round(averageRating * 2) / 2;
    const awardsData: Award[] = Array.isArray(awards) && awards.length > 0 ? awards : [];

    return (
        <AnimatePresence>
            <section
                id="hero"
                // Updated background and primary text for light mode
                className="relative flex items-center min-h-[90vh] py-24 md:py-32 px-6 lg:px-12 bg-white text-gray-900 overflow-hidden"
            >
                {/* Background Focus/Spotlight Effect (subtle on light mode) */}
                <div 
                    className="absolute inset-0 opacity-5 pointer-events-none" // Reduced opacity
                    style={{ 
                        background: `radial-gradient(circle at 10% 50%, ${primaryColor}40, transparent 50%)`,
                    }}
                />

                {/* --- Hero Content Grid (Split) --- */}
                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
                    
                    {/* LEFT: Text Content & CTAs (7/12 width on large screens) */}
                    <motion.div
                        className="lg:col-span-7 text-center lg:text-left"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        
                        {/* Tagline - High Contrast and Uppercase for Impact */}
                        <motion.p
                            // Adjusted contrast for light background
                            className="text-lg font-extrabold uppercase tracking-[0.3em] mb-4 text-gray-700"
                            style={{ color: secondaryColor }}
                            variants={itemVariants}
                        >
                            {tagline || 'Leading Digital Transformation'}
                        </motion.p>

                        {/* Main Title - Massive and Dynamic Coloring */}
                        <motion.h1
                            className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold leading-tight mb-6"
                            variants={itemVariants}
                        >
                            {renderHeadline(headline, primaryColor)}
                        </motion.h1>

                        {/* Description/Sub-text */}
                        <motion.p
                            // Adjusted contrast for light background
                            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0"
                            variants={itemVariants}
                        >
                            {description}
                        </motion.p>

                        {/* Call-to-Action Buttons - Prominent and Clear */}
                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
                            variants={itemVariants}
                        >
                            {/* Primary CTA: Glowing Button - Using standard <a> tag */}
                            <a
                                href="#contact"
                                className="inline-flex items-center gap-3 text-lg font-bold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                                style={{ 
                                    backgroundColor: primaryColor, 
                                    color: '#fff', 
                                    textShadow: '0 0 5px rgba(0,0,0,0.2)',
                                    // Custom glow on hover
                                    boxShadow: `0 0 0 3px ${primaryColor}00`,
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 0 15px ${primaryColor}, 0 0 0 3px ${primaryColor}80`}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = `0 0 0 3px ${primaryColor}00`}
                            >
                                <BoltIcon className="w-6 h-6" />
                                Start a Project Today
                            </a>
                            
                            {/* Secondary CTA: Ghost Button - Using standard <a> tag */}
                            <a
                                href="#portfolio"
                                className="inline-flex items-center gap-3 text-lg font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:bg-gray-100" // Light mode hover effect
                                style={{
                                    color: primaryColor,
                                    border: `2px solid ${primaryColor}80`,
                                }}
                            >
                                <ArrowRightIcon className="w-6 h-6" />
                                View Portfolio
                            </a>
                        </motion.div>

                        {/* Trust Signals Block */}
                        <motion.div
                            // Adjusted contrast for light background
                            className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 text-gray-500"
                            variants={itemVariants}
                        >
                            {reviewCount > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                className={`w-5 h-5 transition-colors duration-300 ${i < Math.floor(roundedRating) ? 'text-yellow-500' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {averageRating.toFixed(1)}/5
                                    </span>
                                    <span className="text-sm">
                                        from {reviewCount} happy clients
                                    </span>
                                </div>
                            )}
                            {awardsData.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <TrophyIcon className="w-5 h-5 text-yellow-500" />
                                    <span className="text-sm font-semibold text-gray-900">
                                        Award-Winning Design
                                    </span>
                                </div>
                            )}
                            {(reviewCount === 0 && awardsData.length === 0) && (
                                <div className="flex items-center gap-2">
                                    <UsersIcon className="w-5 h-5 text-indigo-500" />
                                    <span className="text-sm font-semibold text-gray-900">
                                        Trusted by 100+ Businesses
                                    </span>
                                </div>
                            )}
                        </motion.div>

                    </motion.div>

                    {/* RIGHT: Visual Element (5/12 width on large screens) */}
                    <div
                        className="lg:col-span-5 lg:flex justify-center relative mt-12 lg:mt-0"
                    >
                        <ImageCard productImageUrl={productImageUrl} primaryColor={primaryColor} />
                    </div>

                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
                    initial={{ y: -10, opacity: 0.5 }}
                    animate={{ y: 5, opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                >
                    {/* Adjusted color for light mode */}
                    <ArrowDownIcon className="w-6 h-6 text-gray-400 hover:text-gray-900 transition-colors duration-300" />
                </motion.div>

            </section>
        </AnimatePresence>
    );
}