'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { BriefcaseIcon, UsersIcon, ChartBarIcon, StarIcon, ArrowRightIcon } from '@heroicons/react/24/outline'; // Updated icons for stats and CTA

// Type definitions for clarity
interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
}

interface HeroSlide {
  imageUrl?: string;
  productImageUrl?: string;
}

interface Stat {
  label: string;
  value: string | number;
}

interface StoreFormData {
  name: string;
  tagline?: string;
  description?: string;
  themeSettings?: ThemeSettings;
  stats?: Stat[];
  heroSlides?: HeroSlide[];
  bannerUrl?: string;
  logoUrl?: string;
  slug: string;
  contactEmail?: string;
}

// Image loader for next/image
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AboutSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };
  // Set a default resume URL, or make it configurable in storeFormData
  const resumeUrl: string | null = "https://example.com/your-resume.pdf"; // Replace with actual URL or make dynamic

  const {
    name,
    tagline,
    description,
    themeSettings = {},
    stats = [],
    heroSlides = [],
    bannerUrl,
    logoUrl,
    slug,
    contactEmail,
  } = storeFormData;

  // Ensure primary and secondary colors have defaults
  const primaryColor = themeSettings.primaryColor || '#007bff'; // A more vibrant blue default
  const secondaryColor = themeSettings.secondaryColor || '#6c757d'; // A complementary gray default

  // Content for the section
  const title = name ? `About ${name}` : 'About Me';
  const subtitle = tagline || 'Dedicated to Excellence and Innovation';
  const aboutText =  description ||   `I am a passionate professional committed to crafting exceptional experiences and delivering innovative solutions. With a relentless focus on quality and a deep understanding of modern challenges, I help individuals and businesses achieve their full potential. My work is driven by curiosity, precision, and a genuine desire to make a lasting impact.`;

  // Stats array fallback with meaningful defaults and icons
  const defaultStatsData: Stat[] = [
    { label: 'Years Experience', value: '10+' },
    { label: 'Clients Served', value: '250+' },
    { label: 'Projects Completed', value: '300+' },
    { label: 'Awards & Recognitions', value: '15' },
  ];
  const statsData: Stat[] = Array.isArray(stats) && stats.length > 0 ? stats : defaultStatsData;

  // Image source priority
  const slide = heroSlides[0] || {};
  const imgSrc =
    slide.productImageUrl ||
    slide.imageUrl ||
    bannerUrl ||
    logoUrl ||
    '/placeholder-about.jpg'; // Fallback image path

  // CTA links
  const contactHref = contactEmail ? `mailto:${contactEmail}` : slug ? `/${slug}/contact` : '/contact';
  const resumeHref = resumeUrl;

  // Framer Motion variants
  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 100,
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', damping: 10, stiffness: 100, delay: 0.3 } },
  };

  return (
    <section id="about" className="relative overflow-hidden bg-gray-50 dark:bg-gray-950 py-24 md:py-32">
      {/* Background Gradients/Shapes - Larger, softer, and more integrated */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 15% 15%, ${primaryColor} 0%, transparent 40%),
                       radial-gradient(circle at 85% 85%, ${secondaryColor} 0%, transparent 40%)`,
        }}
      />
      {/* Subtle Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'url("/assets/dot-grid-light.svg")', backgroundSize: '20px 20px' }}></div>


      <div className="relative max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
        {/* Image Section - Left (or Right on smaller screens) */}
        <motion.div
          className="flex justify-center lg:justify-start"
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="relative w-full max-w-md h-[420px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500 ease-in-out group">
            <Image
              src={imgSrc}
              loader={imageLoader}
              alt={name ? `Portrait of ${name}` : 'About Image'}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500" // Image scales on container hover
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
            {/* Dark gradient overlay for visual depth and text readability if any */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {/* Name/Branding Badge Overlay */}
            {name && (
              <motion.div
                className="absolute bottom-6 left-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <StarIcon className="w-5 h-5 text-yellow-500" />
                {name}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Text Section - Right (or Left on smaller screens) */}
        <motion.div
          className="flex-1 text-center lg:text-left pt-8 lg:pt-0"
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight drop-shadow-sm"
            variants={itemVariants}
          >
            {title}
            <span
              className="block w-24 h-2 mt-3 rounded-full mx-auto lg:mx-0"
              style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
            />
          </motion.h2>

          {subtitle && (
            <motion.h3
              className="text-xl md:text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-300"
              variants={itemVariants}
            >
              {subtitle}
            </motion.h3>
          )}

          {aboutText && (
            <motion.p
              className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8"
              variants={itemVariants}
            >
              {aboutText}
            </motion.p>
          )}

          {/* Stats Grid - More visual, with icons */}
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {statsData.map(({ label, value }, idx) => (
              <motion.div
                key={idx}
                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                variants={itemVariants}
              >
                {/* Optional: Add an icon based on label or a default */}
                {idx === 0 && <BriefcaseIcon className="w-6 h-6 mb-2" style={{ color: primaryColor }} />}
                {idx === 1 && <UsersIcon className="w-6 h-6 mb-2" style={{ color: primaryColor }} />}
                {idx === 2 && <ChartBarIcon className="w-6 h-6 mb-2" style={{ color: primaryColor }} />}
                {idx === 3 && <StarIcon className="w-6 h-6 mb-2" style={{ color: primaryColor }} />}

                <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                  {value}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  {label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons - Premium and clear */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <motion.a
              href={contactHref}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-lg font-semibold text-white shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl"
              style={{
                background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              }}
              variants={itemVariants}
            >
              Get in Touch
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </motion.a>
            {resumeHref && (
              <motion.a
                href={resumeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full text-lg font-semibold border-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:bg-white/10 dark:hover:bg-gray-800/20"
                style={{ borderColor: primaryColor, color: primaryColor }}
                variants={itemVariants}
              >
                Download Resume
                <BriefcaseIcon className="ml-2 w-5 h-5" />
              </motion.a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}