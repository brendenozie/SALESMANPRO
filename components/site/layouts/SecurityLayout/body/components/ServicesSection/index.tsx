'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  ShieldCheckIcon, 
  ServerStackIcon, 
  FingerPrintIcon, 
  BugAntIcon, 
  LockClosedIcon, 
  GlobeAltIcon, 
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const iconMap: Record<string, React.ElementType> = {
  'Cyber Threat Defense': ShieldCheckIcon,
  'Network Security': ServerStackIcon,
  'Identity Access': FingerPrintIcon,
  'Vulnerability Assessment': BugAntIcon,
  'Regulatory Compliance': LockClosedIcon,
  'Managed Security': GlobeAltIcon,
  'Security Audit': MagnifyingGlassIcon,
};

type Offering = {
  title: string;
  desc: string;
  id?: string;
  iconComponent: React.ElementType;
};

const defaultSecuritySolutions: Offering[] = [
  { title: 'Cyber Threat Defense', desc: 'Proactive defense against ransomware, malware, and zero-day attacks with 24/7 monitoring.', iconComponent: ShieldCheckIcon },
  { title: 'Network Infrastructure Security', desc: 'Secure your core systems and cloud environments with robust firewalls and intrusion prevention.', iconComponent: ServerStackIcon },
  { title: 'Identity & Access Management (IAM)', desc: 'Control user access and credentials with multi-factor authentication and single sign-on solutions.', iconComponent: FingerPrintIcon },
  { title: 'Vulnerability Assessment', desc: 'Identify and patch security gaps before they are exploited using expert penetration testing.', iconComponent: BugAntIcon },
  { title: 'Regulatory Compliance', desc: 'Ensure adherence to GDPR, HIPAA, and industry-specific regulations with full audit support.', iconComponent: LockClosedIcon },
  { title: 'Managed Security Services (MSSP)', desc: 'Full outsourced security operations, threat hunting, and incident response management.', iconComponent: GlobeAltIcon },
];

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: 'spring',
      stiffness: 150,
      damping: 20,
    },
  }),
};

interface BusinessSectionProps {
  name: string | undefined | null;
  slug: string | undefined | null;
  description: string | undefined | null;
  themeSettings: {
    primaryColor?: string;
    secondaryColor?: string;
  } | undefined | null;
  StoreCategory: any[];
}

const getIcon = (title: string): React.ElementType => {
  const Icon = iconMap[title] || iconMap[title.split(' ')[0] as keyof typeof iconMap];
  return Icon || ShieldCheckIcon; 
};

export default function SecuritySolutionsSection({ name, slug, description, themeSettings, StoreCategory }: BusinessSectionProps) {
  const primaryColor = themeSettings?.primaryColor || '#00A880'; 
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6'; 

  const hasCategories = Array.isArray(StoreCategory) && StoreCategory.length > 0;
  let offeringsToShow: Offering[] = [];

  if (hasCategories) {
    let items: any[] = [];
    if (StoreCategory.length < 3) {
      items = StoreCategory.flatMap(cat => cat.subcategories || []).slice(0, 6);
    } else {
      items = (StoreCategory as any[]).slice(0, 6);
    }

    offeringsToShow = items.map(item => ({
        title: item.displayName || item.name || 'Security Service',
        desc: item.description || `Explore our specialized ${item.displayName || item.name} solutions.`,
        id: item.id,
        iconComponent: getIcon(item.displayName || item.name || ''),
    }));
  } else {
    offeringsToShow = defaultSecuritySolutions;
  }

  const sectionTitle = name ? `${name} Solutions` : 'Our Core Security Solutions';
  const subtitle = description || 'Delivering robust, end-to-end protection against the evolving landscape of digital threats.';
  
  const cssVars = {
    '--primary': primaryColor,
    '--secondary': secondaryColor,
  } as React.CSSProperties;

  return (
    <AnimatePresence>
      <section 
        id="services" 
        className="relative py-28 md:py-36 px-6 lg:px-12 bg-white text-gray-900 overflow-hidden border-b border-gray-100" 
        style={cssVars}
      >
        {/* STRUCTURAL BLUEPRINT MATRIX BACKGROUND */}
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#00A88010,transparent)]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* CONTROL SECTION HEADER */}
          <motion.div
            className="mb-20 text-left max-w-3xl"
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: primaryColor }} />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                Operational Framework
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">
              {sectionTitle}
            </h2>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          </motion.div>

          {/* ASYMMETRIC COMMAND GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offeringsToShow.map((offer, idx) => {
              const Icon = offer.iconComponent;
              
              return (
                <motion.div
                  key={offer.id || idx}
                  custom={idx}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group relative p-8 rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Subtle active accent corner indicator */}
                  <div 
                    className="absolute top-0 left-0 w-full h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    style={{ backgroundColor: primaryColor }}
                  />

                  <div>
                    {/* ICON ARCHITECTURE */}
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 transition-transform duration-300 group-hover:scale-105"
                      style={{ 
                        backgroundColor: primaryColor,
                        boxShadow: `0 8px 24px -6px ${primaryColor}40`,
                      }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* TYPOGRAPHY CORE */}
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-3 group-hover:text-gray-900">
                      {offer.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-8">
                      {offer.desc}
                    </p>
                  </div>
                  
                  {/* FLOATING ACTION ARROW */}
                  <Link
                    href={offer.id ? `/${slug}/service/${offer.id}` : `/${slug}/contact`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase transition-colors duration-200 mt-auto"
                    style={{ color: primaryColor }}
                  >
                    <span>Analyze Scope</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          {/* COMPACT FOOTER ANCHOR */}
          <motion.div 
            className="mt-20 flex flex-col sm:flex-row items-center justify-between p-8 rounded-2xl bg-gray-50 border border-gray-100 gap-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="text-left">
              <h4 className="text-base font-bold text-gray-900">Need an enterprise matrix overview?</h4>
              <p className="text-xs text-gray-500 mt-0.5">Let our engineers map out your target infrastructure requirements.</p>
            </div>

            <Link href={`/${slug}/contact`}>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 font-bold tracking-wide text-xs uppercase px-6 py-4 rounded-xl text-white shadow-md"
                style={{ 
                  backgroundColor: primaryColor, 
                  boxShadow: `0 6px 20px -4px ${primaryColor}30`,
                }}
              >
                <ShieldCheckIcon className="w-4 h-4" />
                Initialize System Audit
              </motion.button>
            </Link>
          </motion.div>

        </div>
      </section>
    </AnimatePresence>
  );
}