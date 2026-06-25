'use client';

import React from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'; // Swapped to fine stroke outline icons for precision feel

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

const defaultFirmData = {
  name: 'CyberShield',
  primaryColor: '#00A880', 
  secondaryColor: '#3B82F6', 
  accentColor: '#FFC107', 
};

export default function SecurityReadinessSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };

  const {
    slug,
    themeSettings = {},
    contactEmail,
    contactPhone,
    discoveryCall = {},
  } = storeFormData || {};

  const primaryColor = themeSettings.primaryColor || defaultFirmData.primaryColor;
  const accentColor = themeSettings.accentColor || defaultFirmData.accentColor;

  const defaultHeadline = `Stop Guessing. Get a Real-Time Threat Assessment Now.`;
  const defaultDescription =
    'Your security posture demands immediate clarity. Schedule a personalized, no-cost audit with our elite analysts to identify hidden vulnerabilities before they escalate into a crisis.';
  const defaultCtaText = 'Request Security Readiness Audit';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const elementVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 150, damping: 22 }
    }
  };

  const renderTitleWithAccent = (fullTitle: string, highlightColor: string) => {
    if (fullTitle.includes('{accent}')) {
      const parts = fullTitle.split(/\{accent\}(.*?)\{\/accent\}/g);
      return parts.map((part, idx) => (
        idx % 2 === 1 ? (
          <span key={idx} style={{ color: highlightColor }}>{part}</span>
        ) : (
          <React.Fragment key={idx}>{part}</React.Fragment>
        )
      ));
    }

    const words = fullTitle.split(' ');
    if (words.length > 2) {
      const lastTwoWords = words.slice(-2).join(' ');
      const rest = words.slice(0, -2).join(' ');
      return (
        <>
          {rest}{' '}
          <span className="font-black" style={{ color: highlightColor }}>
            {lastTwoWords}
          </span>
        </>
      );
    }
    return fullTitle;
  };

  return (
    <AnimatePresence>
      <section 
        id="security-readiness"
        className="relative py-24 md:py-32 px-6 lg:px-12 bg-white text-gray-900 overflow-hidden border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch gap-16 lg:gap-24 relative z-10">
          
          {/* LEFT TELEMETRY METRIC BLOCK */}
          <motion.div 
            className="w-full lg:w-5/12 flex flex-col justify-between border border-gray-100 p-8 bg-gray-50/50 rounded-2xl relative"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Top Diagnostic Header */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    System Diagnostic Mode
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400">SYS_REF // 2026</span>
              </div>

              {/* Telemetry Vectors */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 bg-white border border-gray-100 rounded-xl">
                  <ShieldCheckIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 font-mono">VULN_SCAN_ACTIVE</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Continuous peripheral infrastructure perimeter probing maps unknown vectors.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-white border border-gray-100 rounded-xl">
                  <CpuChipIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 font-mono">THREAT_INTEL_SYNC</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Real-time mapping against updated localized database threat indicators.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-white border border-gray-100 rounded-xl">
                  <ExclamationTriangleIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 font-mono">ZERO_DAY_READY</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Deployment frameworks isolated to secure business vector continuity.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom System Counter Status */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-200 font-mono">
              <div>
                <span className="text-[10px] block text-gray-400 uppercase">Response Time</span>
                <span className="text-xl font-bold text-gray-900 tracking-tight">&lt; 15 Mins</span>
              </div>
              <div>
                <span className="text-[10px] block text-gray-400 uppercase">Audit Architecture</span>
                <span className="text-xl font-bold text-gray-900 tracking-tight">ISO-Aligned</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT ACTION CONTENT BLOCK */}
          <motion.div 
            className="w-full lg:w-7/12 flex flex-col justify-center text-left"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={elementVariants} className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                Securing Perimeter Continuity
              </p>
            </motion.div>

            <motion.h2 
              className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1] mb-6"
              variants={elementVariants}
            >
              {renderTitleWithAccent(title, primaryColor)}
            </motion.h2>

            {subtitle && (
              <motion.p 
                className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-2xl mb-10"
                variants={elementVariants}
              >
                {subtitle}
              </motion.p>
            )}

            <motion.div variants={elementVariants}>
              {ctaLink ? (
                <Link
                  href={ctaLink}
                  className="inline-flex items-center gap-3 px-8 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-white transition-all duration-200 rounded-xl hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  {ctaText}
                  <ArrowRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              ) : (
                <div className="text-xs font-mono text-gray-400 border border-dashed border-gray-200 p-4 rounded-xl inline-block">
                  No active interface route configured.{' '}
                  {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="underline font-bold text-gray-700 hover:text-black mx-1">
                      {contactEmail}
                    </a>
                  )}
                  {contactPhone && (
                    <>
                      or <a href={`tel:${contactPhone}`} className="underline font-bold text-gray-700 hover:text-black ml-1">{contactPhone}</a>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>

        </div>
      </section>
    </AnimatePresence>
  );
}