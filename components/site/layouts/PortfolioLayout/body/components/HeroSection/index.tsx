'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Use Link for internal navigation
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { SparklesIcon, TrophyIcon } from '@heroicons/react/24/outline'; // Adding a generic trophy icon
import { useStoreContext } from '@/contexts/StoreContext'; // Assuming this context exists and provides necessary data

// Type definitions for clarity (you might have these globally or in a separate types file)
interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
}

interface HeroSlide {
  headline?: string;
  subline?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  productImageUrl?: string;
}

interface Testimonial {
  rating?: number;
  // Add other testimonial properties if needed, e.g., author, text
}

interface Award {
  name: string;
  iconUrl?: string;
  // Add other award properties if needed
}

interface StoreFormData {
  name: string;
  slug: string;
  tagline?: string;
  bannerUrl?: string;
  themeSettings?: ThemeSettings;
  heroSlides?: HeroSlide[];
  testimonials?: Testimonial[];
  awards?: Award[];
}

// Loader for next/image
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function HeroSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData }; // Type assertion
  const {
    name,
    slug,
    bannerUrl,
    themeSettings = {},
    heroSlides = [],
    testimonials = [],
    awards = [],
    
  } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#3b82f6'; // Default Tailwind blue-500
  const secondaryColor = themeSettings.secondaryColor || '#2563eb'; // Default Tailwind blue-600

  // Use first hero slide if exists
  const slide = heroSlides[0] || {};
  const {
    headline = `Welcome to ${name}`,
    subline = storeFormData.tagline || 'Crafting exceptional experiences.',
    ctaText = 'Discover More',
    ctaLink = `/${slug}/#services`, // Ensure this links correctly
    imageUrl,
    productImageUrl,
  } = slide;

  // Determine image source: prefer productImageUrl, else imageUrl, else fallback
  const bgImageSrc = bannerUrl || productImageUrl || imageUrl || '/placeholder-hero.jpg';

  // Compute average rating and count from testimonials
  const validTestimonials = testimonials.filter(t => typeof t.rating === 'number');
  const reviewCount = validTestimonials.length;
  const averageRating =
    reviewCount > 0
      ? validTestimonials.reduce((sum, t) => sum + (typeof t.rating === 'number' ? t.rating : 0), 0) / reviewCount
      : 0;

  // Round averageRating to nearest half
  const roundedRating = Math.round(averageRating * 2) / 2;

  // Framer Motion variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 relative overflow-hidden py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center justify-between gap-16">
        {/* Left Content: Headline, Subline, CTA, Trust Signals */}
        <motion.div
          className="flex-1 max-w-xl text-center md:text-left space-y-6 z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white drop-shadow-sm"
            variants={itemVariants}
          >
            {renderHeadline(headline, primaryColor)}
          </motion.h1>

          {subline && (
            <motion.p
              className="text-gray-700 dark:text-gray-300 text-lg md:text-xl leading-relaxed"
              variants={itemVariants}
            >
              {subline}
            </motion.p>
          )}

          <motion.div
            className="flex flex-wrap justify-center md:justify-start gap-4 pt-4"
            variants={itemVariants}
          >
            <Link
              href={ctaLink}
              className="px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              style={{
                backgroundColor: primaryColor,
                color: '#fff',
                // Adding a subtle gradient for depth
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {ctaText}
            </Link>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 mt-8">
            {/* Trust Rating */}
            {reviewCount > 0 && (
              <motion.div
                className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-100 dark:border-gray-700"
                variants={itemVariants}
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rated</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const idx = i + 1;
                    return (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          idx <= Math.floor(roundedRating)
                            ? 'text-yellow-400'
                            : idx === Math.ceil(roundedRating) && roundedRating % 1 !== 0
                            ? 'text-yellow-400 opacity-50'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {reviewCount} review{reviewCount > 1 ? 's' : ''}
                </span>
              </motion.div>
            )}

            {/* Awards */}
            {awards.length > 0 && (
              <motion.div
                className="flex flex-wrap justify-center md:justify-start gap-3"
                variants={itemVariants}
              >
                {awards.map((award, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-100 dark:border-gray-700"
                  >
                    {award.iconUrl ? (
                      <Image
                        src={award.iconUrl}
                        loader={imageLoader}
                        alt={award.name}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    ) : (
                      <TrophyIcon className="w-5 h-5 text-yellow-500" /> // Using Heroicons Trophy
                    )}
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {award.name}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right Content: Image with dynamic background shape */}
        <motion.div
          className="flex-1 w-full max-w-md md:max-w-lg lg:max-w-xl relative min-h-[350px] md:min-h-[450px] lg:min-h-[550px] flex items-center justify-center z-0"
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Abstract background shape (optional) */}
          <div
            className="absolute inset-0 rounded-full md:rounded-[40%] blur-3xl opacity-30 transform -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0"
            style={{
              background: `radial-gradient(circle at 70% 30%, ${primaryColor}, transparent 50%)`,
            }}
          ></div>
          <div
            className="absolute inset-0 rounded-full md:rounded-[30%] blur-3xl opacity-20 transform translate-x-1/2 translate-y-1/2 md:translate-x-0 md:translate-y-0"
            style={{
              background: `radial-gradient(circle at 30% 70%, ${secondaryColor}, transparent 50%)`,
            }}
          ></div>

          <div className="relative w-full h-[320px] md:h-[420px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 transform rotate-3 hover:rotate-0 transition-transform duration-500 ease-in-out z-10">
            <Image
              src={bgImageSrc}
              loader={imageLoader}
              alt={headline}
              fill
              priority // Prioritize loading for LCP
              className="object-cover object-center"
            />
          </div>
        </motion.div>
      </div>
      {/* Optional: Add a subtle background pattern or shape for extra visual interest */}
      <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10" style={{ backgroundImage: 'url("/assets/diagonal-lines.svg")', backgroundSize: '30px 30px' }}></div>
    </section>
  );
}

// Helper to highlight last word or use {primary} token
function renderHeadline(headline: string, primaryColor: string) {
  if (headline.includes('{primary}')) {
    const parts = headline.split('{primary}');
    return parts.map((part, idx) =>
      idx % 2 === 1 ? (
        <span key={idx} style={{ color: primaryColor }}>
          {part}
        </span>
      ) : (
        <React.Fragment key={idx}>{part}</React.Fragment>
      )
    );
  }
  const match = headline.match(/(.*)\s+([\w’'-]+)$/);
  if (match) {
    return (
      <>
        <span>{match[1]} </span>
        <span style={{ color: primaryColor }}>{match[2]}</span>
      </>
    );
  }
  return <>{headline}</>;
}