'use client';

import React from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDaysIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface DiscoveryCallContent {
  headline?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

interface StoreFormData {
  name?: string;
  slug?: string;
  themeSettings?: ThemeSettings;
  contactEmail?: string;
  contactPhone?: string;
  discoveryCall?: DiscoveryCallContent;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 16,
    },
  },
};

export default function DiscoveryCallSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };

  const {
    name,
    slug,
    themeSettings = {},
    contactEmail,
    contactPhone,
    discoveryCall = {},
  } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#000000';

  const defaultHeadline = `Ready to Unlock Your ${name ? `Full Potential as a ${name}` : 'Exceptional Business Potential'}?`;
  const defaultDescription =
    'Take the first step towards measurable growth and lasting success. Schedule a free, no-obligation discovery call to discuss your unique goals and how we can help you achieve them.';
  const defaultCtaText = 'Schedule Your Free Discovery Call';

  const title = discoveryCall.headline || defaultHeadline;
  const subtitle = discoveryCall.description || defaultDescription;
  const ctaText = discoveryCall.ctaText || defaultCtaText;

  let ctaLink = discoveryCall.ctaLink || '';
  if (!ctaLink) {
    if (slug) {
      ctaLink = `/${slug}/contact`;
    } else if (contactEmail) {
      ctaLink = `mailto:${contactEmail}`;
    } else if (contactPhone) {
      ctaLink = `tel:${contactPhone}`;
    } else {
      ctaLink = '#';
    }
  }

  return (
    <AnimatePresence>
      <section className="relative py-20 lg:py-28 px-6 lg:px-8 bg-white text-slate-900 overflow-hidden border-b border-slate-100">
        
        {/* Minimal Wire Grid Background Sync */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Architectural Framing Box Container */}
          <motion.div
            className="w-full bg-slate-900 text-white rounded-2xl border border-slate-800 py-16 px-6 sm:px-12 lg:px-20 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-xl"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Subtle Inner Micro Wire Grid for depth */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

            {/* Minimal Tagline Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/5 border border-white/10 mb-6 relative z-10"
              variants={itemVariants}
            >
              <SparklesIcon className="w-4 h-4 text-white/80" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                Action Engagement Node
              </p>
            </motion.div>

            {/* Component Headline */}
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-4xl leading-[1.15] text-white relative z-10"
              variants={itemVariants}
            >
              {title.includes('{accent}') ? (
                title.split('{accent}').map((part: string, idx: number) => (
                  idx % 2 === 1 ? (
                    <span key={idx} style={{ color: primaryColor }}>
                      {part}
                    </span>
                  ) : (
                    <React.Fragment key={idx}>{part}</React.Fragment>
                  )
                ))
              ) : (() => {
                const words = title.split(' ');
                if (words.length > 1) {
                  const lastWord = words[words.length - 1];
                  const rest = words.slice(0, -1).join(' ');
                  return (
                    <>
                      {rest}{' '}
                      <span style={{ color: primaryColor }}>
                        {lastWord.replace(/[?!.,]$/, '')}
                      </span>
                      {lastWord.match(/[?!.,]$/) && lastWord.match(/[?!.,]$/)?.[0]}
                    </>
                  );
                }
                return title;
              })()}
            </motion.h2>

            {/* Description Subtitle */}
            {subtitle && (
              <motion.p
                className="mt-6 text-slate-400 max-w-2xl text-base sm:text-lg font-normal leading-relaxed relative z-10"
                variants={itemVariants}
              >
                {subtitle}
              </motion.p>
            )}

            {/* Action Matrix Route Node */}
            <motion.div variants={itemVariants} className="mt-10 w-full sm:w-auto relative z-10">
              {ctaLink !== '#' ? (
                <Link
                  href={ctaLink}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-xl bg-white text-slate-900 border border-white transition-all duration-200 hover:bg-slate-100 active:scale-95 shadow-sm group"
                >
                  <CalendarDaysIcon className="w-4 h-4 text-slate-900" strokeWidth={2} />
                  {ctaText}
                  <ArrowRightIcon className="w-4 h-4 text-slate-900 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
                </Link>
              ) : (
                <div className="text-slate-400 text-sm font-normal">
                  Contact directly via:{' '}
                  {contactEmail && <a href={`mailto:${contactEmail}`} className="text-white underline hover:text-slate-200 font-medium">{contactEmail}</a>}
                  {contactEmail && contactPhone && ' or '}
                  {contactPhone && <a href={`tel:${contactPhone}`} className="text-white underline hover:text-slate-200 font-medium">{contactPhone}</a>}
                  {!contactEmail && !contactPhone && 'No activation connection parameters configured.'}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}