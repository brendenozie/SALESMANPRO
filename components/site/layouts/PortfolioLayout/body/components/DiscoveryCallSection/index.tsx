'use client';

import React from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PhoneIcon, CalendarDaysIcon, ArrowRightIcon } from '@heroicons/react/24/outline'; // Importing icons

// Define the shape of discoveryCall data and other props for clarity
interface DiscoveryCallContent {
  headline?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string; // Adding a specific accent color for highlights if needed
}

interface StoreFormData {
  name?: string;
  slug?: string;
  themeSettings?: ThemeSettings;
  contactEmail?: string;
  contactPhone?: string;
  // If discoveryCall content comes from storeFormData directly:
  discoveryCall?: DiscoveryCallContent;
}

export default function DiscoveryCallSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };

  const {
    name,
    slug,
    themeSettings = {},
    contactEmail,
    contactPhone,
    discoveryCall = {}, // Use default empty object if not provided
  } = storeFormData;

  // Theme colors
  const primaryColor = themeSettings.primaryColor || '#007bff'; // A vibrant blue default
  const secondaryColor = themeSettings.secondaryColor || '#6c757d'; // A complementary gray default
  const accentColor = themeSettings.accentColor || '#ffc107'; // A vibrant yellow/orange for highlights

  // Fallbacks for content – now more compelling
  const defaultHeadline = `Ready to Unlock Your ${name ? `Full Potential as a ${name}` : 'Exceptional Business Potential'}?`;
  const defaultDescription =
    'Take the first step towards measurable growth and lasting success. Schedule a free, no-obligation discovery call to discuss your unique goals and how we can help you achieve them.';
  const defaultCtaText = 'Schedule Your Free Discovery Call';

  const title = discoveryCall.headline || defaultHeadline;
  const subtitle = discoveryCall.description || defaultDescription;
  const ctaText = discoveryCall.ctaText || defaultCtaText;

  // Determine button link: prioritize specific link, then contact page, then mailto, then tel
  let ctaLink = discoveryCall.ctaLink || '';
  if (!ctaLink) {
    if (slug) {
      ctaLink = `/${slug}/contact`; // Prefer internal contact page
    } else if (contactEmail) {
      ctaLink = `mailto:${contactEmail}`; // Fallback to email
    } else if (contactPhone) {
      ctaLink = `tel:${contactPhone}`; // Fallback to phone
    } else {
      ctaLink = '#'; // Last resort, no functional link
    }
  }

  // Framer Motion variants
  const containerVariants = {
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

  return (
    <motion.section
      className="relative py-16 md:py-24 px-6 lg:px-12 rounded-3xl text-center mx-auto max-w-7xl my-16 overflow-hidden shadow-2xl"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, // Vibrant gradient background
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {/* Background radial gradient dots for dynamic feel */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 10% 20%, #ffffff80 0%, transparent 20%),
                       radial-gradient(circle at 90% 80%, #ffffff80 0%, transparent 20%)`,
        }}
      />
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: 'url("/assets/diagonal-lines.svg")', backgroundSize: '30px 30px' }}></div>


      <div className="relative z-10">
        <motion.h2
          className="text-3xl md:text-5xl font-extrabold leading-tight text-white mb-6 drop-shadow-lg"
          variants={itemVariants}
        >
          {/* Intelligent highlighting based on specific patterns or just the last significant word */}
          {title.includes('{accent}') ? (
            // If explicit {accent} tag is used
            title.split('{accent}').map((part: string, idx: number) => (
              idx % 2 === 1 ? (
                <span key={idx} style={{ color: accentColor }}>
                  {part}
                </span>
              ) : (
                <React.Fragment key={idx}>{part}</React.Fragment>
              )
            ))
          ) : (() => {
            // Default: highlight the last prominent word (e.g., "Potential", "Success")
            const words = title.split(' ');
            if (words.length > 1) {
              const lastWord = words[words.length - 1];
              const rest = words.slice(0, -1).join(' ');
              return (
                <>
                  {rest}{' '}
                  <span style={{ color: accentColor }}>
                    {lastWord.replace(/[?!.,]$/, '')}
                  </span>
                  {lastWord.match(/[?!.,]$/) && lastWord.match(/[?!.,]$/)?.[0]}
                </>
              );
            }
            return title;
          })()}
        </motion.h2>

        {subtitle && (
          <motion.p
            className="mt-4 text-white/90 max-w-3xl mx-auto text-base md:text-xl leading-relaxed opacity-90"
            variants={itemVariants}
          >
            {subtitle}
          </motion.p>
        )}

        <motion.div variants={itemVariants}>
          {ctaLink ? (
            <Link
              href={ctaLink}
              className="mt-10 inline-flex items-center justify-center px-10 py-4 rounded-full text-xl font-bold text-gray-900 bg-white shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:ring-4 hover:ring-white/50 focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              <CalendarDaysIcon className="w-6 h-6 mr-3" />
              {ctaText}
              <ArrowRightIcon className="w-5 h-5 ml-3" />
            </Link>
          ) : (
            <div className="mt-10 text-white/70 text-lg">
              Contact us directly: {contactEmail && <a href={`mailto:${contactEmail}`} className="underline hover:text-white">{contactEmail}</a>}
              {contactEmail && contactPhone && ' or '}
              {contactPhone && <a href={`tel:${contactPhone}`} className="underline hover:text-white">{contactPhone}</a>}
              {!contactEmail && !contactPhone && 'Please configure a contact method.'}
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}