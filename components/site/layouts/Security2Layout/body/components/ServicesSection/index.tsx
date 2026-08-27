'use client';

import React from 'react';
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
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'linear' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.3,
      ease: 'linear',
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

  return (
    <AnimatePresence>
      <section 
        id="solutions" 
        className="relative py-28 md:py-36 px-6 lg:px-12 bg-white text-gray-900 border-b border-gray-100 overflow-hidden" 
      >
        {/* ASYMMETRIC HEADER SPLIT BLOCK */}
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-20 border-b border-gray-100 pb-12"
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">
                  SYSTEM_CAPABILITIES // ACTIVE
                </p>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.1]">
                {sectionTitle}
              </h2>
            </div>
            <p className="text-xs font-mono text-gray-400 leading-relaxed max-w-sm lg:mt-8">
              {subtitle}
            </p>
          </motion.div>

          {/* HIGH-DENSITY PROTOCOL GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-gray-100">
            {offeringsToShow.map((offer, idx) => {
              const Icon = offer.iconComponent;
              const hexIndex = `0${idx + 1}`.slice(-2);
              
              return (
                <motion.div
                  key={offer.id || idx}
                  custom={idx}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className="p-8 border-r border-b border-gray-100 bg-white hover:bg-gray-50/50 transition-colors flex flex-col justify-between group relative"
                >
                  <div>
                    {/* CARD SYSTEM HEADER TRACK */}
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-[10px] font-mono font-bold text-gray-300 group-hover:text-gray-900 transition-colors">
                        [NODE_LN_{hexIndex}]
                      </span>
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors stroke-[1.5]" />
                    </div>

                    {/* INTERFACE NODE DATA */}
                    <h3 className="text-sm font-mono font-black uppercase tracking-tight text-gray-900 mb-3">
                      {offer.title}
                    </h3>
                    <p className="text-xs font-mono text-gray-400 leading-relaxed mb-8">
                      {offer.desc}
                    </p>
                  </div>
                  
                  {/* UNIFIED INTERFACE DISPATCH ACTION */}
                  <Link
                    href={offer.id ? `/${slug}/service/${offer.id}` : `/${slug}/contact`}
                    className="inline-flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors mt-auto"
                  >
                    Execute Session Route
                    <ArrowRightIcon className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          {/* TERMINAL FOOTER DISPATCH LINK */}
          <motion.div 
            className="mt-16 pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col gap-1 text-left w-full md:w-auto">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">TRANSMISSION_GATEWAY</span>
              <p className="text-xs font-mono text-gray-400">Initialize a localized secure audit stream link.</p>
            </div>

            <Link
              href={`/${slug}/contact`}
              className="inline-flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider py-4 px-8 text-white transition-opacity w-full md:w-auto justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <ShieldCheckIcon className="w-4 h-4" />
              Request System Audit
            </Link>
          </motion.div>

        </div>
      </section>
    </AnimatePresence>
  );
}