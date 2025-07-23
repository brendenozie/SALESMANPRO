'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { SparklesIcon, TrophyIcon, ArrowRightIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Type definitions (as provided in your original code)
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
}

interface Award {
  name: string;
  iconUrl?: string;
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

export default function HeroSectionAsymmetrical() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };
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

  const slide = heroSlides[0] || {};
  const {
    headline = `Welcome to ${name}`,
    subline = storeFormData.tagline || 'Crafting exceptional experiences.',
    ctaText = 'Discover More',
    ctaLink = `/${slug}/#services`,
    imageUrl,
    productImageUrl,
  } = slide;

  const bgImageSrc = bannerUrl || productImageUrl || imageUrl || '/placeholder-hero.jpg';

  const validTestimonials = testimonials.filter(t => typeof t.rating === 'number');
  const reviewCount = validTestimonials.length;
  const averageRating =
    reviewCount > 0
      ? validTestimonials.reduce((sum, t) => sum + (typeof t.rating === 'number' ? t.rating : 0), 0) / reviewCount
      : 0;

  const roundedRating = Math.round(averageRating * 2) / 2;

  // Framer Motion variants
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
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const ctaButtonVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: 0.5,
      },
    },
    hover: {
      scale: 1.03,
      boxShadow: `0 10px 25px ${primaryColor}40`,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.98 },
  };

  const imageRevealVariants = {
    hidden: { opacity: 0, x: 100, rotate: 5, scale: 0.9 },
    show: {
      opacity: 1,
      x: 0,
      rotate: -3, // Slightly rotate for a dynamic feel
      scale: 1,
      transition: { delay: 0.4, duration: 0.8, ease: "easeOut" }
    },
    hover: {
      rotate: 0, // Straighten on hover
      scale: 1.02,
      boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <section className="relative overflow-hidden py-24 md:py-36 bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Background radial gradient */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        style={{ background: `radial-gradient(circle at center, ${primaryColor}20, ${secondaryColor}10, transparent 70%)` }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16 relative z-10">
        {/* Left Content: Headline, Subline, CTA, Trust Signals */}
        <motion.div
          className="flex-1 max-w-xl text-center md:text-left space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight text-gray-900 dark:text-white drop-shadow-sm"
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
            variants={ctaButtonVariants}
            initial="hidden"
            animate="show"
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              href={ctaLink}
              className="px-8 py-3 rounded-full text-lg font-semibold shadow-xl transition-all duration-300 ease-in-out flex items-center gap-2"
              style={{
                backgroundColor: primaryColor,
                color: '#fff',
                // backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {ctaText}
              <ChevronRightIcon className="w-5 h-5 ml-1" /> {/* Modernized arrow */}
            </Link>
          </motion.div>

          {/* Trust Signals Block - Combined and more visually cohesive */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 mt-10"
            variants={itemVariants}
          >
            {reviewCount > 0 && (
              <div className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex gap-0.5">
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
                <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
                  {averageRating.toFixed(1)}/5
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({reviewCount} reviews)
                </span>
              </div>
            )}

            {awards.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {awards.map((award, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700"
                  >
                    {award.iconUrl ? (
                      <Image
                        src={award.iconUrl}
                        loader={imageLoader}
                        alt={award.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    ) : (
                      <TrophyIcon className="w-6 h-6 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {award.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Right Content: Image with dynamic background shape */}
        <motion.div
          className="flex-1 w-full max-w-2xl relative min-h-[400px] md:min-h-[550px] lg:min-h-[650px] flex items-center justify-center md:ml-16"
          variants={imageRevealVariants}
          initial="hidden"
          whileInView="show"
          whileHover="hover"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Abstract background elements behind the image */}
          <div
            className="absolute top-0 right-0 w-full h-full rounded-3xl opacity-20 z-0"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              transform: 'scale(1.05) rotate(5deg)',
              filter: 'blur(40px)',
            }}
          ></div>
           <div
            className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full mix-blend-multiply filter blur-2xl opacity-30"
            style={{ background: primaryColor }}
          ></div>

          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-3xl border border-gray-200 dark:border-gray-800 z-10">
            <Image
              src={bgImageSrc}
              loader={imageLoader}
              alt={headline}
              fill
              priority
              className="object-cover object-center"
            />
          </div>
        </motion.div>
      </div>

      {/* Global CSS for custom animations and shadow */}
      <style jsx global>{`
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0, 0, 0, 0.1);
        }
        .dark .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 0, 0, 0.2);
        }
      `}</style>
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