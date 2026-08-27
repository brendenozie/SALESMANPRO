'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon, BriefcaseIcon, ChevronDownIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- MOCK INTERFACES & DATA (Kept for completeness) ---
interface HeroSlide {
    headline: string;
    subline: string;
    imageUrl: string;
    ctaPrimaryLink: string;
    ctaSecondaryLink: string;
    ctaPrimaryText: string;
    category?: string;
    videoSlug?: string;
}

const fallbackSlide: HeroSlide = {
    headline: 'Driving Digital Transformation with Intelligent Solutions',
    subline: 'Empower your enterprise with scalable cloud technology and next-generation AI analytics designed for speed and reliability.',
    imageUrl: 'https://images.unsplash.com/photo-1517430030088-7510be1492dd?q=80&w=2670&auto=format&fit=crop', // Professional, blue-toned image
    ctaPrimaryLink: '/contact/demo',
    ctaSecondaryLink: '/about-us/solutions',
    ctaPrimaryText: 'Request a Demo',
    category: 'Future of Tech',
    videoSlug: 'intro-to-platform-v1', // Optional video link for consistency
};

interface CorporateHeroProps {
    slideData?: HeroSlide[];
    onPlay?: (slide: HeroSlide) => void; 
}
// --- End Mock Data ---


// --- Helper: Image Loader (Kept Consistent) ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;


/**
 * Transformed Hero Section for Corporate/Editorial Website (Light Mode)
 * Displays key value proposition with a professional visual and Indigo-themed CTAs.
 */
export default function CorporateHeroSection({ slideData, onPlay }: CorporateHeroProps) {
    const router = useRouter();
    // Use prop data or fallback data
    const slide = (slideData && slideData[0]) || fallbackSlide;

    const handlePrimaryClick = () => {
        router.push(slide.ctaPrimaryLink);
    };

    const handleSecondaryClick = () => {
        if (slide.videoSlug && onPlay) {
            onPlay(slide); // Assuming onPlay handles modal/video launch
        } else {
            router.push(slide.ctaSecondaryLink); // Navigate to a solutions/details page
        }
    };

    return (
        <section
            // Changed to a light base background and dark default text
            className="relative h-screen w-full bg-white text-gray-900 flex items-center justify-center overflow-hidden"
            role="banner"
            aria-label="Key Value Proposition"
        >
            {/* Background Image/Video Placeholder */}
            {slide.imageUrl && (
                <Image
                    src={slide.imageUrl}
                    alt={slide.headline || "Featured Solution"}
                    loader={loader}
                    fill
                    // Set image to be subtle, desaturated, and slightly blurred for a professional feel
                    className="absolute inset-0 object-cover object-center w-full h-full transition-transform duration-500 ease-in-out" 
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                />
            )}

            {/* Gradient Overlay for light mode readability (White Mask from the left) */}
            <div className="absolute inset-0 bg-white/30 blur-sm"></div>

            {/* Content Overlay */}
            <motion.div
                // Content is placed over the white/light part of the gradient
                className="relative z-10 text-center px-6 md:px-12 max-w-6xl space-y-6" 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            >
                {slide.category && ( // Category badge now uses light theme colors
                    <motion.span
                        // Light-themed badge: subtle background, strong text
                        className="inline-flex items-center text-sm md:text-base font-bold bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <BriefcaseIcon className="h-5 w-5 mr-2" />
                        {slide.category}
                    </motion.span>
                )}

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold drop-shadow-lg leading-tight text-gray-900">
                    {slide.headline}
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-4xl text-gray-700">
                    {slide.subline}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center mx-auto gap-4 pt-4">
                    {/* Primary CTA (Solid Indigo) */}
                    <motion.button
                        onClick={handlePrimaryClick}
                        whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(99, 102, 241, 0.7)" }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        // Solid Indigo button, great contrast on light background
                        className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-lg shadow-xl transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 text-xl"
                        aria-label={slide.ctaPrimaryText}
                    >
                        {slide.ctaPrimaryText}
                        <ArrowRightIcon className="h-6 w-6" />
                    </motion.button>

                    {/* Secondary CTA (Outlined Indigo) */}
                    <motion.button
                        onClick={handleSecondaryClick}
                        whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)" }} // Subtle dark shadow
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        // Outlined button for secondary action
                        className="inline-flex items-center gap-3 border-2 border-indigo-500 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold py-4 px-10 rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 text-xl"
                        aria-label={slide.videoSlug ? "Watch Introduction Video" : "Learn About Our Solutions"}
                    >
                        {slide.videoSlug ? (
                            <>
                                <PlayCircleIcon className="h-6 w-6" />
                                Watch Video
                            </>
                        ) : (
                            <>
                                <InformationCircleIcon className="h-6 w-6" />
                                Learn More
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Scroll Indicator (Dark mode colors for contrast against white) */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} 
            >
                <ChevronDownIcon className="h-8 w-8 text-gray-500 animate-bounce group-hover:text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors">Scroll to Solutions</span>
            </motion.div>
        </section>
    );
}