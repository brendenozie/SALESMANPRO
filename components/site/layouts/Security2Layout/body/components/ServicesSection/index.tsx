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
  MagnifyingGlassIcon, // Added for analysis/discovery
} from '@heroicons/react/24/outline';
// Assuming useStoreContext, IStoreCategory, ISubcategory are imported correctly

// Map service names to Heroicon components for Security
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

// **Security-focused** Fallback Data (Max 6 for the grid)
const defaultSecuritySolutions: Offering[] = [
  { title: 'Cyber Threat Defense', desc: 'Proactive defense against ransomware, malware, and zero-day attacks with 24/7 monitoring.', iconComponent: ShieldCheckIcon },
  { title: 'Network Infrastructure Security', desc: 'Secure your core systems and cloud environments with robust firewalls and intrusion prevention.', iconComponent: ServerStackIcon },
  { title: 'Identity & Access Management (IAM)', desc: 'Control user access and credentials with multi-factor authentication and single sign-on solutions.', iconComponent: FingerPrintIcon },
  { title: 'Vulnerability Assessment', desc: 'Identify and patch security gaps before they are exploited using expert penetration testing.', iconComponent: BugAntIcon },
  { title: 'Regulatory Compliance', desc: 'Ensure adherence to GDPR, HIPAA, and industry-specific regulations with full audit support.', iconComponent: LockClosedIcon },
  { title: 'Managed Security Services (MSSP)', desc: 'Full outsourced security operations, threat hunting, and incident response management.', iconComponent: GlobeAltIcon },
];

// Framer Motion variants
const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08, // Subtle stagger
      type: 'spring',
      stiffness: 100,
      damping: 15,
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

// Helper to get icon
const getIcon = (title: string): React.ElementType => {
    const Icon = iconMap[title] || iconMap[title.split(' ')[0] as keyof typeof iconMap];
    return Icon || ShieldCheckIcon; 
};


export default function SecuritySolutionsSection({ name, slug, description, themeSettings, StoreCategory }: BusinessSectionProps) {
  
  // Professional Light Mode Color Palette (Trustworthy Deep Blue)
  // Use Deep Blue for Primary and a brighter blue for accent/shadows
  const primaryColor = themeSettings?.primaryColor || '#0056B3'; // Deep Blue
  const secondaryColor = themeSettings?.secondaryColor || '#007BFF'; // Standard Blue

  // --- Data Processing Logic (Kept from previous version) ---
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
  // --- End of Data Processing Logic ---

  const sectionTitle = name ? `${name} Solutions` : 'Our Core Security Solutions';
  const subtitle = description || 'Delivering robust, end-to-end protection against the evolving landscape of digital threats.';
  
  const cssVars = {
    '--primary': primaryColor,
    '--secondary': secondaryColor,
  } as React.CSSProperties;

  return (
    <AnimatePresence>
      <section 
        id="solutions" 
        // LIGHT MODE: Clean white background
        className="relative py-24 md:py-32 px-6 lg:px-12 bg-white text-gray-900 overflow-hidden" 
        style={cssVars}
      >
        {/* Subtle Background Detail (Soft, light pattern) */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0056B310_1px,transparent_1px)] [background-size:25px_25px] [background-position:0_0,12.5px_12.5px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header */}
          <motion.div
            className="text-center mb-16 max-w-4xl mx-auto"
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <p 
              className="text-lg font-semibold uppercase tracking-widest mb-3" 
              style={{ color: primaryColor }}
            >
              Protecting Your Assets
            </p>
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900">
              {sectionTitle}
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              {subtitle}
            </p>
          </motion.div>

          {/* Feature Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offeringsToShow.map((offer, idx) => {
              const Icon = offer.iconComponent;
              
              return (
                <motion.div
                  key={offer.id || idx}
                  custom={idx}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  // Card Styling: White/Light, professional shadow, color on hover
                  className="p-8 rounded-xl border border-gray-100 bg-white shadow-xl transition-all duration-300 transform hover:shadow-[0_15px_30px_-5px_rgba(0,86,179,0.2)] hover:scale-[1.02] flex flex-col justify-start"
                >
                  
                  {/* Icon & Title */}
                  <div className="flex items-start mb-4">
                    <div 
                      className="p-3 rounded-lg mr-4 flex-shrink-0"
                      style={{ 
                        backgroundColor: primaryColor,
                        boxShadow: `0 5px 15px -5px ${primaryColor}80`,
                      }}
                    >
                      {/* Icon Color is White for contrast */}
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                      {offer.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 flex-grow">
                    {offer.desc}
                  </p>
                  
                  {/* Call to Action */}
                  <Link
                    href={offer.id ? `/${slug}/service/${offer.id}` : `/${slug}/contact`}
                    className="inline-flex items-center gap-2 text-base font-semibold transition-all duration-300 group mt-auto"
                    style={{ color: primaryColor }}
                  >
                    Explore Service
                    <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          {/* Main CTA after the grid */}
          <motion.div 
            className="text-center mt-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Link
              href={`/${slug}/contact`}
              className="inline-flex items-center gap-3 text-lg font-bold px-10 py-4 rounded-full transition-all duration-300 transform hover:scale-[1.05] shadow-xl text-white"
              style={{ 
                background: primaryColor, 
                boxShadow: `0 10px 20px -5px ${primaryColor}80` 
              }}
            >
              <ShieldCheckIcon className="w-6 h-6" />
              Request a Security Consultation
            </Link>
            <p className="mt-4 text-sm text-gray-500">
                Start protecting your business today.
            </p>
          </motion.div>

        </div>
      </section>
    </AnimatePresence>
  );
}