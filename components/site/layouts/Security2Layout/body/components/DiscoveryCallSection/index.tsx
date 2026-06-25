'use client';

import React from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  BoltIcon,
} from '@heroicons/react/24/solid';

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
    name,
    slug,
    themeSettings = {},
    contactEmail,
    contactPhone,
    discoveryCall = {},
  } = storeFormData || {};

  const primaryColor = themeSettings.primaryColor || defaultFirmData.primaryColor;
  const accentColor = themeSettings.accentColor || defaultFirmData.accentColor;

  const defaultHeadline = 'Stop Guessing. Get a Real-Time {accent} Threat Assessment {accent} Now.';
  const defaultDescription =
    'Your security posture demands immediate clarity. Schedule a personalized, no-cost audit with our elite analysts to identify hidden vulnerabilities before they escalate into a crisis.';
  const defaultCtaText = 'Request Your Security Readiness Audit';

  const title = discoveryCall.headline || defaultHeadline.replace('{accent}', defaultFirmData.accentColor);
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
        duration: 0.3,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'linear' } },
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
    if (words.length > 1) {
      const lastWord = words[words.length - 1];
      const rest = words.slice(0, -1).join(' ');
      return (
        <>
          {rest}{' '}
          <span style={{ color: highlightColor }}>
            {lastWord.replace(/[?!.,]$/, '')}
          </span>
          {lastWord.match(/[?!.,]$/)?.[0]}
        </>
      );
    }
    return fullTitle;
  };

  return (
    <section id="security-readiness" className="relative py-28 md:py-36 bg-white text-gray-900 overflow-hidden border-b border-gray-100">
      
      {/* STRUCTURAL BACKGROUND TELEMETRY MESHGRID */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none border-x border-gray-900 max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border-r border-gray-900 h-full" />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* INTERPOLATED PERIMETER TERMINAL */}
        <motion.div
          className="border border-gray-100 bg-gray-50/40 p-8 md:p-16 relative text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* TOP INDEX TELEMETRY ACCESSORS */}
          <div className="absolute top-0 inset-x-0 h-8 border-b border-gray-100 flex items-center justify-between px-4 md:px-8 text-[9px] font-mono font-bold text-gray-400">
            <span>[SYS_DISPATCH_CALL_ROUTINE]</span>
            <span>SEC_LEVEL_A // {name?.toUpperCase().replace(/\s+/g, '_') || 'CYBERSHIELD'}</span>
          </div>

          <div className="mt-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                ACTION // DISCOVERY_TRIGGER
              </p>
            </div>

            <motion.h2 
              className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.1] mb-6"
              variants={itemVariants}
            >
              {renderTitleWithAccent(title, primaryColor)}
            </motion.h2>

            {subtitle && (
              <motion.p 
                className="text-xs font-mono text-gray-500 leading-relaxed max-w-3xl border-l border-gray-200 pl-4 mb-10"
                variants={itemVariants}
              >
                {subtitle}
              </motion.p>
            )}

            <motion.div variants={itemVariants}>
              {ctaLink && ctaLink !== '#' ? (
                <Link
                  href={ctaLink}
                  className="inline-flex items-center gap-4 text-xs font-mono font-black uppercase tracking-wider text-white bg-gray-950 hover:bg-gray-900 transition-colors py-4 px-6 border border-transparent hover:border-gray-950"
                >
                  <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
                  {ctaText}
                  <BoltIcon className="w-4 h-4" style={{ color: primaryColor }} />
                </Link>
              ) : (
                <div className="text-xs font-mono text-gray-400 border-t border-gray-100 pt-6">
                  CRITICAL COMMANDS: {' '}
                  {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="text-gray-900 underline underline-offset-4 hover:text-gray-600 mr-4">
                      [EMAIL // {contactEmail.toUpperCase()}]
                    </a>
                  )}
                  {contactPhone && (
                    <a href={`tel:${contactPhone}`} className="text-gray-900 underline underline-offset-4 hover:text-gray-600">
                      [COMMS // {contactPhone}]
                    </a>
                  )}
                  {!contactEmail && !contactPhone && '[CONFIGURE EXPLICIT TERMINAL ANCHORS]'}
                </div>
              )}
            </motion.div>
          </div>

          {/* LOWER DECORATIVE STATUS ANCHOR */}
          <div className="absolute bottom-3 right-4 hidden md:block text-[9px] font-mono font-bold text-gray-300">
            STATUS // READY_TO_EXECUTE
          </div>
        </motion.div>
      </div>
    </section>
  );
}