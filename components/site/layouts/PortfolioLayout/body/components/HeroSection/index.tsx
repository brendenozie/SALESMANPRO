'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

 // Loader for next/image
 const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function HeroSection() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    themeSettings = {},
    heroSlides = [],
    testimonials = [],
    awards = [],
  } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#3b82f6';
  const secondaryColor = themeSettings.secondaryColor || '#2563eb';

  // Use first hero slide if exists
  const slide = heroSlides[0] || {};
  const {
    headline = `Welcome to ${name}`,
    subline = storeFormData.tagline || '',
    ctaText = 'Learn More',
    ctaLink = `/${slug}/#services`,
    imageUrl,
    productImageUrl,
  } = slide;

  // Determine image source: prefer productImageUrl, else imageUrl, else fallback
  const bgImageSrc = productImageUrl || imageUrl || '/placeholder-hero.jpg';

  // Compute average rating and count from testimonials
  const validTestimonials = testimonials.filter(t => typeof t.rating === 'number');
  const reviewCount = validTestimonials.length;
  const averageRating =
    reviewCount > 0
      ? validTestimonials.reduce((sum, t) => sum + (typeof t.rating === 'number' ? t.rating : 0), 0) / reviewCount
      : 0;

  // Round averageRating to nearest half
  const roundedRating = Math.round(averageRating * 2) / 2;

  return (
    <section className="bg-white dark:bg-gray-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 flex flex-col md:flex-row items-center justify-between gap-16">
        {/* Left Content */}
        <div className="flex-1 max-w-xl text-center md:text-left space-y-6">
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {renderHeadline(headline,primaryColor)}
          </motion.h1>

          {subline && (
            <motion.p
              className="text-gray-600 dark:text-gray-300 text-lg"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              {subline}
            </motion.p>
          )}

          <motion.div
            className="flex flex-wrap justify-center md:justify-start gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <a
              href={ctaLink}
              className="font-medium px-6 py-3 rounded-full transition"
              style={{
                backgroundColor: primaryColor,
                color: '#fff',
              }}
            >
              {ctaText}
            </a>
          </motion.div>

          {/* Trust Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
              <span className="text-sm text-gray-500 dark:text-gray-400">Rated</span>
              <div className="flex gap-1">
                {/* Render full and half stars */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const idx = i + 1;
                  if (idx <= Math.floor(roundedRating)) {
                    return <StarIcon key={i} className="w-5 h-5 text-yellow-400" />;
                  }
                  if (idx === Math.ceil(roundedRating) && roundedRating % 1 !== 0) {
                    // half star: using StarIcon but with half-opacity
                    return (
                      <StarIcon
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        style={{ opacity: 0.5 }}
                      />
                    );
                  }
                  return <StarIcon key={i} className="w-5 h-5 text-gray-300 dark:text-gray-600" />;
                })}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {reviewCount} review{reviewCount > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
              {awards.map((award, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow"
                >
                  {award.iconUrl ? (
                    <Image
                      src={award.iconUrl}
                      loader={loader}
                      alt={award.name}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-sm">🏆</span>
                  )}
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {award.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Content: Image */}
        <motion.div
          className="flex-1 w-full max-w-md md:max-w-lg relative"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 h-[360px] md:h-[460px] lg:h-[520px]">
            <Image
              src={bgImageSrc}
              loader={loader}
              alt={headline}
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>
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