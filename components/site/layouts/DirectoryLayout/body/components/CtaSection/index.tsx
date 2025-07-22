'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Loader for next/image - assuming it's globally available or passed
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

interface HeroCtaSectionProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonHref?: string;
  imageUrl?: string;
  imageAlt?: string;
  variant?: 'left' | 'right'; // Image position
  bgColor?: string; // Custom background color/gradient for flexibility
  textColor?: string; // Custom text color
}

export default function HeroCtaSection({
  title = 'Unlock a World of Local Services',
  subtitle = 'Discover top-rated businesses, book appointments, and connect with professionals in your community—all in one place.',
  buttonLabel = 'Explore Services',
  buttonHref = '/explore',
  imageUrl = '/images/cta-hero-main.webp', // Updated placeholder image
  imageAlt = 'Smiling person using a mobile app to find local services',
  variant = 'right', // Default image on the right
  bgColor = 'bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900', // Vibrant gradient
  textColor = 'text-white',
}: HeroCtaSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: 'easeOut' } },
  };

  return (
    <motion.section
      className={`relative ${bgColor} ${textColor} py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-3xl shadow-xl mx-auto max-w-7xl`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div
        className={`flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16 ${
          variant === 'left' ? 'md:flex-row-reverse' : ''
        }`}
      >
        {/* Content Section */}
        <div className="md:w-1/2 text-center md:text-left z-10">
          <motion.h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4" variants={itemVariants}>
            {title}
          </motion.h2>
          <motion.p className="text-lg sm:text-xl opacity-90 mb-8 max-w-prose mx-auto md:mx-0" variants={itemVariants}>
            {subtitle}
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link
              href={buttonHref}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              {buttonLabel}
              <svg
                className="ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* Image Section */}
        <motion.div className="md:w-1/2 relative h-64 sm:h-80 md:h-96 w-full max-w-md mx-auto md:mx-0 rounded-3xl overflow-hidden shadow-2xl z-0" variants={imageVariants}>
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover object-center"
            loader={loader}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority // Prioritize loading for a hero section image
          />
          {/* Subtle gradient overlay on image for visual depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </motion.div>
      </div>
      {/* Optional: Abstract shapes for visual interest */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
    </motion.section>
  );
}