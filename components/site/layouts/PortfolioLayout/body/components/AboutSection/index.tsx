'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import {
  BriefcaseIcon,
  UsersIcon,
  ChartBarIcon,
  StarIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

// Type definitions for clarity
interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
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

// Fallback data for a standalone preview
const storeData = {
  name: 'John Doe',
  tagline: 'Dedicated to Excellence and Innovation',
  description: `I am a passionate professional committed to crafting exceptional experiences and delivering innovative solutions. With a relentless focus on quality and a deep understanding of modern challenges, I help individuals and businesses achieve their full potential. My work is driven by curiosity, precision, and a genuine desire to make a lasting impact.`,
  themeSettings: {
    primaryColor: '#6366F1', // A clean, modern blue-purple
    secondaryColor: '#EC4899', // A vibrant pink for accent
    accentColor: '#F97316', // A warm orange
  },
  stats: [
    { label: 'Years Experience', value: '10+' },
    { label: 'Clients Served', value: '250+' },
    { label: 'Projects Completed', value: '300+' },
    { label: 'Awards', value: '15' },
  ],
  heroSlides: [{ productImageUrl: 'https://images.unsplash.com/photo-1519085360753-af0f19c307d8?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
  bannerUrl: null,
  logoUrl: null,
  slug: 'john-doe',
  contactEmail: 'contact@example.com',
};

// Next.js Image Loader
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function AboutSectionLight() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };

  const {
    name,
    tagline,
    description,
    themeSettings = {},
    stats = [],
    heroSlides = [],
    slug,
    contactEmail,
  } = storeFormData || storeData;

  const primaryColor = themeSettings.primaryColor || '#6366F1';
  const secondaryColor = themeSettings.secondaryColor || '#EC4899';
  const accentColor = themeSettings.accentColor || '#F97316';

  const title = name || 'John Doe';
  const aboutText = description || storeData.description;

  const defaultStatsData = [
    { label: 'Years Experience', value: '10+' },
    { label: 'Clients Served', value: '250+' },
    { label: 'Projects Completed', value: '300+' },
    { label: 'Awards', value: '15' },
  ];
  const statsData = Array.isArray(stats) && stats.length > 0 ? stats : defaultStatsData;

  const imgSrc = heroSlides[0]?.productImageUrl || heroSlides[0]?.imageUrl || storeData.heroSlides[0]?.productImageUrl;

  const contactHref = contactEmail ? `mailto:${contactEmail}` : slug ? `/${slug}/contact` : '/contact';

  return (
    <AnimatePresence>
      <section id="about" className="relative overflow-hidden bg-gray-50 text-gray-900 py-24 md:py-32">
        {/* Dynamic Background Shapes */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute -top-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply opacity-10 filter blur-3xl"
            style={{ backgroundColor: primaryColor }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear', repeatType: 'reverse' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full mix-blend-multiply opacity-8 filter blur-3xl"
            style={{ backgroundColor: secondaryColor }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.08 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear', repeatType: 'reverse' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Image with "floating" card effect */}
          <motion.div
            className="relative w-full max-w-md h-[550px] md:h-[650px] mx-auto lg:mx-0 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-200 transition-all duration-500 group"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Image
              src={imgSrc || storeData.heroSlides[0].productImageUrl}
              alt={`Portrait of ${title}`}
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-105 transition-transform duration-500"
              loader={loader}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-200/60 to-transparent" />
          </motion.div>

          {/* Right Column: Text Content and Stats Grid */}
          <motion.div
            className="flex flex-col justify-center space-y-6"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.p
              className="uppercase tracking-widest text-sm font-semibold text-gray-600"
              variants={itemVariants}
            >
              Who We Are
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-sm text-gray-900"
              variants={itemVariants}
            >
              Discover <span style={{ color: primaryColor }}>{title}</span>
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-prose"
              variants={itemVariants}
            >
              {aboutText}
            </motion.p>

            {/* Stats Grid - Cleaner, horizontal layout */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4"
              variants={sectionVariants}
            >
              {statsData.map(({ label, value }, idx) => (
                <motion.div
                  key={idx}
                  className="flex flex-col items-start"
                  variants={statVariants}
                >
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: primaryColor }}>
                    {value}
                  </p>
                  <p className="text-sm uppercase tracking-widest text-gray-500 mt-1">
                    {label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Call to Action - More prominent button */}
            <motion.div variants={itemVariants} className="mt-8">
              <a
                href={contactHref}
                className="inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-semibold shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: accentColor,
                  color: 'white',
                  boxShadow: `0 8px 25px ${accentColor}44`,
                }}
              >
                Learn More About Us
                <ArrowRightIcon className="ml-3 w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}